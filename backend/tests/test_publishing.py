"""Regra crítica: asset sem licença não publica."""

from datetime import datetime, timezone
import wave

from app.core.config import settings
from app.models import AssetLicense, AudioAsset, ContentItem
from app.services.publishing import can_publish, missing_licenses


def _write_test_wav(relative_path: str, duration_seconds: float = 1.0) -> None:
    path = settings.storage_dir / relative_path
    path.parent.mkdir(parents=True, exist_ok=True)
    sample_rate = 44100
    frames = int(sample_rate * duration_seconds)
    silence = b"\x00\x00" * 2 * frames
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(silence)


def _content_with_audio(db, licensed: bool) -> ContentItem:
    _write_test_wav("audio/chuva.wav")
    item = ContentItem(title="Chuva Teste", type="soundscape", spiritual_axis=["water"])
    db.add(item)
    db.flush()
    audio = AudioAsset(content_item_id=item.id, storage_path="audio/chuva.wav", format="wav")
    db.add(audio)
    db.flush()
    if licensed:
        db.add(
            AssetLicense(
                asset_type="audio",
                asset_id=audio.id,
                source_name="Freesound",
                license_name="CC0",
                verified_at=datetime.now(timezone.utc),
            )
        )
        db.flush()
    return item


def test_audio_sem_licenca_bloqueia_publicacao(db):
    item = _content_with_audio(db, licensed=False)
    assert not can_publish(db, item)
    assert any("sem licença" in p for p in missing_licenses(db, item))


def test_audio_com_licenca_publica(db):
    item = _content_with_audio(db, licensed=True)
    assert can_publish(db, item)


def test_conteudo_sem_audio_bloqueia_exceto_respiracao(db):
    sem_audio = ContentItem(title="Vazio", type="music")
    respiracao = ContentItem(title="Respiração 4-7-8", type="breathing")
    db.add_all([sem_audio, respiracao])
    db.flush()
    assert not can_publish(db, sem_audio)
    assert can_publish(db, respiracao)


def test_endpoint_admin_bloqueia_publicacao_sem_licenca(client, db, admin_headers):
    item = _content_with_audio(db, licensed=False)
    db.commit()
    resp = client.post(f"/admin/content/{item.id}/publish", headers=admin_headers)
    assert resp.status_code == 422
    assert "licenciamento" in resp.json()["detail"]


def test_audio_com_extensao_incorreta_bloqueia_publicacao(db):
    item = ContentItem(title="Audio Quebrado", type="music", duration_seconds=1)
    db.add(item)
    db.flush()
    _write_test_wav("audio/audio-quebrado.mp3")
    audio = AudioAsset(
        content_item_id=item.id,
        storage_path="audio/audio-quebrado.mp3",
        format="mp3",
        sample_rate=44100,
        channels=2,
    )
    db.add(audio)
    db.flush()
    db.add(
        AssetLicense(
            asset_type="audio",
            asset_id=audio.id,
            source_name="AuraSync",
            license_name="Proprietary",
            verified_at=datetime.now(timezone.utc),
        )
    )
    db.flush()

    problems = missing_licenses(db, item)
    assert not can_publish(db, item)
    assert any("formato de audio nao suportado" in p for p in problems)
