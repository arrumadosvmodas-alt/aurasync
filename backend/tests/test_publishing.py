"""Regra crítica: asset sem licença não publica."""

from datetime import datetime, timezone

from app.models import AssetLicense, AudioAsset, ContentItem
from app.services.publishing import can_publish, missing_licenses


def _content_with_audio(db, licensed: bool) -> ContentItem:
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


def test_endpoint_admin_bloqueia_publicacao_sem_licenca(client, db):
    item = _content_with_audio(db, licensed=False)
    db.commit()
    resp = client.post(
        f"/admin/content/{item.id}/publish", headers={"X-Admin-Token": "dev-admin-token"}
    )
    assert resp.status_code == 422
    assert "licenciamento" in resp.json()["detail"]
