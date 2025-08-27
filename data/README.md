# Data

This directory holds datasets and artifacts used by Promethean. Raw
recordings for transcription should be placed in `raw-wav/` and processed
with [`scripts/batch_transcribe.py`](../scripts/batch_transcribe.py).
See [docs/maintenance/orphaned-files.md](../docs/maintenance/orphaned-files.md)
for more details.

## Source
N/A – developer-provided recordings.

## Format
- `raw-wav/`: input WAV files awaiting transcription
- `transcripts/{model_name}/`: generated text outputs

## Licensing
Internal development data only.

## Intended use
Testing and maintenance of speech-to-text pipelines.
