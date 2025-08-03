# app.py

**Path**: `services/stt/app.py`

**Description**: Now call your transcription logic. For offline processing, run [batch_transcribe.py](../../scripts/batch_transcribe.py) on the raw WAV dataset in [data/raw-wav/](../../data/raw-wav/); transcripts are written to [data/transcripts/](../../data/transcripts/).

## Dependencies
- fastapi
- fastapi.responses
- shared.py.speech.wisper_stt

## Dependents
- None

