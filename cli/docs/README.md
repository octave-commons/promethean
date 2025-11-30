# @promethean/docs-cli

Commander-forward CLI to search/view docs and summarize agile tasks. Semantic search can hit Elasticsearch when configured; keyword/regex/fuzzy run locally.

## Install/build

```bash
pnpm --filter @promethean/docs-cli run build
```

## Global options

- `-C, --cwd <dir>`: working directory (env: `DOCS_CWD`)
- `-t, --trace`: log commander lifecycle hooks
- `-V, --version`: show CLI version
- `-h, --help`: show help

## Commands

### search (alias: s)

- Arguments: `<mode>` (semantic|keyword|fuzzy|regex), `<query>`
- Options:
  - `-c, --category <id>`: category id (choices: docs, packages, agile, adr; env: `DOCS_CATEGORY`)
  - `-p, --path <glob>`: override glob (env: `DOCS_PATH`)
  - `-f, --format <format>`: markdown|json (env: `DOCS_FORMAT`; default markdown)
  - `--absolute`: emit absolute paths
  - `--limit <count>`: limit returned rows (positive number)
  - Semantic/Elasticsearch:
    - `--es-url <url>` (env: `DOCS_ES_URL`)
    - `--es-index <name>` (env: `DOCS_ES_INDEX`, default `docs`)
    - `--es-api-key <key>` (env: `DOCS_ES_API_KEY`)
    - `--es-user <user>` / `--es-password <password>` (env: `DOCS_ES_USER` / `DOCS_ES_PASSWORD`)
    - `--es-ca <path>` (env: `DOCS_ES_CA`)
    - `--es-field <field...>`: override searched fields (env: `DOCS_ES_FIELDS`, comma or space separated)
  - Semantic/Ollama (local, no external deps):
    - `--ollama-url <url>` (env: `DOCS_OLLAMA_URL`)
    - `--ollama-model <model>` (env: `DOCS_OLLAMA_MODEL`, default `nomic-embed-text`)
  - Semantic/Transformers (local, on-device):
    - `--transformers-model <model>` (env: `DOCS_TRANSFORMERS_MODEL`, e.g., `Xenova/all-MiniLM-L6-v2`)
    - `--transformers-cache <path>` (env: `DOCS_TRANSFORMERS_CACHE`)
    - `--transformers-device <device>` (env: `DOCS_TRANSFORMERS_DEVICE`, optional)
  - Semantic/Local deterministic fallback (no network):
    - `--local-embed-dim <dim>` (env: `DOCS_LOCAL_EMBED_DIM`, default 384)
    - `--local-embed-model <id>` (env: `DOCS_LOCAL_EMBED_MODEL`, default `local-hash`)
  - Caching:
    - `--lmdb-path <path>`: LMDB cache for embeddings (env: `DOCS_CACHE_PATH`, default `.cache/docs-cli` under cwd)
  - Semantic/Chroma placeholders (future local vector store, not wired yet):
    - `--chroma-path <path>` (env: `DOCS_CHROMA_PATH`)
    - `--chroma-collection <name>` (env: `DOCS_CHROMA_COLLECTION`)
- Examples:
  - `promethean-docs search keyword kanban -c docs`
  - `promethean-docs s regex "kanban" --path "docs/agile/**/*.md" --format json`
  - `promethean-docs search semantic "project vision" --es-url http://localhost:9200 --es-index docs`
  - `promethean-docs search semantic "project vision" --ollama-url http://localhost:11434 --ollama-model nomic-embed-text`
  - `promethean-docs search semantic "project vision" --transformers-model Xenova/all-MiniLM-L6-v2 --transformers-cache ~/.cache/transformers`
  - `promethean-docs search semantic "project vision" --local-embed-dim 256 --lmdb-path /tmp/docs-cache`

## Quickstart: Local Transformers (offline)

```bash
# optional: set cache directory (defaults to ~/.cache/huggingface/transformers)
export DOCS_TRANSFORMERS_CACHE="$HOME/.cache/transformers"
# optional: choose model (MiniLM is small and fast)
export DOCS_TRANSFORMERS_MODEL="Xenova/all-MiniLM-L6-v2"

# run a semantic query without external services
promethean-docs search semantic "project vision" --transformers-model "$DOCS_TRANSFORMERS_MODEL"
```

- First run downloads the model to the cache; subsequent runs are offline.
- LMDB cache is enabled by default at `.cache/docs-cli` under `--cwd`; override with `--lmdb-path`.

```bash
promethean-docs search semantic "kanban" --transformers-model Xenova/all-MiniLM-L6-v2 --lmdb-path /tmp/docs-cache
```

```
### view (alias: cat)

- Arguments: `<path>`: markdown/json path (relative to `--cwd`)
- Options: `-e, --encoding <encoding>` (default utf8)
- Example: `promethean-docs view docs/HOME.md`

### tasks (alias: t)

- Subcommand: `summary` (alias: sum)
- Options:
  - `-f, --format <format>`: markdown|json (default markdown)
  - `--status <status...>`: filter by status (variadic)
  - `--priority <priority...>`: filter by priority (variadic)
- Examples:
  - `promethean-docs tasks summary`
  - `promethean-docs t sum --format json --priority P0 P1`

## Notes

- Backend order: Elasticsearch → Ollama → Transformers → deterministic local (LMDB-cached). Set the flag/env for the backend you want; leave others unset to avoid conflicts.
- Transformers: first run downloads models to cache (`~/.cache/huggingface/transformers` or `--transformers-cache`); pin a small model like `Xenova/all-MiniLM-L6-v2`. Node 22 should support WASM SIMD; older Nodes may need `NODE_OPTIONS=--experimental-wasm-simd`.
- LMDB cache: defaults to `.cache/docs-cli` under `--cwd`; override with `--lmdb-path`. Ensure the directory is writable if pointing to system paths.
- Truncation: docs are truncated to ~4000 chars before embedding to keep memory small.
- Semantic output: ES returns score + first highlight; Ollama/Transformers/Local return score only. Chroma flags are placeholders until embeddings + collection wiring is added.
- Help is grouped/sorted with examples; `--trace` shows pre/post action hooks and merged options.
```
