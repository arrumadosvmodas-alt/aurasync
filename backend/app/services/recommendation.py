"""Motor de recomendação v1 — regras + modelo de pontuação (sem ML).

score = eixo_espiritual_match * 35
      + mood_match            * 25
      + cor_match             * 10   (aplicado na correlação de imagem)
      + horario_match         * 10
      + objetivo_usuario_match* 10
      + popularidade          * 5
      + novidade              * 5
"""

from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..core.constants import GOAL_AXES, GOAL_MOODS, TIME_OF_DAY_AXES, time_of_day
from ..models import ContentItem, ImageAsset, PlaybackHistory, UserPreferences

# Paleta de cores priorizada por período do dia (correlação áudio × imagem).
TIME_COLORS = {
    "morning": ["gold", "orange", "green", "white"],
    "afternoon": ["blue", "green", "gold", "white"],
    "evening": ["purple", "orange", "dark_blue", "gray"],
    "night": ["dark_blue", "black", "purple", "silver"],
}


def _overlap(a: list | None, b: list | None) -> float:
    """Proporção de interseção de b coberta por a (0..1)."""
    if not a or not b:
        return 0.0
    sa, sb = set(a), set(b)
    return len(sa & sb) / len(sb)


def score_content(
    item: ContentItem,
    prefs: UserPreferences | None,
    hour: int,
    play_counts: dict[str, int],
    max_plays: int,
) -> tuple[float, list[str]]:
    period = time_of_day(hour)
    time_axes = TIME_OF_DAY_AXES[period]
    
    if period in ("evening", "night") and prefs and prefs.night_goal:
        goal = prefs.night_goal
    else:
        goal = prefs.primary_goal if prefs else "relaxation"
        
    user_axes = list(prefs.spiritual_axis) if prefs and prefs.spiritual_axis else GOAL_AXES.get(goal, [])
    goal_moods = GOAL_MOODS.get(goal, [])

    reasons: list[str] = []
    axis_match = _overlap(item.spiritual_axis, user_axes)
    if axis_match:
        reasons.append(f"eixo espiritual compatível ({period})")
    mood_match = _overlap(item.mood_tags, goal_moods)
    if mood_match:
        reasons.append("mood alinhado ao seu objetivo")
    time_match = _overlap(item.spiritual_axis, time_axes)
    if time_match:
        reasons.append(f"indicado para este horário ({period})")

    goal_match = 0.0
    if prefs and prefs.preferred_content and item.type in prefs.preferred_content:
        goal_match += 0.5
        reasons.append("tipo de conteúdo preferido")
    if goal == "sleep" and item.sleep_safe:
        goal_match += 0.5
    elif goal in ("meditation", "spiritual", "silence") and item.meditation_safe:
        goal_match += 0.5
    goal_match = min(goal_match, 1.0)

    plays = play_counts.get(item.id, 0)
    popularity = plays / max_plays if max_plays else 0.0

    novelty = 0.0
    if item.published_at:
        published = item.published_at
        if published.tzinfo is None:
            published = published.replace(tzinfo=timezone.utc)
        age_days = (datetime.now(timezone.utc) - published).days
        novelty = max(0.0, 1.0 - age_days / 30.0)

    score = (
        axis_match * 35
        + mood_match * 25
        + time_match * 10
        + goal_match * 10
        + popularity * 5
        + novelty * 5
    )
    return round(score, 2), reasons


def recommend(
    db: Session,
    prefs: UserPreferences | None,
    hour: int | None = None,
    limit: int = 10,
    goal_override: str | None = None,
) -> list[tuple[ContentItem, float, list[str]]]:
    hour = hour if hour is not None else datetime.now().hour
    if goal_override and prefs:
        # cópia rasa apenas para o cálculo — não persiste
        prefs = UserPreferences(
            user_id=prefs.user_id,
            primary_goal=goal_override,
            night_goal=prefs.night_goal,
            preferred_duration_seconds=prefs.preferred_duration_seconds,
            preferred_content=prefs.preferred_content,
            spiritual_axis=prefs.spiritual_axis,
            experience_level=prefs.experience_level,
        )

    items = (
        db.execute(
            select(ContentItem).where(
                ContentItem.is_active.is_(True),
                ContentItem.published_at.is_not(None),
            )
        )
        .scalars()
        .all()
    )
    counts_rows = db.execute(
        select(PlaybackHistory.content_item_id, func.count().label("n")).group_by(
            PlaybackHistory.content_item_id
        )
    ).all()
    play_counts = {row[0]: row[1] for row in counts_rows}
    max_plays = max(play_counts.values(), default=0)

    scored = [
        (item, *score_content(item, prefs, hour, play_counts, max_plays)) for item in items
    ]
    scored.sort(key=lambda t: t[1], reverse=True)
    return scored[:limit]


def correlate_image(
    db: Session, item: ContentItem, hour: int | None = None
) -> ImageAsset | None:
    """Escolhe a imagem mais coerente com o áudio (eixo, mood, cor, horário)."""
    hour = hour if hour is not None else datetime.now().hour
    period = time_of_day(hour)
    palette = TIME_COLORS[period]

    images = db.execute(select(ImageAsset)).scalars().all()
    if not images:
        return None

    def img_score(img: ImageAsset) -> float:
        return (
            _overlap(img.spiritual_axis, item.spiritual_axis) * 35
            + _overlap(img.visual_mood, item.mood_tags) * 25
            + _overlap(img.colors, palette) * 10
        )

    best = max(images, key=img_score)
    return best if img_score(best) > 0 else None
