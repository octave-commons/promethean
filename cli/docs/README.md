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
  - Semantic/Local deterministic fallback (no network):
    - `--local-embed-dim <dim>` (env: `DOCS_LOCAL_EMBED_DIM`, default 384)
    - `--local-embed-model <id>` (env: `DOCS_LOCAL_EMBED_MODEL`, default `local-hash`)
  - Caching:
    - `--lmdb-path <path>`: LMDB cache for embeddings (env: `DOCS_CACHE_PATH`, default `.cache/docs-cli` under cwd)
  - Semantic/Chroma placeholders (for future local vector store):
    - `--chroma-path <path>` (env: `DOCS_CHROMA_PATH`)
    - `--chroma-collection <name>` (env: `DOCS_CHROMA_COLLECTION`)
- Examples:
  - `promethean-docs search keyword kanban -c docs`
  - `promethean-docs s regex "kanban" --path "docs/agile/**/*.md" --format json`
  - `promethean-docs search semantic "project vision" --es-url http://localhost:9200 --es-index docs`
  - `promethean-docs search semantic "project vision" --ollama-url http://localhost:11434 --ollama-model nomic-embed-text`
  - `promethean-docs search semantic "project vision" --local-embed-dim 256 --lmdb-path /tmp/docs-cache`

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

- Semantic mode prefers Elasticsearch; with `--ollama-url` it uses local Ollama embeddings; otherwise it falls back to deterministic local embeddings (no network) and caches embeddings via LMDB. Returned markdown output includes score and first highlight (ES) or score (Ollama/local). Chroma flags are placeholders until embeddings + collection wiring is added.
- Help is grouped/sorted with examples; `--trace` shows pre/post action hooks and merged options.
