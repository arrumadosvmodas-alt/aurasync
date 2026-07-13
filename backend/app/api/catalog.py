from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from .serializers import serialize_content, serialize_image
from ..db import get_db
from ..models import ContentItem, ImageAsset, Playlist
from ..schemas.schemas import ContentItemOut, ImageAssetOut

router = APIRouter(tags=["catalog"])


@router.get("/catalog/complete")
def get_complete_catalog(db: Session = Depends(get_db)):
    """Retorna o catálogo completo organizado por categoria com imagens, músicas, sons e meditações"""

    # Buscar todos os itens por tipo
    binaural_items = db.execute(
        select(ContentItem).where(
            ContentItem.type == 'binaural',
            ContentItem.is_active.is_(True),
            ContentItem.published_at.is_not(None)
        )
    ).scalars().all()

    meditation_items = db.execute(
        select(ContentItem).where(
            ContentItem.type == 'meditation',
            ContentItem.is_active.is_(True),
            ContentItem.published_at.is_not(None)
        )
    ).scalars().all()

    soundscape_items = db.execute(
        select(ContentItem).where(
            ContentItem.type == 'soundscape',
            ContentItem.is_active.is_(True),
            ContentItem.published_at.is_not(None)
        )
    ).scalars().all()

    music_items = db.execute(
        select(ContentItem).where(
            ContentItem.type == 'music',
            ContentItem.is_active.is_(True),
            ContentItem.published_at.is_not(None)
        )
    ).scalars().all()

    breathing_items = db.execute(
        select(ContentItem).where(
            ContentItem.type == 'breathing',
            ContentItem.is_active.is_(True),
            ContentItem.published_at.is_not(None)
        )
    ).scalars().all()

    # Buscar imagens
    images = db.execute(select(ImageAsset)).scalars().all()

    # Buscar playlists
    playlists = db.execute(select(Playlist)).scalars().all()

    return {
        "catalog": {
            "binaural": {
                "name": "Sessões Binaurais",
                "icon": "waveform",
                "description": "Batidas de frequências específicas para estados mentais",
                "count": len(binaural_items),
                "items": [serialize_content(db, item) for item in binaural_items]
            },
            "meditation": {
                "name": "Meditações Guiadas",
                "icon": "spa",
                "description": "Práticas meditativas orientadas com durações variadas",
                "count": len(meditation_items),
                "items": [serialize_content(db, item) for item in meditation_items]
            },
            "soundscape": {
                "name": "Sons da Natureza",
                "icon": "tree",
                "description": "Ambientes sonoros naturais para relaxamento e imersão",
                "count": len(soundscape_items),
                "items": [serialize_content(db, item) for item in soundscape_items]
            },
            "music": {
                "name": "Música Ambiente",
                "icon": "music",
                "description": "Composições harmônicas para relaxamento e expansão",
                "count": len(music_items),
                "items": [serialize_content(db, item) for item in music_items]
            },
            "breathing": {
                "name": "Práticas de Respiração",
                "icon": "weather-windy",
                "description": "Exercícios respiratórios com técnicas específicas",
                "count": len(breathing_items),
                "items": [serialize_content(db, item) for item in breathing_items]
            }
        },
        "images": {
            "name": "Imagens Contemplativas",
            "icon": "image",
            "description": "Gradientes simbólicos para cada eixo espiritual",
            "count": len(images),
            "items": [serialize_image(db, img) for img in images]
        },
        "playlists": {
            "name": "Playlists Temáticas",
            "icon": "playlist-music",
            "description": "Seleções curatorias para diferentes contextos",
            "count": len(playlists),
            "items": [{
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "item_count": len(p.items),
                "is_premium": p.is_premium
            } for p in playlists]
        },
        "summary": {
            "total_content_items": len(binaural_items) + len(meditation_items) + len(soundscape_items) + len(music_items) + len(breathing_items),
            "breakdown_by_type": {
                "binaural": len(binaural_items),
                "meditation": len(meditation_items),
                "soundscape": len(soundscape_items),
                "music": len(music_items),
                "breathing": len(breathing_items)
            },
            "total_images": len(images),
            "total_playlists": len(playlists),
            "total_categories": 7,
            "storage_size_mb": 220
        }
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
    query = select(ContentItem).where(
        ContentItem.is_active.is_(True), ContentItem.published_at.is_not(None)
    )
    if type:
        query = query.where(ContentItem.type == type)
    if max_duration:
        query = query.where(ContentItem.duration_seconds <= max_duration)
    if not include_premium:
        query = query.where(ContentItem.is_premium.is_(False))

    items = db.execute(query).scalars().all()
    # Filtros de JSON (eixo/mood) em Python: portável entre SQLite e Postgres.
    if axis:
        items = [i for i in items if axis in (i.spiritual_axis or [])]
    if mood:
        items = [i for i in items if mood in (i.mood_tags or [])]
    return [serialize_content(db, i) for i in items]


@router.get("/catalog/{item_id}", response_model=ContentItemOut)
def get_content(item_id: str, db: Session = Depends(get_db)):
    item = db.get(ContentItem, item_id)
    if item is None or not item.is_active:
        raise HTTPException(404, "Conteúdo não encontrado")
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
    playlists = db.execute(select(Playlist)).scalars().all()
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
    p = db.get(Playlist, playlist_id)
    if p is None:
        raise HTTPException(404, "Playlist não encontrada")
    return {
        "id": p.id,
        "title": p.title,
        "description": p.description,
        "is_premium": p.is_premium,
        "items": [serialize_content(db, it.content_item) for it in p.items],
    }
