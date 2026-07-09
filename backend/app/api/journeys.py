from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .deps import get_current_user
from ..db import get_db
from ..models import SpiritualJourney, User, UserJourneyProgress
from ..schemas.schemas import JourneyOut, JourneyProgressIn, JourneyProgressOut

router = APIRouter(prefix="/journeys", tags=["journeys"])


@router.get("", response_model=list[JourneyOut])
def list_journeys(db: Session = Depends(get_db)):
    return db.execute(select(SpiritualJourney)).scalars().all()


@router.get("/{journey_id}", response_model=JourneyOut)
def get_journey(journey_id: str, db: Session = Depends(get_db)):
    journey = db.get(SpiritualJourney, journey_id)
    if journey is None:
        raise HTTPException(404, "Jornada não encontrada")
    return journey


@router.get("/{journey_id}/progress", response_model=JourneyProgressOut)
def get_progress(
    journey_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    progress = db.execute(
        select(UserJourneyProgress).where(
            UserJourneyProgress.user_id == user.id,
            UserJourneyProgress.journey_id == journey_id,
        )
    ).scalar_one_or_none()
    if progress is None:
        return JourneyProgressOut(journey_id=journey_id, current_day=1, completed_days=[])
    return progress


@router.post("/{journey_id}/progress", response_model=JourneyProgressOut)
def update_progress(
    journey_id: str,
    body: JourneyProgressIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    journey = db.get(SpiritualJourney, journey_id)
    if journey is None:
        raise HTTPException(404, "Jornada não encontrada")
    if body.completed_day > journey.total_days:
        raise HTTPException(422, "Dia além do total da jornada")

    progress = db.execute(
        select(UserJourneyProgress).where(
            UserJourneyProgress.user_id == user.id,
            UserJourneyProgress.journey_id == journey_id,
        )
    ).scalar_one_or_none()
    if progress is None:
        progress = UserJourneyProgress(user_id=user.id, journey_id=journey_id)
        db.add(progress)

    completed = set(progress.completed_days or [])
    completed.add(body.completed_day)
    progress.completed_days = sorted(completed)
    progress.current_day = min(max(completed) + 1, journey.total_days)
    db.commit()
    db.refresh(progress)
    return progress
