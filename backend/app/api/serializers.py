import os

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.config import settings
from ..models import AssetLicense, AudioAsset, ContentItem, ImageAsset
from ..schemas.schemas import (
    AudioAssetOut,
    BinauralParamsOut,
    ContentItemOut,
    ImageAssetOut,
)

PUBLIC_AUDIO_FALLBACK_BY_TYPE = {
    "binaural": "https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav",
    "soundscape": "https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav",
    "meditation": "https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav",
    "music": "https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav",
}


def _media_url(storage_path: str | None) -> str | None:
    if not storage_path:
        return None
    return f"{settings.media_base_url}/{storage_path.replace('\\', '/')}"


def _attribution_for(db: Session, asset_type: str, asset_id: str) -> str | None:
    # Cache local por sessão/requisição para evitar problema N+1 sobre conexões lentas
    if not hasattr(db, "_license_cache"):
        try:
            all_lics = db.execute(select(AssetLicense)).scalars().all()
            db._license_cache = {(l.asset_type, l.asset_id): l for l in all_lics}
        except Exception:
            db._license_cache = {}
            
    lic = db._license_cache.get((asset_type, asset_id))
    if lic is None or not lic.attribution_required:
        return None
    return lic.attribution_text or f"{lic.author_name or lic.source_name} — {lic.license_name}"


def _image_url(img: ImageAsset) -> str | None:
    local_url = _media_url(img.storage_path)
    # Em dev/local e em hosts com storage montado, prioriza a mídia do projeto.
    # Em Vercel, /media não é montado; nesse caso usa CDN/externa como fallback seguro.
    if os.environ.get("VERCEL") == "1":
        return img.cdn_url or img.external_url or local_url
    return local_url or img.cdn_url or img.external_url


def _audio_url(audio: AudioAsset, content_type: str) -> str:
    if audio.cdn_url:
        return audio.cdn_url
    if os.environ.get("VERCEL") == "1":
        return PUBLIC_AUDIO_FALLBACK_BY_TYPE.get(content_type, "")
    return _media_url(audio.storage_path) or ""


def serialize_image(db: Session, img: ImageAsset) -> ImageAssetOut:
    return ImageAssetOut(
        id=img.id,
        title=img.title,
        url=_image_url(img),
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
                url=_audio_url(audio, item.type),
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
