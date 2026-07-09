from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.config import settings
from ..models import AssetLicense, ContentItem, ImageAsset
from ..schemas.schemas import (
    AudioAssetOut,
    BinauralParamsOut,
    ContentItemOut,
    ImageAssetOut,
)


def _media_url(storage_path: str | None) -> str | None:
    if not storage_path:
        return None
    return f"{settings.media_base_url}/{storage_path.replace('\\', '/')}"


def _attribution_for(db: Session, asset_type: str, asset_id: str) -> str | None:
    lic = db.execute(
        select(AssetLicense).where(
            AssetLicense.asset_type == asset_type, AssetLicense.asset_id == asset_id
        )
    ).scalar_one_or_none()
    if lic is None or not lic.attribution_required:
        return None
    return lic.attribution_text or f"{lic.author_name or lic.source_name} — {lic.license_name}"


def serialize_image(db: Session, img: ImageAsset) -> ImageAssetOut:
    return ImageAssetOut(
        id=img.id,
        title=img.title,
        url=_media_url(img.storage_path) or img.external_url,
        colors=img.colors or [],
        visual_tags=img.visual_tags or [],
        spiritual_axis=img.spiritual_axis or [],
        attribution=_attribution_for(db, "image", img.id),
    )


def serialize_content(db: Session, item: ContentItem) -> ContentItemOut:
    attributions: list[str] = []
    audio_out = []
    for audio in item.audio_assets:
        audio_out.append(
            AudioAssetOut(
                id=audio.id,
                url=audio.cdn_url or _media_url(audio.storage_path) or "",
                format=audio.format,
                sample_rate=audio.sample_rate,
                channels=audio.channels,
                is_loopable=audio.is_loopable,
            )
        )
        attr = _attribution_for(db, "audio", audio.id)
        if attr:
            attributions.append(attr)

    cover = serialize_image(db, item.cover_image) if item.cover_image else None
    if cover and cover.attribution:
        attributions.append(cover.attribution)

    return ContentItemOut(
        id=item.id,
        title=item.title,
        description=item.description,
        type=item.type,
        spiritual_axis=item.spiritual_axis or [],
        mood_tags=item.mood_tags or [],
        duration_seconds=item.duration_seconds,
        energy_level=item.energy_level,
        is_premium=item.is_premium,
        is_active=item.is_active,
        published_at=item.published_at,
        cover_image=cover,
        audio=audio_out,
        binaural=BinauralParamsOut.model_validate(item.binaural_params)
        if item.binaural_params
        else None,
        attributions=attributions,
    )
