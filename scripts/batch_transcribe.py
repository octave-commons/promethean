"""Batch transcription utility.

Iterates over WAV files in ``data/raw-wav`` and transcribes them using any
available ``transcribe_pcm`` implementations from ``shared.py.speech``.

Outputs are written to ``data/transcripts/{model_name}/<basename>.txt``.
"""

from __future__ import annotations

from pathlib import Path
import sys
import wave
from typing import Callable, Dict

# Ensure project root on sys.path so shared modules are importable
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

Transcriber = Callable[[bytearray, int, int], str]


def discover_transcribers() -> Dict[str, Transcriber]:
    """Return a mapping of model name to ``transcribe_pcm`` functions.

    Imports are attempted lazily so environments lacking optional
    dependencies can still run this script. Only successfully imported
    models are returned.
    """
    transcribers: Dict[str, Transcriber] = {}

    try:
        from shared.py.speech.whisper_stt import transcribe_pcm as whisper_transcribe

        transcribers["whisper_stt"] = whisper_transcribe
    except Exception as exc:  # pragma: no cover - best effort discovery
        print(f"Skipping whisper_stt: {exc}")

    try:
        from shared.py.speech.stt import transcribe_pcm as base_transcribe

        transcribers["stt"] = base_transcribe
    except Exception as exc:  # pragma: no cover - best effort discovery
        print(f"Skipping stt: {exc}")

    return transcribers


def transcribe_file(
    path: Path, transcribers: Dict[str, Transcriber], out_root: Path
) -> None:
    """Transcribe ``path`` with each ``transcriber`` and save outputs."""
    with wave.open(str(path), "rb") as wf:
        pcm = wf.readframes(wf.getnframes())
        rate = wf.getframerate()
        channels = wf.getnchannels()

    base = path.stem
    for name, fn in transcribers.items():
        try:
            text = fn(bytearray(pcm), sample_rate=rate, num_channels=channels)
        except Exception as exc:  # pragma: no cover - avoid failing whole batch
            print(f"Failed {name} on {path.name}: {exc}")
            continue
        out_file = out_root / name / f"{base}.txt"
        out_file.parent.mkdir(parents=True, exist_ok=True)
        out_file.write_text(text.strip())
        print(f"Saved {name} transcription for {path.name} -> {out_file}")


def main() -> None:
    raw_dir = Path("data/raw-wav")
    out_root = Path("data/transcripts")

    transcribers = discover_transcribers()
    if not transcribers:
        print("No transcription models available")
        return

    wav_files = sorted(raw_dir.glob("*.wav"))
    if not wav_files:
        print(f"No wav files found in {raw_dir}")
        return

    for wav in wav_files:
        transcribe_file(wav, transcribers, out_root)


if __name__ == "__main__":  # pragma: no cover
    main()
