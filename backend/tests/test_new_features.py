import pytest
from datetime import datetime, timezone
from app.models import ContentItem, UserPreferences, SpiritualJourney, JourneyStep, UserJourneyProgress
from app.services.recommendation import score_content, recommend
from app.core.constants import time_of_day

def _published(title: str, axes: list, moods: list) -> ContentItem:
    return ContentItem(
        title=title,
        type="binaural",
        spiritual_axis=axes,
        mood_tags=moods,
        published_at=datetime.now(timezone.utc),
    )

def test_recommendation_dynamic_goal_switching(db):
    # Foco durante o dia (air, fire, earth), Sono à noite (night, water, root)
    foco_item = _published("Foco Diurno", ["fire"], ["focused"])
    sono_item = _published("Sono Noturno", ["night"], ["deep"])
    db.add_all([foco_item, sono_item])
    db.commit()

    prefs = UserPreferences(
        user_id="u123",
        primary_goal="focus",    # Objetivo diurno
        night_goal="sleep",      # Objetivo noturno
        spiritual_axis=[]
    )

    # 1) Testar período diurno (tarde - 14h): deve priorizar Foco Diurno
    score_foco_dia, _ = score_content(foco_item, prefs, hour=14, play_counts={}, max_plays=0)
    score_sono_dia, _ = score_content(sono_item, prefs, hour=14, play_counts={}, max_plays=0)
    assert score_foco_dia > score_sono_dia

    # 2) Testar período noturno (noite - 23h): deve priorizar Sono Noturno
    score_foco_noite, _ = score_content(foco_item, prefs, hour=23, play_counts={}, max_plays=0)
    score_sono_noite, _ = score_content(sono_item, prefs, hour=23, play_counts={}, max_plays=0)
    assert score_sono_noite > score_foco_noite


def test_fluxo_onboarding_com_night_goal(client, auth_headers):
    # Enviar onboarding completo com os dois objetivos
    resp = client.post(
        "/onboarding",
        json={
            "primary_goal": "focus",
            "night_goal": "sleep",
            "preferred_duration_seconds": 600,
            "preferred_content": ["binaural"],
            "spiritual_axis": ["air", "night"],
            "experience_level": "beginner",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["primary_goal"] == "focus"
    assert data["night_goal"] == "sleep"

    # Verificar que as preferências persistiram no banco
    prefs = client.get("/preferences", headers=auth_headers).json()
    assert prefs["primary_goal"] == "focus"
    assert prefs["night_goal"] == "sleep"


def test_reset_journey_progress(client, auth_headers, db):
    # 1) Criar jornada de teste no banco local
    journey = SpiritualJourney(
        title="Jornada de Teste",
        spiritual_axis="water",
        total_days=3,
        level="beginner"
    )
    db.add(journey)
    db.commit()
    
    # 2) Registrar progresso
    resp_prog = client.post(
        f"/journeys/{journey.id}/progress",
        json={"completed_day": 1},
        headers=auth_headers
    )
    assert resp_prog.status_code == 200
    assert resp_prog.json()["current_day"] == 2
    assert resp_prog.json()["completed_days"] == [1]

    # 3) Reiniciar jornada (DELETE)
    resp_reset = client.delete(
        f"/journeys/{journey.id}/progress",
        headers=auth_headers
    )
    assert resp_reset.status_code == 200
    assert resp_reset.json() == {"ok": True}

    # 4) Verificar que o progresso voltou ao padrão (Dia 1)
    resp_get = client.get(
        f"/journeys/{journey.id}/progress",
        headers=auth_headers
    )
    assert resp_get.status_code == 200
    assert resp_get.json()["current_day"] == 1
    assert resp_get.json()["completed_days"] == []
