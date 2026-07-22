from pathlib import Path
import wave

from ..core.config import settings
from ..models import AudioAsset, ContentItem


SUPPORTED_AUDIO_FORMATS = {"wav"}
DURATION_TOLERANCE_SECONDS = 1.0


def resolve_storage_path(storage_path: str) -> Path:
    normalized = storage_path.replace("\\", "/").lstrip("/")
    return settings.storage_dir / normalized


def validate_audio_asset(audio: AudioAsset, content: ContentItem | None = None) -> list[str]:
    problems: list[str] = []
    path = resolve_storage_path(audio.storage_path)

    if not path.exists():
        return [f"audio inexistente: {audio.storage_path}"]
    if not path.is_file():
        return [f"audio nao e arquivo: {audio.storage_path}"]

    expected_format = (audio.format or "").lower().lstrip(".")
    actual_extension = path.suffix.lower().lstrip(".")
    if expected_format not in SUPPORTED_AUDIO_FORMATS:
        problems.append(f"formato de audio nao suportado: {audio.storage_path} ({audio.format})")
    if actual_extension != expected_format:
        problems.append(
            f"extensao diferente do formato cadastrado: {audio.storage_path} ({actual_extension} != {expected_format})"
        )

    if expected_format == "wav":
        try:
            with wave.open(str(path), "rb") as wav:
                channels = wav.getnchannels()
                sample_rate = wav.getframerate()
                frames = wav.getnframes()
                duration_seconds = frames / sample_rate if sample_rate else 0
        except wave.Error:
            return [*problems, f"audio WAV invalido ou corrompido: {audio.storage_path}"]

        if audio.channels is not None and channels != audio.channels:
            problems.append(f"canais do audio divergentes: {audio.storage_path} ({channels} != {audio.channels})")
        if audio.sample_rate is not None and sample_rate != audio.sample_rate:
            problems.append(
                f"sample rate do audio divergente: {audio.storage_path} ({sample_rate} != {audio.sample_rate})"
            )
        if content and content.duration_seconds is not None:
            delta = abs(duration_seconds - content.duration_seconds)
            if delta > DURATION_TOLERANCE_SECONDS:
                problems.append(
                    f"duracao do audio divergente: {audio.storage_path} ({duration_seconds:.1f}s != {content.duration_seconds}s)"
                )

    return problems
