Scripts Overview

This folder contains utility scripts grouped by purpose. Most scripts are safe to run locally; read each subfolder README for environment assumptions and options.

- kanban/: Board and task automation for docs/agile/boards and docs/agile/tasks.
- docs/: Documentation maintenance utilities (links, orphans, unique chunks).
- audio/: STT/TTS helpers and quick benches.
- indexing/: Helpers for file and embedding indexing.
- sibilant/: Build helpers for Sibilant-based sources.
- misc/: One-off or experimental tools not yet categorized.

## Running scripts

Python utilities can be executed directly with the interpreter:

```
python scripts/simulate_ci.py --job lint
```

TypeScript scripts use [tsx](https://github.com/esbuild-kit/tsx). Use `pnpm exec` (or `npx`) to run them:

```
pnpm exec tsx scripts/lint-topics.ts
pnpm exec tsx scripts/regen-footers.ts --dir docs/unique
```

Use make targets or pnpm/python directly as indicated in subfolder READMEs.

