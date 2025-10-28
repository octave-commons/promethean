# @promethean-os/autocommit

Watches your git repo and automatically stages + commits changes with LLM-generated messages.

## Defaults

- **Endpoint:** `OPENAI_BASE_URL` (default `http://localhost:11434/v1`)
- **Model:** `AUTOCOMMIT_MODEL` (default `llama3.1:8b`)
- **Key:** `OPENAI_API_KEY` (optional for local Ollama)

## Install & Run (workspace)

```bash
pnpm --filter @promethean-os/autocommit install
pnpm --filter @promethean-os/autocommit build
pnpm --filter @promethean-os/autocommit exec autocommit -- --dry-run
```

## CLI

```
autocommit --path . --debounce-ms 10000 --model llama3.1:8b --dry-run
```

### Git Subrepo Support

The package supports git-subrepo repositories alongside standard git repositories and submodules:

```bash
# Enable subrepo detection
autocommit --handle-subrepos --subrepo-strategy integrated

# Recursive mode with subrepo support
autocommit --recursive --handle-subrepos --subrepo-strategy separate
```

**Subrepo Strategies:**

- `integrated`: Treat subrepos as part of the parent repository (default)
- `separate`: Process subrepos as independent repositories

**Key Differences:**

- Git submodules use `.gitmodules` and separate `.git` directories
- Git subrepos use `.gitrepo` files with squashed history
- Subrepos appear as regular directories but are detected via `.gitrepo` files

## Safety

- Respects `.gitignore` plus `--exclude`.
- Debounces to avoid noisy histories.
- Caps diff bytes to protect tokens & context.
- Falls back to deterministic messages when LLM unavailable.
