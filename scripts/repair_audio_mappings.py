"""Repara vínculos de áudio dos conteúdos já existentes.

Uso, a partir da raiz do projeto:
    python scripts/repair_audio_mappings.py

O seed corrigido resolve bancos novos. Este script corrige bancos locais que já
foram populados antes da correção e ainda apontam vários itens para o mesmo WAV.
"""

from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = REPO_DIR / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app.db import SessionLocal  # noqa: E402
from app.models import AssetLicense, AudioAsset, ContentItem  # noqa: E402
from seeds.seed import OWN_LICENSE  # noqa: E402

AUDIO_BY_TITLE = {
    "Meditação Zen da Manhã": "meditacao_zen_manha.wav",
    "Meditação Guiada: Enraizamento": "meditacao_enraizamento.wav",
    "Meditação do Silêncio Interior": "meditacao_silencio.wav",
    "Meditação Vipassana: Observação": "meditacao_vipassana.wav",
    "Meditação Metta: Compaixão Infinita": "meditacao_metta.wav",
    "Meditação Body Scan Profundo": "meditacao_body_scan.wav",
    "Sons da Floresta Tropical": "floresta_tropical.wav",
    "Chuva Relaxante": "chuva_relaxante.wav",
    "Oceano ao Amanhecer": "oceano_amanhecer.wav",
    "Floresta de Pinheiros à Noite": "floresta_pinheiros.wav",
    "Ribeirão Cristalino": "ribeirao_cristalino.wav",
    "Tempestade Distante": "tempestade_distante.wav",
    "Harmonia Celestial": "harmonia_celestial.wav",
    "Acordes da Cura": "acordes_cura.wav",
    "Piano Meditativo": "piano_meditativo.wav",
    "Cristais Cantadores": "cristais_cantadores.wav",
}


def ensure_license(db, audio: AudioAsset) -> None:
    existing = (
        db.query(AssetLicense)
        .filter(AssetLicense.asset_type == "audio", AssetLicense.asset_id == audio.id)
        .first()
    )
    if existing:
        return
    db.add(
        AssetLicense(
            asset_type="audio",
            asset_id=audio.id,
            **{**OWN_LICENSE, "verified_at": datetime.now(timezone.utc)},
        )
    )


def main() -> None:
    db = SessionLocal()
    try:
        changed = 0
        missing = []
        for title, audio_file in AUDIO_BY_TITLE.items():
            item = db.query(ContentItem).filter(ContentItem.title == title).first()
            if not item:
                missing.append(title)
                continue

            expected_path = f"audio/{audio_file}"
            expected_loop = item.type == "soundscape"
            audio = item.audio_assets[0] if item.audio_assets else None
            if audio is None:
                audio = AudioAsset(
                    content_item_id=item.id,
                    storage_path=expected_path,
                    format="wav",
                    sample_rate=44100,
                    channels=2,
                    is_loopable=expected_loop,
                )
                db.add(audio)
                db.flush()
                changed += 1
            elif audio.storage_path != expected_path or audio.is_loopable != expected_loop:
                audio.storage_path = expected_path
                audio.format = "wav"
                audio.sample_rate = 44100
                audio.channels = 2
                audio.is_loopable = expected_loop
                changed += 1

            ensure_license(db, audio)

        db.commit()
        print(f"Mapeamentos corrigidos/criados: {changed}")
        if missing:
            print("Itens não encontrados:")
            for title in missing:
                print(f"- {title}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
