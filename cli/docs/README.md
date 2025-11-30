# @promethean/docs-cli

Commander-forward CLI to search/view docs and summarize agile tasks. Semantic search is stubbed; keyword/regex/fuzzy run locally.

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
- Examples:
  - `promethean-docs search keyword kanban -c docs`
  - `promethean-docs s regex "kanban" --path "docs/agile/**/*.md" --format json`

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

- Semantic mode currently emits a stub message; embeddings/ES backend to be wired later.
- Help is grouped/sorted with examples; `--trace` shows pre/post action hooks and merged options.
