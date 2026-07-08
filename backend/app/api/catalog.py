from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.serializers import serialize_content, serialize_image
from app.db import get_db
from app.models import ContentItem, ImageAsset, Playlist
from app.schemas.schemas import ContentItemOut, ImageAssetOut

router = APIRouter(tags=["catalog"])


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
