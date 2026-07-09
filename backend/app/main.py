from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .api import admin, auth, catalog, journeys, recommendations, user_data
from .core.config import settings
from .core.constants import (
    SPIRITUAL_AXES,
    DISCLAIMER_TEXT,
    BINAURAL_SAFETY_TEXT,
)
from .db import Base, engine
# Importações já estão em relative imports ✓

app = FastAPI(
    title=settings.app_name,
    description=(
        "API do AuraSync — relaxamento, contemplação espiritual e sessões "
        "binaurais. Não é tratamento médico."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://aurasync-admin.vercel.app",
        "https://aurasync-pi.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Em dev criamos as tabelas direto; Alembic assume as migrações a partir daqui.
# COMENTADO EM PRODUÇÃO: Vercel não permite create_all no startup
# Base.metadata.create_all(bind=engine)

# Storage mounting (comentado em produção - Vercel não permite criação de diretórios)
# settings.storage_dir.mkdir(parents=True, exist_ok=True)
# app.mount("/media", StaticFiles(directory=settings.storage_dir), name="media")

app.include_router(auth.router)
app.include_router(catalog.router)
app.include_router(journeys.router)
app.include_router(user_data.router)
app.include_router(recommendations.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok", "app": settings.app_name}


@app.get("/meta")
def meta():
    """Taxonomia e textos de compliance consumidos pelo app e pelo CMS."""
    return {
        "spiritual_axes": SPIRITUAL_AXES,
        "disclaimer": DISCLAIMER_TEXT,
        "binaural_safety": BINAURAL_SAFETY_TEXT,
    }
