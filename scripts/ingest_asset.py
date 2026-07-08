"""Ingestão manual de assets externos com registro obrigatório de licença.

Fluxo: validar licença -> copiar arquivo para storage/ -> criar rascunho no
catálogo (não publicado) -> registrar licença em asset_licenses.
A publicação continua manual, via CMS (que revalida as licenças).

Uso (a partir da raiz do repositório):
    backend/.venv/Scripts/python scripts/ingest_asset.py caminho/arquivo.mp3 \
        --kind audio --title "Chuva Leve em Floresta" --content-type soundscape \
        --source "Freesound" --source-url "https://freesound.org/..." \
        --author "fulano" --license "CC BY 4.0" \
        --license-url "https://creativecommons.org/licenses/by/4.0/" \
        --attribution "Chuva Leve por fulano (Freesound), CC BY 4.0" \
        --axes water earth --moods calm gentle
"""

import argparse
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_DIR / "backend"))

from app.core.config import settings  # noqa: E402
from app.db import Base, SessionLocal, engine  # noqa: E402
from app.models import AssetLicense, AudioAsset, ContentItem, ImageAsset  # noqa: E402

# Licenças aceitas sem revisão extra; o resto exige --force com justificativa.
SAFE_LICENSES = {"public domain", "cc0", "cc by", "cc by 4.0", "cc by 3.0", "pixabay", "unsplash", "pexels"}
BLOCKED_LICENSES = {"cc by-nc", "cc by-nc-sa", "cc by-nc-nd", "cc by-nd"}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("file", type=Path)
    parser.add_argument("--kind", choices=["audio", "image"], required=True)
    parser.add_argument("--title", required=True)
    parser.add_argument("--content-type", default="soundscape",
                        choices=["music", "meditation", "soundscape", "binaural", "breathing"])
    parser.add_argument("--source", required=True, help="nome da fonte (ex.: Freesound)")
    parser.add_argument("--source-url", required=True)
    parser.add_argument("--author", default=None)
    parser.add_argument("--license", required=True, dest="license_name")
    parser.add_argument("--license-url", default=None)
    parser.add_argument("--attribution", default=None,
                        help="texto de atribuição; obrigatório para licenças CC BY")
    parser.add_argument("--axes", nargs="*", default=[])
    parser.add_argument("--moods", nargs="*", default=[])
    parser.add_argument("--duration", type=int, default=None, help="segundos (áudio)")
    parser.add_argument("--force", action="store_true",
                        help="aceita licença fora da lista segura (revisão manual feita)")
    args = parser.parse_args()

    lic = args.license_name.strip().lower()
    if any(blocked in lic for blocked in BLOCKED_LICENSES):
        sys.exit(f"ERRO: licença '{args.license_name}' é NC/ND — incompatível com o AuraSync.")
    if not any(safe in lic for safe in SAFE_LICENSES) and not args.force:
        sys.exit(
            f"ERRO: licença '{args.license_name}' fora da lista segura. "
            "Revise docs/LICENCAS.md e repita com --force se estiver tudo certo."
        )
    if "cc by" in lic and "cc0" not in lic and not args.attribution:
        sys.exit("ERRO: CC BY exige --attribution.")
    if not args.file.exists():
        sys.exit(f"ERRO: arquivo não encontrado: {args.file}")

    subdir = "audio" if args.kind == "audio" else "images"
    dest_dir = settings.storage_dir / subdir
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / args.file.name
    shutil.copy2(args.file, dest)
    storage_path = f"{subdir}/{args.file.name}"

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if args.kind == "audio":
            item = ContentItem(
                title=args.title,
                type=args.content_type,
                spiritual_axis=args.axes,
                mood_tags=args.moods,
                duration_seconds=args.duration,
                is_active=True,
                published_at=None,  # rascunho: publicar via CMS
            )
            db.add(item)
            db.flush()
            asset = AudioAsset(
                content_item_id=item.id,
                storage_path=storage_path,
                format=args.file.suffix.lstrip(".").lower() or "unknown",
            )
            db.add(asset)
            db.flush()
            asset_type, asset_id = "audio", asset.id
            created = f"content_item {item.id} (rascunho) + audio_asset {asset.id}"
        else:
            img = ImageAsset(
                title=args.title,
                storage_path=storage_path,
                spiritual_axis=args.axes,
                visual_mood=args.moods,
            )
            db.add(img)
            db.flush()
            asset_type, asset_id = "image", img.id
            created = f"image_asset {img.id}"

        db.add(
            AssetLicense(
                asset_type=asset_type,
                asset_id=asset_id,
                source_name=args.source,
                source_url=args.source_url,
                author_name=args.author,
                license_name=args.license_name,
                license_url=args.license_url,
                attribution_required=bool(args.attribution),
                attribution_text=args.attribution,
                commercial_use_allowed=True,
                derivative_allowed="nd" not in lic,
                verified_at=datetime.now(timezone.utc),
            )
        )
        db.commit()
        print(f"OK: {created}")
        print(f"arquivo: {dest}")
        print("licença registrada — publique via CMS quando a curadoria aprovar.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
