"""Regra crítica de compliance: nenhum asset publica sem licença registrada."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AssetLicense, ContentItem


def missing_licenses(db: Session, content: ContentItem) -> list[str]:
    """Retorna descrições dos assets do conteúdo que não têm licença registrada."""
    problems: list[str] = []

    def has_license(asset_type: str, asset_id: str) -> bool:
        return (
            db.execute(
                select(AssetLicense.id).where(
                    AssetLicense.asset_type == asset_type,
                    AssetLicense.asset_id == asset_id,
                )
            ).first()
            is not None
        )

    for audio in content.audio_assets:
        if not has_license("audio", audio.id):
            problems.append(f"áudio sem licença: {audio.storage_path}")
    if content.cover_image_id and not has_license("image", content.cover_image_id):
        problems.append(f"imagem de capa sem licença: {content.cover_image_id}")
    # Práticas de respiração podem ser puramente visuais; os demais tipos exigem áudio.
    if content.type != "breathing" and not content.audio_assets:
        problems.append("conteúdo sem nenhum asset de áudio")
    return problems


def can_publish(db: Session, content: ContentItem) -> bool:
    return not missing_licenses(db, content)
