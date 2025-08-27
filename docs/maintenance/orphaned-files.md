# Orphaned audio files

Raw recordings that have not been transcribed live under `data/raw-wav/`.
Use the batch transcription script to convert them into text files for
further processing or archival.

## Batch transcription

```bash
python scripts/batch_transcribe.py
```

The script scans `data/raw-wav/` for WAV files and runs each available
`transcribe_pcm` implementation (e.g. `shared.py.speech.whisper_stt`).
Results are written to `data/transcripts/{model_name}/<basename>.txt`.
