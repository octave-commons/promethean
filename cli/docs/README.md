# @promethean/docs-cli (scaffold)

Minimal CLI to search/view docs and emit Dataview-like tables for agile tasks. Semantic search is stubbed; keyword/regex run locally.

## Usage

Build once (optional):

```bash
pnpm --filter @promethean/docs-cli run build
```

Search (keyword):

```bash
node cli/docs/dist/cli.js search keyword "kanban" --category docs
```

Regex search:

```bash
node cli/docs/dist/cli.js search regex "kanban" --path "docs/agile/**/*.md"
```

View a file (keeps Dataview blocks intact):

```bash
node cli/docs/dist/cli.js view docs/HOME.md
```

Agile tasks summaries (frontmatter-driven):

```bash
node cli/docs/dist/cli.js tasks summary           # markdown tables
node cli/docs/dist/cli.js tasks summary --format json
```

Planned:

- `search semantic` will route to ES+embeddings once wired.
- `docs config` will source categories/actors from a shared config file.
- `template run` and `index` actions to be added next.
