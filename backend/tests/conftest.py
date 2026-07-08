import os
import tempfile
from pathlib import Path

# Banco isolado por sessão de teste — definido ANTES de importar a app.
_tmpdir = tempfile.mkdtemp(prefix="aurasync_test_")
os.environ["AURASYNC_DATABASE_URL"] = f"sqlite:///{Path(_tmpdir).as_posix()}/test.db"
os.environ["AURASYNC_STORAGE_DIR"] = _tmpdir

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.db import Base, SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(autouse=True)
def fresh_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def db():
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_headers(client):
    resp = client.post(
        "/auth/register",
        json={"email": "teste@aurasync.app", "password": "senha12345", "display_name": "Teste"},
    )
    assert resp.status_code == 201, resp.text
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(client, db):
    from app.core.security import hash_password
    from app.models import User

    admin = User(
        email="admin@aurasync.app",
        password_hash=hash_password("admin12345"),
        display_name="Admin",
        role="admin",
    )
    db.add(admin)
    db.commit()

    resp = client.post("/auth/login", json={"email": "admin@aurasync.app", "password": "admin12345"})
    assert resp.status_code == 200, resp.text
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
