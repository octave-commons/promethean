# @promethean/autocommit

Watches your git repo and automatically stages + commits changes with LLM-generated messages.

## Defaults

- **Endpoint:** `OPENAI_BASE_URL` (default `http://localhost:11434/v1`)
- **Model:** `AUTOCOMMIT_MODEL` (default `llama3.1:8b`)
- **Key:** `OPENAI_API_KEY` (optional for local Ollama)

## Install & Run (workspace)

```bash
pnpm --filter @promethean/autocommit install
pnpm --filter @promethean/autocommit build
pnpm --filter @promethean/autocommit exec autocommit -- --dry-run
```

## CLI

```
autocommit --path . --debounce-ms 10000 --model llama3.1:8b --dry-run
```

## Safety

- Respects `.gitignore` plus `--exclude`.
- Debounces to avoid noisy histories.
- Caps diff bytes to protect tokens & context.
- Falls back to deterministic messages when LLM unavailable.
