ADMIN = {"X-Admin-Token": "dev-admin-token"}


def test_health_e_meta(client):
    assert client.get("/health").json()["status"] == "ok"
    meta = client.get("/meta").json()
    assert "water" in meta["spiritual_axes"]
    assert "médico" in meta["disclaimer"]


def test_fluxo_auth_onboarding_favoritos(client, auth_headers):
    # onboarding
    resp = client.post(
        "/onboarding",
        json={
            "primary_goal": "sleep",
            "preferred_duration_seconds": 900,
            "preferred_content": ["binaural"],
            "spiritual_axis": ["water", "night"],
            "experience_level": "beginner",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["primary_goal"] == "sleep"

    # cria conteúdo via admin, licencia e publica
    item = client.post(
        "/admin/content",
        json={"title": "Portal Teste", "type": "binaural", "spiritual_axis": ["water"]},
        headers=ADMIN,
    ).json()
    audio = client.post(
        f"/admin/content/{item['id']}/audio",
        json={"storage_path": "audio/teste.wav", "format": "wav"},
        headers=ADMIN,
    ).json()
    client.post(
        "/admin/licenses",
        json={
            "asset_type": "audio",
            "asset_id": audio["id"],
            "source_name": "AuraSync",
            "license_name": "Proprietary",
        },
        headers=ADMIN,
    )
    published = client.post(f"/admin/content/{item['id']}/publish", headers=ADMIN)
    assert published.status_code == 200, published.text

    # catálogo público lista o item publicado
    catalog = client.get("/catalog", params={"axis": "water"}).json()
    assert any(c["id"] == item["id"] for c in catalog)

    # favoritar e listar
    assert (
        client.post(
            "/favorites", json={"content_item_id": item["id"]}, headers=auth_headers
        ).status_code
        == 201
    )
    favs = client.get("/favorites", headers=auth_headers).json()
    assert favs[0]["id"] == item["id"]

    # recomendações coerentes com objetivo/horário
    recs = client.get(
        "/recommendations", params={"hour": 23}, headers=auth_headers
    ).json()
    assert recs and recs[0]["item"]["id"] == item["id"]
    assert recs[0]["score"] > 0

    # histórico
    assert (
        client.post(
            "/history",
            json={"content_item_id": item["id"], "seconds_played": 120, "completed": False},
            headers=auth_headers,
        ).status_code
        == 201
    )


def test_admin_exige_token(client):
    assert client.get("/admin/content").status_code == 403


def test_onboarding_valida_objetivo(client, auth_headers):
    resp = client.post(
        "/onboarding", json={"primary_goal": "curar_ansiedade"}, headers=auth_headers
    )
    assert resp.status_code == 422
