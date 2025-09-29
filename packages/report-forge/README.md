# @promethean/report-forge

Create terse, actionable Markdown reports from GitHub issues using a **local LLM** (Ollama by default).

- Native ESM, functional style, immutable transforms.
- Flat package, `.js` extension imports in TS.
- Tested with AVA.
- License: GPL-3.0-only.

## Install

```sh
pnpm -w add -D @promethean/report-forge
```

## CLI

```sh
report-forge riatzukiza/promethean docs/reports/promethean_issues_report.md
```

Requires an Ollama server (default `http://127.0.0.1:11434`) and optional `GITHUB_TOKEN` for higher rate limits.

## API

```ts
import { generateReport } from '@promethean/report-forge'
import { ollama } from '@promethean/report-forge/dist/lib/ollama.js'
import { github } from '@promethean/report-forge/dist/lib/github.js'

const gh = github(process.env.GITHUB_TOKEN)
const issues = await gh.listIssues('riatzukiza/promethean', { state: 'all' })
const md = await generateReport({ repo: 'riatzukiza/promethean', issues }, { llm: ollama() })
```

## Philosophy

- **Separation of concerns**: fetch → summarize → render.
- **Pure functions**: transform data without mutation.
- **Templates last**: the LLM polishes content, not control structure.

## Tests

```sh
pnpm --filter @promethean/report-forge test
```

## Config
- `Ollama`: set `OLLAMA_BASE` and `OLLAMA_MODEL` via wrapper if you fork `ollama()`
- `GitHub`: set `GITHUB_TOKEN`
