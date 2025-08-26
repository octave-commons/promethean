# LLM Service

This service exposes HTTP and WebSocket endpoints for text generation through pluggable drivers.

## Usage

Start the service with `./run.sh` (requires `pnpm`; the script prints setup
instructions if the package manager is missing):

```bash
./run.sh
```

POST `/generate` with JSON containing `prompt`, `context` and optional `format` to receive the generated reply.

Serve the chat interface via `pnpm serve:sites` and open `http://localhost:4500/llm-chat/` to try it in your browser.

## Configuration

Select the driver and model via environment variables or `config/config.yml`:

- `LLM_DRIVER` – `ollama` (default) or `huggingface`
- `LLM_MODEL` – model identifier for the chosen provider

Example `config/config.yml` entry:

```yaml
llm:
    driver: ollama
    model: gemma3:latest
```

For HuggingFace, set `HF_API_TOKEN` for authenticated requests.

#hashtags: #llm #service #promethean
