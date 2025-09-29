---
uuid: e6a16b59-a67d-4df9-babc-9faaaad3f9c9
title: Remove CommonJS artifacts from repository
status: document
priority: P2
labels: ["#codex-task", "#doc-this"]
created_at: '2025-09-20T21:30:00.000Z'
---
# Remove CommonJS artifacts from repository

## Problem
The codebase mixes ES module tooling with lingering CommonJS patterns (`.cjs` configs, `require()` usage, and "commonjs" annotations).
These stragglers break consistency, complicate bundling, and violate the repo rule banning `require`.

## Outcome
The repository should rely solely on ES module syntax and file extensions, replacing CommonJS artifacts with equivalent ESM/TypeScript constructs.

## Proposed steps
- Inventory all `.cjs` files, `require()` calls, and documentation references.
- Determine replacement patterns (e.g., convert configs to `.ts` or `.mjs`, swap `require` for `import`).
- Update build/test tooling to consume the new module shapes.
- Document any exceptions or migration blockers.

## Definition of done
- No source-controlled file or documentation references `.cjs`, `CommonJS`, or `require()` semantics unless explicitly recorded as a future task.
- Tooling and tests succeed using the updated module formats.
- Migration notes highlight remaining blockers if a full conversion is not yet possible.

# Status history
- 2025-09-20: Moved from **Incoming** to **Accepted** after clarifying scope and confirming repository-wide coverage expectation.
- 2025-09-20: Advanced to **Breakdown** to inventory `.cjs` modules, `require()` usage, and documentation references.
- 2025-09-20: Transitioned to **Ready** after carving executable slices for the migration.
- 2025-09-20: Pulled into **To Do** for execution of the initial inventory/documentation slice.
- 2025-09-20: Moved to **In Progress** while compiling exhaustive inventories and migration strategy.
- 2025-09-20: Entered **In Review** with a repository-wide audit, slice plan, and outstanding work log.
- 2025-09-20: Shifted to **Document** after capturing evidence, counts, and open follow-ups for handoff.

## Current inventory

| Category | Count | Notes |
| --- | --- | --- |
| Package-level `.eslintrc.cjs` files | 33 | Each extends `config/.eslintrc.base.cjs`; should migrate to a shared ESM preset. |
| CommonJS lint scripts | 2 | `scripts/check-changelog.cjs` and `scripts/check-changelog-fragments.cjs`, consumed by AVA tests. |
| PM2 ecosystem fixtures | 2 | Located at `packages/heartbeat/fixtures/ecosystem.fixture.config.cjs` and `services/js/heartbeat/tests/test-ecosystem.config.cjs`. |
| `package.json` files exporting `dist/index.cjs` | 45 | `main` and `exports.require` rely on CommonJS build artifacts across workspace packages. |
| Tooling & docs references | ≥6 | Includes `.pnpmfile.cjs`, `.depcruise.cjs`, and troubleshooting guides that teach `.cjs` usage. |

## Risks & decisions
- Lint/test harnesses may assume CommonJS module shape; replacing with `.ts`/`.mjs` requires ensuring consumption sites support `import`.
- Package build pipelines must emit `.mjs` or `.js` ESM bundles; confirm `tsup`/`tsc` configs before changing published entry points.
- Some docs intentionally mention `.cjs` for historical instructions—need policy on archival content vs active guidance.

## Upcoming slices
1. Convert shared ESLint config to ESM/TypeScript and update package-level `.eslintrc.cjs` files.
2. Replace CommonJS lint scripts with `.mjs` equivalents and adjust invoking tests.
3. Reconfigure package build outputs (`package.json` exports & build tooling) away from `dist/index.cjs`.
4. Update docs/tooling references and record any intentionally retained `.cjs` fixtures.

## Evidence gathered

```bash
find packages -maxdepth 2 -name '.eslintrc.cjs' | wc -l
# → 33

python - <<'PY'
from pathlib import Path
import json
count = 0
for pkg in Path('packages').glob('*/package.json'):
    data = json.loads(pkg.read_text())
    if data.get('main') == 'dist/index.cjs' or any(
        isinstance(v, dict) and v.get('require') == './dist/index.cjs'
        for v in (data.get('exports') or {}).values()
        if isinstance((data.get('exports') or {}), dict)
    ):
        count += 1
print(count)
PY
# → 45

find . -name '*.cjs' | sort | head -n 40
```

## Outstanding work
- Replace the 33 package-level `.eslintrc.cjs` files after introducing an ESM-compatible shared config.
- Decide on migration path for 45 package entry points that currently emit `dist/index.cjs` bundles.
- Port CommonJS automation scripts (`check-changelog*.cjs`, PM2 fixtures) to ESM while keeping test harnesses functional.
- Sweep documentation/tooling references for `.cjs` instructions and either modernize or archive them.

#Document #doc-this #codex-task
