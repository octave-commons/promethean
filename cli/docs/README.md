# @promethean-os/docs-cli

Commander-forward CLI to search/view docs and summarize agile tasks. Semantic search can hit Elasticsearch when configured; keyword/regex/fuzzy run locally.

## Install/build

```bash
pnpm --filter @promethean-os/docs-cli run build
```

## Embed as subcommand in promethean CLI

```ts
import { Command } from 'commander';
import { buildDocsCommand } from '@promethean-os/docs-cli';

const program = new Command('promethean');
program.addCommand(buildDocsCommand(undefined, { asSubcommand: true }));
program.parseAsync(process.argv);
```

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

## Knowledge graph view (text-only)

```bash
# build the knowledge graph first
pnpm --filter @promethean-os/knowledge-graph run cli -- build .
# emit Markdown tables (or JSON with --format json)
pnpm --filter @promethean-os/docs-cli cli graph --db knowledge-graph.db
```

- Default DB path is `<cwd>/knowledge-graph.db`; override with `--db`.
- Output is Markdown tables for nodes/edges; use `--format json` for machine-readable output.

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
