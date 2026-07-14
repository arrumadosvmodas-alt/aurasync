from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import admin, auth, catalog, journeys, recommendations, user_data
from app.core.config import settings
from app.core.constants import (
    SPIRITUAL_AXES,
    DISCLAIMER_TEXT,
    BINAURAL_SAFETY_TEXT,
)
from app.db import Base, engine

app = FastAPI(
    title=settings.app_name,
    description=(
        "API do AuraSync — relaxamento, contemplação espiritual e sessões "
        "binaurais. Não é tratamento médico."
    ),
)

# Parse CORS origins from settings (comma-separated or "*")
cors_origins_list = (
    [origin.strip() for origin in settings.cors_origins.split(",")]
    if settings.cors_origins != "*"
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Em dev criamos as tabelas direto; Alembic assume as migrações a partir daqui.
# COMENTADO EM PRODUÇÃO: Vercel não permite create_all no startup
# Base.metadata.create_all(bind=engine)

# Storage mounting (permitido apenas fora do Vercel, ex: local ou Railway)
import os
if os.environ.get("VERCEL") != "1":
    try:
        settings.storage_dir.mkdir(parents=True, exist_ok=True)
        app.mount("/media", StaticFiles(directory=settings.storage_dir), name="media")
    except Exception as e:
        print(f"Aviso: Não foi possível montar o diretório de mídia: {e}")

app.include_router(auth.router)
app.include_router(catalog.router)
app.include_router(journeys.router)
app.include_router(user_data.router)
app.include_router(recommendations.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok", "app": settings.app_name}


@app.get("/get-db-url-temp-xyz")
def get_db_url():
    return {"db_url": settings.database_url}


@app.get("/meta")
def meta():
    """Taxonomia e textos de compliance consumidos pelo app e pelo CMS."""
    return {
        "spiritual_axes": SPIRITUAL_AXES,
        "disclaimer": DISCLAIMER_TEXT,
        "binaural_safety": BINAURAL_SAFETY_TEXT,
    }
