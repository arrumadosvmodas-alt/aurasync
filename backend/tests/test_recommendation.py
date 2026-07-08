from datetime import datetime, timezone

from app.core.constants import time_of_day
from app.models import ContentItem, UserPreferences
from app.services.recommendation import recommend, score_content


def _published(title: str, axes: list, moods: list) -> ContentItem:
    return ContentItem(
        title=title,
        type="binaural",
        spiritual_axis=axes,
        mood_tags=moods,
        published_at=datetime.now(timezone.utc),
    )


def test_time_of_day():
    assert time_of_day(7) == "morning"
    assert time_of_day(14) == "afternoon"
    assert time_of_day(20) == "evening"
    assert time_of_day(23) == "night"
    assert time_of_day(2) == "night"


def test_eixo_compativel_pontua_mais(db):
    agua = _published("Águas", ["water", "night"], ["calm", "dark"])
    fogo = _published("Fogo", ["fire"], ["focused"])
    db.add_all([agua, fogo])
    db.commit()

    prefs = UserPreferences(
        user_id="u1", primary_goal="sleep", spiritual_axis=["water", "night"]
    )
    score_agua, _ = score_content(agua, prefs, hour=23, play_counts={}, max_plays=0)
    score_fogo, _ = score_content(fogo, prefs, hour=23, play_counts={}, max_plays=0)
    assert score_agua > score_fogo


def test_recommend_ordena_e_limita(db):
    for i in range(5):
        db.add(_published(f"Item {i}", ["water"] if i % 2 == 0 else ["fire"], ["calm"]))
    db.commit()

    prefs = UserPreferences(user_id="u1", primary_goal="relaxation", spiritual_axis=["water"])
    results = recommend(db, prefs, hour=22, limit=3)
    assert len(results) == 3
    scores = [score for _, score, _ in results]
    assert scores == sorted(scores, reverse=True)
    # itens de água devem liderar para objetivo 'relaxation' à noite
    assert "water" in results[0][0].spiritual_axis


def test_recommend_sem_preferencias_nao_quebra(db):
    db.add(_published("Único", ["ether"], ["contemplative"]))
    db.commit()
    results = recommend(db, None, hour=10, limit=5)
    assert len(results) == 1
