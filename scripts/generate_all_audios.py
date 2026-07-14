import os
import wave
import numpy as np
from pathlib import Path

SAMPLE_RATE = 44100

def _pink_noise(n: int, rng: np.random.Generator) -> np.ndarray:
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

def write_wav(path: Path, data: np.ndarray) -> None:
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        wav.writeframes(data.tobytes())

def generate_ambient(filename: str, mode: str, duration: float, outdir: Path):
    n = int(SAMPLE_RATE * duration)
    t = np.arange(n) / SAMPLE_RATE
    rng = np.random.default_rng(hash(filename) % (2**32))
    
    left = np.zeros(n)
    right = np.zeros(n)
    
    if mode == "rain":
        # Rain: Pink noise + tiny volume modulation
        noise = _pink_noise(n, rng)
        left = noise * 0.4
        right = noise * 0.4
    elif mode == "ocean":
        # Ocean: Modulated brown noise (slow swells every 4 seconds)
        noise = _brown_noise(n, rng)
        swell = (np.sin(2 * np.pi * t / 4.0) + 1.0) / 2.0
        left = noise * 0.3 * swell
        right = noise * 0.3 * (1.0 - swell * 0.2)
    elif mode == "fire":
        # Fire: Brown noise + random crackling clicks
        noise = _brown_noise(n, rng)
        left = noise * 0.25
        right = noise * 0.25
        # Clicks
        clicks = rng.random(n) > 0.9995
        for idx in np.where(clicks)[0]:
            left[idx:idx+10] += 0.5
            right[idx:idx+10] += 0.5
    elif mode == "wind":
        # Wind: Modulated bandpass-like noise
        noise = _pink_noise(n, rng)
        sweep = (np.sin(2 * np.pi * t / 6.0) + 1.0) / 2.0
        left = noise * (0.1 + 0.3 * sweep)
        right = noise * (0.3 - 0.2 * sweep)
    elif mode == "music" or mode == "meditation":
        # Ambient chord progression (organ-like resonant sine tones)
        f1, f2, f3 = 110.0, 137.5, 165.0 # A minor chord
        if "manha" in filename or "despertar" in filename:
            f1, f2, f3 = 132.0, 165.0, 198.0 # C Major
        left = np.sin(2 * np.pi * f1 * t) * 0.15 + np.sin(2 * np.pi * f2 * t) * 0.15
        right = np.sin(2 * np.pi * f2 * t) * 0.15 + np.sin(2 * np.pi * f3 * t) * 0.15
        # Add a gentle pink noise layer
        bed = _pink_noise(n, rng) * 0.05
        left += bed
        right += bed
    else:
        # Default: Gentle pink noise
        noise = _pink_noise(n, rng)
        left = noise * 0.2
        right = noise * 0.2
        
    # Fade in/out
    fade = int(SAMPLE_RATE * 1)
    envelope = np.ones(n)
    envelope[:fade] = np.linspace(0, 1, fade)
    envelope[-fade:] = np.linspace(1, 0, fade)
    
    stereo = np.stack([left * envelope, right * envelope], axis=1)
    peak = np.max(np.abs(stereo)) or 1.0
    data = (stereo / peak * 0.75 * 32767).astype(np.int16)
    
    write_wav(outdir / filename, data)
    print(f"Synthesized: {filename} ({mode})")

def main():
    outdir = Path(r"c:\AuraSync\storage\audio")
    outdir.mkdir(parents=True, exist_ok=True)
    
    assets = [
        # Meditations
        ("meditacao_zen_manha.wav", "meditation"),
        ("meditacao_enraizamento.wav", "meditation"),
        ("meditacao_silencio.wav", "meditation"),
        ("meditacao_vipassana.wav", "meditation"),
        ("meditacao_metta.wav", "meditation"),
        ("meditacao_body_scan.wav", "meditation"),
        ("meditacao_despertar.wav", "meditation"),
        # Soundscapes
        ("floresta_tropical.wav", "wind"),
        ("chuva_relaxante.wav", "rain"),
        ("oceano_amanhecer.wav", "ocean"),
        ("fogueira_estalando.wav", "fire"),
        ("vento_montanhas.wav", "wind"),
        ("cachoeira_suave.wav", "rain"),
        ("ribeirao_cristalino.wav", "ocean"),
        ("tempestade_distante.wav", "fire"),
        ("selva_noturna.wav", "wind"),
        ("grilos_neblina.wav", "wind"),
        # Music (mp3 extension but wav content)
        ("harmonia_celestial.mp3", "music"),
        ("acordes_cura.mp3", "music"),
        ("piano_meditativo.mp3", "music"),
        ("por_do_sol.mp3", "music"),
        ("brisa_suave.mp3", "music"),
        ("manha_tranquila.mp3", "music"),
        ("gong_meditacao.mp3", "music"),
        ("jardim_zen.mp3", "music"),
        ("mente_pacifica.mp3", "music"),
        ("relaxamento_profundo.mp3", "music"),
    ]
    
    print("Starting synthesis of nature, music, and meditation files...")
    # Generate 5-second loops to keep files tiny (5s = ~880KB per file)
    for filename, mode in assets:
        generate_ambient(filename, mode, 5.0, outdir)
    print("All files synthesized successfully!")

if __name__ == "__main__":
    main()
