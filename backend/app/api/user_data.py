"""Onboarding, favoritos e histórico de reprodução."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from .deps import get_current_user
from .serializers import serialize_content
from ..db import get_db
from ..models import ContentItem, Favorite, PlaybackHistory, User, UserPreferences
from ..schemas.schemas import (
    ContentItemOut,
    FavoriteIn,
    HistoryIn,
    OnboardingRequest,
    PreferencesOut,
)

router = APIRouter(tags=["user"])


@router.post("/onboarding", response_model=PreferencesOut)
def save_onboarding(
    body: OnboardingRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        body.validate_domain()
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc

    prefs = db.get(UserPreferences, user.id)
    if prefs is None:
        prefs = UserPreferences(user_id=user.id)
        db.add(prefs)
    prefs.primary_goal = body.primary_goal
    prefs.preferred_duration_seconds = body.preferred_duration_seconds
    prefs.preferred_content = body.preferred_content
    prefs.spiritual_axis = body.spiritual_axis
    prefs.experience_level = body.experience_level
    db.commit()
    db.refresh(prefs)
    return prefs


@router.get("/preferences", response_model=PreferencesOut)
def get_preferences(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    prefs = db.get(UserPreferences, user.id)
    if prefs is None:
        raise HTTPException(404, "Onboarding ainda não realizado")
    return prefs


@router.get("/favorites", response_model=list[ContentItemOut])
def list_favorites(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.execute(select(Favorite).where(Favorite.user_id == user.id)).scalars().all()
    items = [db.get(ContentItem, r.content_item_id) for r in rows]
    return [serialize_content(db, i) for i in items if i is not None]


@router.post("/favorites", status_code=201)
def add_favorite(
    body: FavoriteIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if db.get(ContentItem, body.content_item_id) is None:
        raise HTTPException(404, "Conteúdo não encontrado")
    existing = db.get(Favorite, (user.id, body.content_item_id))
    if existing is None:
        db.add(Favorite(user_id=user.id, content_item_id=body.content_item_id))
        db.commit()
    return {"ok": True}


@router.delete("/favorites/{content_item_id}")
def remove_favorite(
    content_item_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.execute(
        delete(Favorite).where(
            Favorite.user_id == user.id, Favorite.content_item_id == content_item_id
        )
    )
    db.commit()
    return {"ok": True}


@router.post("/history", status_code=201)
def record_playback(
    body: HistoryIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if db.get(ContentItem, body.content_item_id) is None:
        raise HTTPException(404, "Conteúdo não encontrado")
    db.add(
        PlaybackHistory(
            user_id=user.id,
            content_item_id=body.content_item_id,
            seconds_played=body.seconds_played,
            completed=body.completed,
        )
    )
    db.commit()
    return {"ok": True}


@router.get("/history")
def list_history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.execute(
            select(PlaybackHistory)
            .where(PlaybackHistory.user_id == user.id)
            .order_by(PlaybackHistory.started_at.desc())
            .limit(50)
        )
        .scalars()
        .all()
    )
    return [
        {
            "content_item_id": r.content_item_id,
            "started_at": r.started_at,
            "seconds_played": r.seconds_played,
            "completed": r.completed,
        }
        for r in rows
    ]
