Codex Context Service
```
=====================
```
Overview
--------

- Purpose: Provide an OpenAI-compatible API that transparently enriches requests with Promethean repo context and routes them to a local LLM (Ollama initially).
- Endpoints: `/v1/chat/completions`, `/v1/completions` non-streaming for v1.
- Retrieval: Queries SmartGPT Bridge `/search`, `/grep`, `/symbols` with a static bearer token.
- Outputs: Returns OpenAI-formatted JSON and persists Obsidian-friendly artifacts under `docs/codex-context/requests/`.

Configuration
-------------

- `PORT`: HTTP port (default `8140`).
- `LLM_MODEL`: Ollama model (default `gemma3:latest`).
- `SMARTGPT_URL`: SmartGPT Bridge base URL (default `http://127.0.0.1:3210`).
- `SMARTGPT_TOKEN`: Bearer token for SmartGPT requests.
- `DOCS_DIR`: Optional base directory for artifacts default `docs/codex-context`.

Design Notes
------------

- Append-only augmentation: The service prepends a system addendum that contains the retrieved context and provenance, keeping original user messages intact.
- Citations: Each context snippet lists file path and line range to preserve traceability.
- Backend abstraction: `OllamaBackend` implements `chat(messages)`; future drivers can be added without changing the API layer.

Testing
-------

- API compatibility: Ensures OpenAI-like request/response shape.
- Retriever auth: Confirms SmartGPT calls include the configured bearer token.
- Prompt assembly: Verifies citations and context are injected into system message.
- Artifact persistence: Produces request markdown files for Obsidian.

Usage with Codex
--------------------

- Configure Codex/OpenAI SDK with `OPENAI_BASE_URL=http://localhost:8140/v1` (or equivalent client option) and `OPENAI_API_KEY` (any placeholder, not used for local auth).
- The service intercepts and augments requests automatically.

