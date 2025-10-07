# Service Endpoint E2E Tests

## Overview

These end-to-end tests verify that each networked service in the Promethean ecosystem responds as expected when the full system is running.

## Services Covered

- **TTS** – `/synth_voice_pcm` returns generated audio
- **STT** – `/transcribe_pcm` returns transcription text
- **Vision** – `/capture` returns a PNG frame
- **LLM** – `/generate` returns a text reply

## Running the Tests

1. Install dependencies for each service as needed $`make setup-quick SERVICE=<name>`$
2. Start the services: `pm2 start system/daemons/ecosystem.config.js`
$$
3. Execute: `pytest tests/e2e/test_service_endpoints.py`
$$
The tests will skip any service whose endpoint is unavailable.

## Tags

#tests #e2e
