import argparse
import sqlite3
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DB = ROOT / "backend" / "aurasync.db"
DEFAULT_STORAGE = ROOT / "storage"
SUPPORTED_AUDIO_FORMATS = {"wav"}
DURATION_TOLERANCE_SECONDS = 1.0


def fail(problems: list[str], message: str) -> None:
    problems.append(message)


def audit(db_path: Path, storage_dir: Path) -> list[str]:
    problems: list[str] = []
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        audio_rows = conn.execute(
            """
            SELECT c.title, c.type, c.duration_seconds, a.id, a.storage_path, a.format,
                   a.sample_rate, a.channels, a.cdn_url
            FROM audio_assets a
            JOIN content_items c ON c.id = a.content_item_id
            ORDER BY c.type, c.title
            """
        ).fetchall()
        image_rows = conn.execute(
            "SELECT id, title, storage_path, external_url, cdn_url FROM image_assets ORDER BY title"
        ).fetchall()
        license_rows = conn.execute(
            "SELECT asset_type, asset_id, license_name, source_name FROM asset_licenses"
        ).fetchall()
    finally:
        conn.close()

    licenses = {(row["asset_type"], row["asset_id"]): row for row in license_rows}

    for row in audio_rows:
        title = row["title"]
        storage_path = row["storage_path"]
        path = storage_dir / storage_path
        if row["cdn_url"]:
            fail(problems, f"{title}: audio has cdn_url: {row['cdn_url']}")
        if ("audio", row["id"]) not in licenses:
            fail(problems, f"{title}: audio missing license: {storage_path}")
        expected_format = (row["format"] or "").lower().lstrip(".")
        if expected_format not in SUPPORTED_AUDIO_FORMATS:
            fail(problems, f"{title}: unsupported audio format {expected_format}: {storage_path}")
        if path.suffix.lower().lstrip(".") != expected_format:
            fail(problems, f"{title}: extension and format mismatch: {storage_path}")
        if not path.exists():
            fail(problems, f"{title}: missing audio file: {storage_path}")
            continue
        try:
            with wave.open(str(path), "rb") as wav:
                channels = wav.getnchannels()
                sample_rate = wav.getframerate()
                duration = wav.getnframes() / sample_rate
        except wave.Error as exc:
            fail(problems, f"{title}: invalid WAV {storage_path}: {exc}")
            continue
        if row["channels"] is not None and channels != row["channels"]:
            fail(problems, f"{title}: channel mismatch {channels} != {row['channels']}: {storage_path}")
        if row["sample_rate"] is not None and sample_rate != row["sample_rate"]:
            fail(problems, f"{title}: sample-rate mismatch {sample_rate} != {row['sample_rate']}: {storage_path}")
        expected_duration = row["duration_seconds"]
        if expected_duration is not None and abs(duration - expected_duration) > DURATION_TOLERANCE_SECONDS:
            fail(problems, f"{title}: duration mismatch {duration:.1f}s != {expected_duration}s: {storage_path}")

    for row in image_rows:
        title = row["title"]
        storage_path = row["storage_path"]
        if row["external_url"] or row["cdn_url"]:
            fail(problems, f"{title}: image still has external/cdn URL")
        if ("image", row["id"]) not in licenses:
            fail(problems, f"{title}: image missing license")
        if not storage_path:
            fail(problems, f"{title}: image missing storage_path")
            continue
        path = storage_dir / storage_path
        if not path.exists():
            fail(problems, f"{title}: missing image file: {storage_path}")
        elif path.suffix.lower() != ".svg":
            fail(problems, f"{title}: expected local SVG image: {storage_path}")
        elif "<svg" not in path.read_text(encoding="utf-8", errors="ignore")[:200].lower():
            fail(problems, f"{title}: image is not valid SVG-like content: {storage_path}")

    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit AuraSync media assets before deploy.")
    parser.add_argument("--db", type=Path, default=DEFAULT_DB)
    parser.add_argument("--storage", type=Path, default=DEFAULT_STORAGE)
    args = parser.parse_args()

    problems = audit(args.db, args.storage)
    if problems:
        print("Media audit failed:")
        for problem in problems:
            print(f"- {problem}")
        return 1
    print("Media audit passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
