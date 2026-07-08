"""Sintetizador de sessões binaurais do AuraSync — conteúdo 100% próprio.

Gera WAVs estéreo: tom senoidal com frequência distinta em cada ouvido
(batida binaural percebida = |direita - esquerda|), opcionalmente sobre uma
cama de ruído rosa ou marrom, com fade in/out para loop limpo.

Uso:
    python scripts/generate_binaural.py [--outdir storage/audio] [--duration 60]

As frequências são tratadas como experiência sonora, não como promessa médica.
"""

import argparse
import json
import wave
from pathlib import Path

import numpy as np

SAMPLE_RATE = 44100

# Sessões próprias do MVP (nomes e parâmetros originais do AuraSync).
SESSIONS = [
    {
        "slug": "portal_da_calma",
        "title": "Portal da Calma",
        "left_hz": 200.0,
        "right_hz": 207.0,
        "noise": "pink",
        "axes": ["water", "ether"],
        "moods": ["calm", "deep"],
        "description": "Batida percebida de 7 Hz sobre ruído rosa. Relaxamento contemplativo.",
    },
    {
        "slug": "aguas_profundas",
        "title": "Águas Profundas",
        "left_hz": 150.0,
        "right_hz": 154.0,
        "noise": "brown",
        "axes": ["water", "night"],
        "moods": ["calm", "dark", "deep"],
        "description": "Batida percebida de 4 Hz sobre ruído marrom. Preparação para o sono.",
    },
    {
        "slug": "clareira_do_foco",
        "title": "Clareira do Foco",
        "left_hz": 220.0,
        "right_hz": 234.0,
        "noise": "pink",
        "axes": ["air", "fire"],
        "moods": ["focused", "airy"],
        "description": "Batida percebida de 14 Hz sobre ruído rosa. Foco leve.",
    },
    {
        "slug": "raiz_da_montanha",
        "title": "Raiz da Montanha",
        "left_hz": 136.0,
        "right_hz": 142.0,
        "noise": "brown",
        "axes": ["earth", "root"],
        "moods": ["grounded", "deep", "warm"],
        "description": "Batida percebida de 6 Hz sobre ruído marrom. Aterramento.",
    },
    {
        "slug": "silencio_expandido",
        "title": "Silêncio Expandido",
        "left_hz": 180.0,
        "right_hz": 183.0,
        "noise": "none",
        "axes": ["ether", "sky"],
        "moods": ["contemplative", "vast", "sacred"],
        "description": "Batida percebida de 3 Hz em tom puro. Contemplação profunda.",
    },
]


def _pink_noise(n: int, rng: np.random.Generator) -> np.ndarray:
    """Ruído rosa pelo método Voss-McCartney simplificado (filtro 1/f)."""
    white = rng.standard_normal(n)
    spectrum = np.fft.rfft(white)
    freqs = np.fft.rfftfreq(n, d=1.0 / SAMPLE_RATE)
    freqs[0] = freqs[1] if len(freqs) > 1 else 1.0
    spectrum /= np.sqrt(freqs)
    pink = np.fft.irfft(spectrum, n)
    return pink / (np.max(np.abs(pink)) or 1.0)


def _brown_noise(n: int, rng: np.random.Generator) -> np.ndarray:
    white = rng.standard_normal(n)
    brown = np.cumsum(white)
    brown -= brown.mean()
    return brown / (np.max(np.abs(brown)) or 1.0)


def synthesize(session: dict, duration: float) -> np.ndarray:
    n = int(SAMPLE_RATE * duration)
    t = np.arange(n) / SAMPLE_RATE
    left = np.sin(2 * np.pi * session["left_hz"] * t)
    right = np.sin(2 * np.pi * session["right_hz"] * t)

    tone_gain, noise_gain = 0.35, 0.25
    rng = np.random.default_rng(hash(session["slug"]) % (2**32))
    if session["noise"] == "pink":
        bed = _pink_noise(n, rng) * noise_gain
    elif session["noise"] == "brown":
        bed = _brown_noise(n, rng) * noise_gain
    else:
        bed = np.zeros(n)

    left = left * tone_gain + bed
    right = right * tone_gain + bed

    # Fade in/out de 2s para loop e escuta confortáveis.
    fade = int(SAMPLE_RATE * 2)
    envelope = np.ones(n)
    envelope[:fade] = np.linspace(0, 1, fade)
    envelope[-fade:] = np.linspace(1, 0, fade)
    stereo = np.stack([left * envelope, right * envelope], axis=1)

    peak = np.max(np.abs(stereo)) or 1.0
    return (stereo / peak * 0.85 * 32767).astype(np.int16)


def write_wav(path: Path, data: np.ndarray) -> None:
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        wav.writeframes(data.tobytes())


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--outdir", default="storage/audio")
    parser.add_argument(
        "--duration",
        type=float,
        default=60.0,
        help="Duração em segundos (loops curtos em dev; o player repete)",
    )
    args = parser.parse_args()

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    manifest = []
    for session in SESSIONS:
        filename = f"{session['slug']}.wav"
        write_wav(outdir / filename, synthesize(session, args.duration))
        manifest.append(
            {
                **session,
                "file": filename,
                "beat_hz": abs(session["right_hz"] - session["left_hz"]),
                "duration_seconds": int(args.duration),
                "sample_rate": SAMPLE_RATE,
                "license": {
                    "source_name": "AuraSync (conteúdo próprio)",
                    "author_name": "AuraSync",
                    "license_name": "Proprietary (obra própria)",
                    "attribution_required": False,
                    "commercial_use_allowed": True,
                    "derivative_allowed": True,
                },
            }
        )
        print(f"gerado: {outdir / filename}")

    manifest_path = outdir / "binaural_manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"manifesto: {manifest_path}")


if __name__ == "__main__":
    main()
