import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "storage" / "audio" / "guided_raw"
OUT_DIR = ROOT / "storage" / "audio"
SAMPLE_RATE = 44100
DURATION_SECONDS = 60.0
TARGET_FRAMES = int(SAMPLE_RATE * DURATION_SECONDS)

FILES = {
    "meditacao_zen_manha.raw.wav": "meditacao_zen_manha.wav",
    "meditacao_enraizamento.raw.wav": "meditacao_enraizamento.wav",
    "meditacao_silencio.raw.wav": "meditacao_silencio.wav",
    "meditacao_vipassana.raw.wav": "meditacao_vipassana.wav",
    "meditacao_metta.raw.wav": "meditacao_metta.wav",
    "meditacao_body_scan.raw.wav": "meditacao_body_scan.wav",
    "meditacao_despertar.raw.wav": "meditacao_despertar.wav",
}


def read_wav(path: Path) -> tuple[np.ndarray, int]:
    with wave.open(str(path), "rb") as wav:
        channels = wav.getnchannels()
        sample_width = wav.getsampwidth()
        sample_rate = wav.getframerate()
        frames = wav.getnframes()
        raw = wav.readframes(frames)
    if sample_width == 1:
        data = np.frombuffer(raw, dtype=np.uint8).astype(np.float32)
        data = (data - 128.0) / 128.0
    elif sample_width == 2:
        data = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    else:
        raise ValueError(f"unsupported sample width: {sample_width}")
    if channels > 1:
        data = data.reshape(-1, channels).mean(axis=1)
    return data, sample_rate


def resample(data: np.ndarray, source_rate: int, target_rate: int) -> np.ndarray:
    if source_rate == target_rate:
        return data
    source_x = np.linspace(0, len(data) / source_rate, num=len(data), endpoint=False)
    target_len = int(len(data) * target_rate / source_rate)
    target_x = np.linspace(0, len(data) / source_rate, num=target_len, endpoint=False)
    return np.interp(target_x, source_x, data).astype(np.float32)


def ambient_bed(seed: int) -> np.ndarray:
    rng = np.random.default_rng(seed)
    t = np.arange(TARGET_FRAMES, dtype=np.float32) / SAMPLE_RATE
    base = (
        np.sin(2 * np.pi * 110.0 * t) * 0.025
        + np.sin(2 * np.pi * 165.0 * t) * 0.018
        + np.sin(2 * np.pi * 220.0 * t) * 0.012
    )
    breath = (np.sin(2 * np.pi * t / 8.0) + 1.0) / 2.0
    noise = rng.normal(0, 0.004, TARGET_FRAMES).astype(np.float32)
    return (base * (0.5 + 0.5 * breath) + noise).astype(np.float32)


def write_stereo_wav(path: Path, mono: np.ndarray) -> None:
    peak = max(float(np.max(np.abs(mono))), 1e-6)
    mono = mono / peak * 0.82
    left = mono
    right = np.roll(mono, 17) * 0.985
    stereo = np.stack([left, right], axis=1)
    pcm = np.clip(stereo, -1.0, 1.0)
    pcm = (pcm * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        wav.writeframes(pcm.tobytes())


def normalize_one(raw_name: str, out_name: str) -> None:
    voice, rate = read_wav(RAW_DIR / raw_name)
    voice = resample(voice, rate, SAMPLE_RATE)
    voice = voice - np.mean(voice)
    voice_peak = max(float(np.max(np.abs(voice))), 1e-6)
    voice = voice / voice_peak * 0.72

    final = ambient_bed(abs(hash(out_name)) % (2**32))
    start = int(SAMPLE_RATE * 2.0)
    end = min(start + len(voice), TARGET_FRAMES - int(SAMPLE_RATE * 2.0))
    final[start:end] += voice[: end - start]

    fade_len = int(SAMPLE_RATE * 2.0)
    envelope = np.ones(TARGET_FRAMES, dtype=np.float32)
    envelope[:fade_len] = np.linspace(0, 1, fade_len)
    envelope[-fade_len:] = np.linspace(1, 0, fade_len)
    final *= envelope
    write_stereo_wav(OUT_DIR / out_name, final)
    print(f"Normalized {out_name}")


def main() -> None:
    for raw_name, out_name in FILES.items():
        normalize_one(raw_name, out_name)


if __name__ == "__main__":
    main()
