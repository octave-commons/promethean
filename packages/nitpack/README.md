# @promethean/nitpack

Extract & dedupe PR review nits into actionable **codemod** and **policy** task files.

- Native ESM (NodeNext)
- TypeScript, functional style
- No TS path aliases
- Relative imports end with **.js** in source
- License: GPL-3.0-only

## Usage

```bash
pnpm -F @promethean/nitpack start --   --repo riatzukiza/promethean   --pr 688   --out docs/agile/tasks   --token $GITHUB_TOKEN
```

This produces:

- `docs/agile/tasks/pr-688-nitpack-codemods.md`
- `docs/agile/tasks/pr-688-nitpack-policy.md`

Nothing else is modified.

## What it does

1. Fetches PR review comments + issue comments via GitHub API
2. Normalizes text (lowercase, strips code fences/paths)
3. Classifies into nit families (e.g., REL_JS_SUFFIX, NO_TS_PATHS, etc.)
4. Counts occurrences in your repo (ripgrep if present, else Node fallback)
5. Emits two concise task files with **counts**, **globs**, and **fix hints**

## Environment

- Node >= 20 (uses native `fetch`)
- Optional: `rg` (ripgrep) for fast counts
