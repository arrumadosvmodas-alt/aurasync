from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from .serializers import serialize_content, serialize_image
from ..db import get_db
from ..models import ContentItem, ImageAsset, Playlist, PlaylistItem
from ..schemas.schemas import ContentItemOut, ImageAssetOut

router = APIRouter(tags=["catalog"])

CONTENT_TYPES = ("binaural", "meditation", "soundscape", "music", "breathing")


def _content_options():
    return (
        selectinload(ContentItem.audio_assets),
        joinedload(ContentItem.cover_image),
        joinedload(ContentItem.binaural_params),
    )


def _published_content_query():
    return (
        select(ContentItem)
        .options(*_content_options())
        .where(
            ContentItem.is_active.is_(True),
            ContentItem.published_at.is_not(None),
        )
    )


@router.get("/catalog/complete")
def get_complete_catalog(db: Session = Depends(get_db)):
    """Return the full catalog grouped by category."""

    content_items = db.execute(_published_content_query()).scalars().unique().all()
    by_type = {content_type: [] for content_type in CONTENT_TYPES}
    for item in content_items:
        if item.type in by_type:
            by_type[item.type].append(item)

    images = db.execute(select(ImageAsset)).scalars().all()
    playlists = db.execute(
        select(Playlist).options(selectinload(Playlist.items))
    ).scalars().unique().all()

    return {
        "catalog": {
            "binaural": {
                "name": "Sessoes Binaurais",
                "icon": "waveform",
                "description": "Batidas de frequencias especificas para estados mentais",
                "count": len(by_type["binaural"]),
                "items": [serialize_content(db, item) for item in by_type["binaural"]],
            },
            "meditation": {
                "name": "Meditacoes Guiadas",
                "icon": "spa",
                "description": "Praticas meditativas orientadas com duracoes variadas",
                "count": len(by_type["meditation"]),
                "items": [serialize_content(db, item) for item in by_type["meditation"]],
            },
            "soundscape": {
                "name": "Sons da Natureza",
                "icon": "tree",
                "description": "Ambientes sonoros naturais para relaxamento e imersao",
                "count": len(by_type["soundscape"]),
                "items": [serialize_content(db, item) for item in by_type["soundscape"]],
            },
            "music": {
                "name": "Musica Ambiente",
                "icon": "music",
                "description": "Composicoes harmonicas para relaxamento e expansao",
                "count": len(by_type["music"]),
                "items": [serialize_content(db, item) for item in by_type["music"]],
            },
            "breathing": {
                "name": "Praticas de Respiracao",
                "icon": "weather-windy",
                "description": "Exercicios respiratorios com tecnicas especificas",
                "count": len(by_type["breathing"]),
                "items": [serialize_content(db, item) for item in by_type["breathing"]],
            },
        },
        "images": {
            "name": "Imagens Contemplativas",
            "icon": "image",
            "description": "Gradientes simbolicos para cada eixo espiritual",
            "count": len(images),
            "items": [serialize_image(db, img) for img in images],
        },
        "playlists": {
            "name": "Playlists Tematicas",
            "icon": "playlist-music",
            "description": "Selecoes curatoriais para diferentes contextos",
            "count": len(playlists),
            "items": [
                {
                    "id": p.id,
                    "title": p.title,
                    "description": p.description,
                    "item_count": len(p.items),
                    "is_premium": p.is_premium,
                }
                for p in playlists
            ],
        },
        "summary": {
            "total_content_items": sum(len(items) for items in by_type.values()),
            "breakdown_by_type": {
                "binaural": len(by_type["binaural"]),
                "meditation": len(by_type["meditation"]),
                "soundscape": len(by_type["soundscape"]),
                "music": len(by_type["music"]),
                "breathing": len(by_type["breathing"]),
            },
            "total_images": len(images),
            "total_playlists": len(playlists),
            "total_categories": 7,
            "storage_size_mb": 220,
        },
    }


@router.get("/catalog", response_model=list[ContentItemOut])
def list_catalog(
    type: str | None = None,
    axis: str | None = None,
    mood: str | None = None,
    max_duration: int | None = Query(default=None, ge=0),
    include_premium: bool = True,
    db: Session = Depends(get_db),
):
    query = _published_content_query()
    if type:
        query = query.where(ContentItem.type == type)
    if max_duration:
        query = query.where(ContentItem.duration_seconds <= max_duration)
    if not include_premium:
        query = query.where(ContentItem.is_premium.is_(False))

    items = db.execute(query).scalars().unique().all()
    if axis:
        items = [i for i in items if axis in (i.spiritual_axis or [])]
    if mood:
        items = [i for i in items if mood in (i.mood_tags or [])]
    return [serialize_content(db, i) for i in items]


@router.get("/catalog/{item_id}", response_model=ContentItemOut)
def get_content(item_id: str, db: Session = Depends(get_db)):
    item = db.execute(
        select(ContentItem)
        .options(*_content_options())
        .where(ContentItem.id == item_id)
    ).scalar_one_or_none()
    if item is None or not item.is_active:
        raise HTTPException(404, "Conteudo nao encontrado")
    return serialize_content(db, item)


@router.get("/images", response_model=list[ImageAssetOut])
def list_images(
    axis: str | None = None, tag: str | None = None, db: Session = Depends(get_db)
):
    images = db.execute(select(ImageAsset)).scalars().all()
    if axis:
        images = [i for i in images if axis in (i.spiritual_axis or [])]
    if tag:
        images = [i for i in images if tag in (i.visual_tags or [])]
    return [serialize_image(db, i) for i in images]


@router.get("/playlists")
def list_playlists(db: Session = Depends(get_db)):
    playlists = db.execute(
        select(Playlist).options(selectinload(Playlist.items))
    ).scalars().unique().all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "is_premium": p.is_premium,
            "item_count": len(p.items),
        }
        for p in playlists
    ]


@router.get("/playlists/{playlist_id}")
def get_playlist(playlist_id: str, db: Session = Depends(get_db)):
    p = db.execute(
        select(Playlist)
        .options(
            selectinload(Playlist.items)
            .joinedload(PlaylistItem.content_item)
            .options(*_content_options())
        )
        .where(Playlist.id == playlist_id)
    ).scalar_one_or_none()
    if p is None:
        raise HTTPException(404, "Playlist nao encontrada")
    return {
        "id": p.id,
        "title": p.title,
        "description": p.description,
        "is_premium": p.is_premium,
        "items": [serialize_content(db, it.content_item) for it in p.items],
    }
