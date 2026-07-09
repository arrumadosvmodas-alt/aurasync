from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from .deps import get_current_user
from .serializers import serialize_content, serialize_image
from ..core.constants import GOALS
from ..db import get_db
from ..models import User, UserPreferences
from ..schemas.schemas import RecommendationOut
from ..services.recommendation import correlate_image, recommend

router = APIRouter(tags=["recommendations"])


@router.get("/recommendations", response_model=list[RecommendationOut])
def get_recommendations(
    goal: str | None = Query(default=None),
    hour: int | None = Query(default=None, ge=0, le=23),
    limit: int = Query(default=10, ge=1, le=50),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prefs = db.get(UserPreferences, user.id)
    goal_override = goal if goal in GOALS else None
    results = recommend(db, prefs, hour=hour, limit=limit, goal_override=goal_override)
    out = []
    for item, score, reasons in results:
        serialized = serialize_content(db, item)
        # Correlação áudio × imagem: se o conteúdo não tem capa, sugere a mais coerente.
        if serialized.cover_image is None:
            img = correlate_image(db, item, hour=hour)
            if img is not None:
                serialized.cover_image = serialize_image(db, img)
        out.append(RecommendationOut(item=serialized, score=score, reasons=reasons))
    return out
