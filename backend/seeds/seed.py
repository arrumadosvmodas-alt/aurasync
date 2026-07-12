"""Seed do MVP: gera áudios binaurais próprios, imagens contemplativas (SVG),
5 jornadas espirituais de 7 dias, playlists e um usuário demo.

Uso (a partir de backend/):
    python -m seeds.seed [--reset]
"""

import argparse
import importlib.util
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
REPO_DIR = BACKEND_DIR.parent
sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import select  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from app.core.config import settings  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.db import Base, SessionLocal, engine  # noqa: E402
from app.models import (  # noqa: E402
    AssetLicense,
    AudioAsset,
    BinauralParams,
    ContentItem,
    ImageAsset,
    JourneyStep,
    Playlist,
    PlaylistItem,
    SpiritualJourney,
    User,
    UserPreferences,
)
from app.services.publishing import can_publish  # noqa: E402

NOW = datetime.now(timezone.utc)

OWN_LICENSE = dict(
    source_name="AuraSync (conteúdo próprio)",
    author_name="AuraSync",
    license_name="Proprietary (obra própria)",
    attribution_required=False,
    commercial_use_allowed=True,
    derivative_allowed=True,
    verified_at=NOW,
)

# Imagens contemplativas próprias, geradas como SVG (gradientes simbólicos).
# `external_url` é usado como fallback quando o backend está offline ou
# quando o cliente não suporta SVG (ex: React Native).
IMAGES = [
    ("lago_sob_neblina", "Lago sob Neblina", ["water", "ether"], ["calm", "deep"],
     ["dark_blue", "gray", "silver"], ["lake", "mist", "night"], "#0b1d33", "#40546b",
     "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=400&auto=format&fit=crop"),
    ("montanha_ao_amanhecer", "Montanha ao Amanhecer", ["earth", "light"], ["sacred", "vast"],
     ["gold", "blue", "green"], ["mountain", "sunrise"], "#1b2a49", "#e0a458",
     "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400&auto=format&fit=crop"),
    ("ceu_estrelado", "Céu Estrelado", ["ether", "sky"], ["vast", "contemplative"],
     ["dark_blue", "black", "silver"], ["stars", "cosmos", "night"], "#050510", "#1d2951",
     "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400&auto=format&fit=crop"),
    ("floresta_azul", "Floresta Azul Escura", ["water", "earth"], ["calm", "dark"],
     ["dark_blue", "green"], ["forest", "night", "rain"], "#04141f", "#123c33",
     "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=400&auto=format&fit=crop"),
    ("chama_da_vela", "Chama da Vela", ["fire", "heart"], ["warm", "sacred"],
     ["orange", "gold", "black"], ["candle", "flame"], "#1a0d05", "#d97b29",
     "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?q=80&w=400&auto=format&fit=crop"),
    ("rio_entre_pedras", "Rio entre Pedras", ["water", "root"], ["gentle", "grounded"],
     ["blue", "gray", "green"], ["river", "stones"], "#22333b", "#5e8c87",
     "https://images.unsplash.com/photo-1437482078695-73f5ca6c96e3?q=80&w=400&auto=format&fit=crop"),
    ("ceu_aberto", "Céu Aberto", ["air", "sky"], ["airy", "luminous"],
     ["blue", "white"], ["sky", "clouds", "wind"], "#7fb4d9", "#e8f1f8",
     "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop"),
    ("aurora_dourada", "Aurora Dourada", ["light", "heart"], ["luminous", "warm"],
     ["gold", "orange", "purple"], ["aurora", "dawn", "gratitude"], "#2b1b3d", "#f2b263",
     "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=400&auto=format&fit=crop"),
    ("caverna_do_silencio", "Caverna do Silêncio", ["ether", "night"], ["deep", "dark"],
     ["black", "purple", "dark_blue"], ["cave", "silence"], "#0a0a12", "#2e2440",
     "https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?q=80&w=400&auto=format&fit=crop"),
    ("oceano_calmo", "Oceano Calmo à Noite", ["water", "night"], ["calm", "deep", "dark"],
     ["dark_blue", "silver"], ["ocean", "moon", "night"], "#081826", "#2c4a63",
     "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=400&auto=format&fit=crop"),
]

MEDITATION_ITEMS = [
    ("Meditação Zen da Manhã", "Comece seu dia com calma e presença plena.",
     ["air", "light"], ["calm", "focused"], 600),
    ("Meditação Guiada: Enraizamento", "Conecte-se à terra e estabilize sua energia.",
     ["earth", "root"], ["grounded", "calm"], 900),
    ("Meditação do Silêncio Interior", "Mergulhe na profundidade do seu ser.",
     ["ether", "night"], ["deep", "contemplative"], 1200),
]

SOUNDSCAPE_ITEMS = [
    ("Sons da Floresta Tropical", "Ambientes naturais com pássaros e água.",
     ["water", "earth"], ["calm", "airy"], 1800),
    ("Chuva Relaxante", "Som meditativo de chuva para descanso.",
     ["water", "night"], ["calm", "dark"], 1800),
    ("Oceano ao Amanhecer", "Ondas suaves e sons costeiros inspiradores.",
     ["water", "light"], ["calm", "luminous"], 1800),
]

BREATHING_ITEMS = [
    ("Respiração 4-7-8", "Inspire por 4, segure por 7, expire por 8. Apoia o desligamento noturno.",
     ["night", "water"], ["calm", "gentle"], 300, "4-7-8"),
    ("Respiração Fluida 4-4-6", "Ritmo fluido para soltar tensão e aceitar o fluxo.",
     ["water", "air"], ["calm", "airy"], 300, "4-4-6"),
    ("Respiração Quadrada 4-4-4-4", "Inspire, segure, expire e pause em tempos iguais. Clareza e presença.",
     ["air", "earth"], ["focused", "grounded"], 300, "4-4-4-4"),
]

JOURNEYS = [
    {
        "title": "Jornada da Água",
        "axis": "water",
        "objective": "Soltar tensão, aceitar o fluxo e reduzir resistência interna.",
        "description": "Sete dias para permitir que a vida flua: chuva, rio e entrega.",
        "days": ["Permitir", "Soltar", "Abrandar", "Confiar", "Silenciar", "Renovar", "Integrar"],
        "breathing": "4-4-6",
        "audio_slug": "aguas_profundas",
        "image_slug": "lago_sob_neblina",
        "phrases": [
            "Permitir é abrir espaço para o que já está a caminho.",
            "Soltar não é perder. É permitir que o fluxo continue.",
            "A água não luta contra a pedra; contorna e segue.",
            "Confiar é flutuar sem agarrar a margem.",
            "No fundo do lago, tudo é silêncio.",
            "Cada respiração renova a água interior.",
            "O rio e o mar sempre foram a mesma água.",
        ],
    },
    {
        "title": "Jornada da Terra",
        "axis": "earth",
        "objective": "Aterrar o corpo, estabilizar a mente e habitar o presente.",
        "description": "Sete dias de raiz, montanha e presença.",
        "days": ["Chegar", "Pesar", "Enraizar", "Sustentar", "Pausar", "Firmar", "Habitar"],
        "breathing": "4-4-4-4",
        "audio_slug": "raiz_da_montanha",
        "image_slug": "montanha_ao_amanhecer",
        "phrases": [
            "Chegue inteiro ao lugar onde o corpo já está.",
            "Sinta o peso: a gravidade é um abraço constante.",
            "Raízes crescem no escuro, sem pressa.",
            "A montanha não ensaia firmeza; ela é.",
            "Pausar também é avançar.",
            "O chão sustenta antes de você pedir.",
            "Habitar o corpo é voltar para casa.",
        ],
    },
    {
        "title": "Jornada do Fogo",
        "axis": "fire",
        "objective": "Despertar energia, coragem e capacidade de transformação.",
        "description": "Sete dias de chama, calor e movimento interior.",
        "days": ["Acender", "Aquecer", "Iluminar", "Ousar", "Transformar", "Purificar", "Brilhar"],
        "breathing": "4-4-4-4",
        "audio_slug": "clareira_do_foco",
        "image_slug": "chama_da_vela",
        "phrases": [
            "Toda chama começa pequena.",
            "O calor interno pede movimento, não pressa.",
            "A luz da vela não disputa com a escuridão; apenas arde.",
            "Coragem é dar o passo com o coração aceso.",
            "O fogo transforma sem pedir permissão ao medo.",
            "Queime o que já não serve como lenha do caminho.",
            "Brilhar é ser fiel à própria chama.",
        ],
    },
    {
        "title": "Jornada do Ar",
        "axis": "air",
        "objective": "Clarear a mente, aliviar o peso e respirar com consciência.",
        "description": "Sete dias de vento, céu aberto e leveza.",
        "days": ["Respirar", "Abrir", "Aliviar", "Clarear", "Expandir", "Voar", "Renovar"],
        "breathing": "4-4-6",
        "audio_slug": "clareira_do_foco",
        "image_slug": "ceu_aberto",
        "phrases": [
            "A respiração é a porta que está sempre aberta.",
            "Abra as janelas internas; deixe o vento passar.",
            "Leveza não é ausência de peso, é espaço.",
            "Mente clara é céu depois da chuva.",
            "Cada exalação devolve o que não é seu.",
            "O pássaro confia no ar que não vê.",
            "Renovar-se é respirar pela primeira vez, de novo.",
        ],
    },
    {
        "title": "Jornada do Silêncio",
        "axis": "ether",
        "objective": "Cultivar contemplação, expansão e escuta interior.",
        "description": "Sete dias de quietude, cosmos e presença sutil.",
        "days": ["Aquietar", "Escutar", "Esvaziar", "Contemplar", "Expandir", "Repousar", "Ser"],
        "breathing": "4-7-8",
        "audio_slug": "silencio_expandido",
        "image_slug": "ceu_estrelado",
        "phrases": [
            "O silêncio não é vazio; é presença sem palavras.",
            "Escute o espaço entre os sons.",
            "Esvaziar as mãos para receber o instante.",
            "Contemplar é olhar sem querer mudar.",
            "Você é maior que o pensamento que passa.",
            "No repouso profundo, tudo se reorganiza.",
            "Ser é suficiente.",
        ],
    },
]

PLAYLISTS = [
    ("Sono Profundo", "Sessões para preparar o descanso.", ["Águas Profundas", "Respiração 4-7-8"]),
    ("Foco Interior", "Sons para concentração leve.", ["Clareira do Foco", "Respiração Quadrada 4-4-4-4"]),
    ("Relaxamento em 10 Minutos", "Pausa rápida e contemplativa.", ["Portal da Calma", "Respiração Fluida 4-4-6"]),
    ("Céu Estrelado", "Contemplação e silêncio expandido.", ["Silêncio Expandido"]),
    ("Raiz e Presença", "Aterramento para começar ou encerrar o dia.", ["Raiz da Montanha", "Respiração Quadrada 4-4-4-4"]),
]


def _svg(width: int, height: int, color_a: str, color_b: str, title: str) -> str:
    return f"""<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{width}\" height=\"{height}\" viewBox=\"0 0 {width} {height}\">
  <title>{title}</title>
  <defs>
    <linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">
      <stop offset=\"0%\" stop-color=\"{color_a}\"/>
      <stop offset=\"100%\" stop-color=\"{color_b}\"/>
    </linearGradient>
    <radialGradient id=\"halo\" cx=\"0.5\" cy=\"0.35\" r=\"0.6\">
      <stop offset=\"0%\" stop-color=\"#ffffff\" stop-opacity=\"0.25\"/>
      <stop offset=\"100%\" stop-color=\"#ffffff\" stop-opacity=\"0\"/>
    </radialGradient>
  </defs>
  <rect width=\"{width}\" height=\"{height}\" fill=\"url(#g)\"/>
  <rect width=\"{width}\" height=\"{height}\" fill=\"url(#halo)\"/>
</svg>
"""


def _load_binaural_generator():
    path = REPO_DIR / "scripts" / "generate_binaural.py"
    spec = importlib.util.spec_from_file_location("generate_binaural", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _add_license(db: Session, asset_type: str, asset_id: str, **overrides) -> None:
    data = {**OWN_LICENSE, **overrides}
    db.add(AssetLicense(asset_type=asset_type, asset_id=asset_id, **data))


def seed(reset: bool = False) -> None:
    if reset:
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if db.execute(select(ContentItem.id)).first() is not None:
            print("Banco já populado — use --reset para recriar.")
            return

        audio_dir = settings.storage_dir / "audio"
        image_dir = settings.storage_dir / "images"
        audio_dir.mkdir(parents=True, exist_ok=True)
        image_dir.mkdir(parents=True, exist_ok=True)

        # 1) Gera as sessões binaurais (conteúdo próprio).
        generator = _load_binaural_generator()
        manifest_path = audio_dir / "binaural_manifest.json"
        if not manifest_path.exists():
            for session in generator.SESSIONS:
                data = generator.synthesize(session, 60.0)
                generator.write_wav(audio_dir / f"{session['slug']}.wav", data)
            manifest = [
                {
                    **s,
                    "file": f"{s['slug']}.wav",
                    "beat_hz": abs(s["right_hz"] - s["left_hz"]),
                    "duration_seconds": 60,
                    "sample_rate": generator.SAMPLE_RATE,
                }
                for s in generator.SESSIONS
            ]
            manifest_path.write_text(
                json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
            )
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

        # 2) Imagens contemplativas (SVG próprios).
        images_by_slug: dict[str, ImageAsset] = {}
        for slug, title, axes, moods, colors, tags, ca, cb, ext_url in IMAGES:
            filename = f"{slug}.svg"
            (image_dir / filename).write_text(_svg(1200, 800, ca, cb, title), encoding="utf-8")
            img = ImageAsset(
                title=title,
                storage_path=f"images/{filename}",
                external_url=ext_url,
                width=1200,
                height=800,
                colors=colors,
                visual_tags=tags,
                spiritual_axis=axes,
                visual_mood=moods,
            )
            db.add(img)
            db.flush()
            _add_license(db, "image", img.id)
            images_by_slug[slug] = img

        # 3) Conteúdos binaurais.
        content_by_title: dict[str, ContentItem] = {}
        cover_for_audio = {
            "portal_da_calma": "floresta_azul",
            "aguas_profundas": "oceano_calmo",
            "clareira_do_foco": "ceu_aberto",
            "raiz_da_montanha": "montanha_ao_amanhecer",
            "silencio_expandido": "ceu_estrelado",
        }
        binaural_by_slug: dict[str, ContentItem] = {}
        for entry in manifest:
            item = ContentItem(
                title=entry["title"],
                description=entry["description"],
                type="binaural",
                spiritual_axis=entry["axes"],
                mood_tags=entry["moods"],
                duration_seconds=entry["duration_seconds"],
                energy_level=1,
                cover_image_id=images_by_slug[cover_for_audio[entry["slug"]]].id,
            )
            db.add(item)
            db.flush()
            audio = AudioAsset(
                content_item_id=item.id,
                storage_path=f"audio/{entry['file']}",
                format="wav",
                sample_rate=entry["sample_rate"],
                channels=2,
                is_loopable=True,
            )
            db.add(audio)
            db.flush()
            _add_license(db, "audio", audio.id)
            db.add(
                BinauralParams(
                    content_item_id=item.id,
                    left_hz=entry["left_hz"],
                    right_hz=entry["right_hz"],
                    beat_hz=entry["beat_hz"],
                    base_noise=entry["noise"],
                )
            )
            db.flush()
            assert can_publish(db, item), f"seed sem licença para {item.title}"
            item.published_at = NOW
            binaural_by_slug[entry["slug"]] = item
            content_by_title[item.title] = item

        # 4) Meditações guiadas.
        for title, desc, axes, moods, duration in MEDITATION_ITEMS:
            item = ContentItem(
                title=title,
                description=desc,
                type="meditation",
                spiritual_axis=axes,
                mood_tags=moods,
                duration_seconds=duration,
                energy_level=1,
                published_at=NOW,
            )
            db.add(item)
            db.flush()
            content_by_title[title] = item

        # 5) Sons da natureza (soundscapes).
        for title, desc, axes, moods, duration in SOUNDSCAPE_ITEMS:
            item = ContentItem(
                title=title,
                description=desc,
                type="soundscape",
                spiritual_axis=axes,
                mood_tags=moods,
                duration_seconds=duration,
                energy_level=1,
                published_at=NOW,
            )
            db.add(item)
            db.flush()
            content_by_title[title] = item

        # 6) Práticas de respiração (visuais, sem áudio).
        breathing_by_pattern: dict[str, ContentItem] = {}
        for title, desc, axes, moods, duration, pattern in BREATHING_ITEMS:
            item = ContentItem(
                title=title,
                description=desc,
                type="breathing",
                spiritual_axis=axes,
                mood_tags=moods,
                duration_seconds=duration,
                energy_level=1,
                published_at=NOW,
            )
            db.add(item)
            db.flush()
            breathing_by_pattern[pattern] = item
            content_by_title[title] = item

        # 7) Jornadas espirituais de 7 dias.
        for j in JOURNEYS:
            journey = SpiritualJourney(
                title=j["title"],
                description=j["description"],
                spiritual_axis=j["axis"],
                objective=j["objective"],
                total_days=len(j["days"]),
                level="beginner",
            )
            db.add(journey)
            db.flush()
            for day, (day_title, phrase) in enumerate(zip(j["days"], j["phrases"]), start=1):
                db.add(
                    JourneyStep(
                        journey_id=journey.id,
                        day_number=day,
                        title=f"Dia {day}: {day_title}",
                        content_item_id=binaural_by_slug[j["audio_slug"]].id,
                        image_asset_id=images_by_slug[j["image_slug"]].id,
                        contemplation_text=phrase,
                        breathing_pattern=j["breathing"],
                    )
                )

        # 8) Playlists iniciais.
        for title, desc, item_titles in PLAYLISTS:
            playlist = Playlist(title=title, description=desc)
            db.add(playlist)
            db.flush()
            for position, item_title in enumerate(item_titles):
                db.add(
                    PlaylistItem(
                        playlist_id=playlist.id,
                        content_item_id=content_by_title[item_title].id,
                        position=position,
                    )
                )

        # 9) Usuário demo com onboarding preenchido.
        demo = User(
            email="demo@aurasync.app",
            password_hash=hash_password("16Ta15Ti@"),
            display_name="Visitante",
            role="user",
        )
        db.add(demo)
        db.flush()
        db.add(
            UserPreferences(
                user_id=demo.id,
                primary_goal="relaxation",
                night_goal="sleep",
                preferred_duration_seconds=1200,
                preferred_content=["binaural", "breathing"],
                spiritual_axis=["water", "ether"],
                experience_level="beginner",
            )
        )

        # 10) Conta de administrador do CMS — senha via AURASYNC_SEED_ADMIN_PASSWORD
        # em produção; nunca reutilize o valor padrão de dev fora do ambiente local.
        admin_password = settings.seed_admin_password
        admin = User(
            email="admin@aurasync.app",
            password_hash=hash_password(admin_password),
            display_name="Administrador",
            role="admin",
        )
        db.add(admin)

        db.commit()
        print("Seed concluído:")
        print(f"  {len(manifest)} sessões binaurais (áudio próprio)")
        print(f"  {len(MEDITATION_ITEMS)} meditações guiadas")
        print(f"  {len(SOUNDSCAPE_ITEMS)} soundscapes (sons da natureza)")
        print(f"  {len(BREATHING_ITEMS)} práticas de respiração")
        print(f"  {len(IMAGES)} imagens contemplativas (SVG próprios)")
        print(f"  {len(JOURNEYS)} jornadas espirituais de 7 dias")
        print(f"  {len(PLAYLISTS)} playlists")
        print("  usuário demo (app): demo@aurasync.app / 16Ta15Ti@")
        print(f"  administrador (CMS): admin@aurasync.app / {admin_password}")
        if admin_password == "16Ta15Ti@":
            print(
                "  AVISO: senha de admin padrão de desenvolvimento — defina "
                "AURASYNC_SEED_ADMIN_PASSWORD antes de rodar em produção."
            )
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="apaga e recria o banco")
    args = parser.parse_args()
    seed(reset=args.reset)
