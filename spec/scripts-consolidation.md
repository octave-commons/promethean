# Scripts Directory Consolidation Review

## Context & Observations

- `scripts/automation-batch-generator.mjs:25-177` scans the live kanban board via `pnpm kanban list` and synthesizes pipeline/type/test/doc fix tasks entirely in Node scripts, duplicating `@promethean-os/kanban` task-automation capabilities.
- `scripts/pipeline-fix-generator.mjs:12-199` and `scripts/type-fix-automation.mjs:11-195` emit markdown tasks directly into `docs/agile/tasks`, bypassing the board SDK exposed by `packages/kanban/src/board/*` and making automation logic impossible to test.
- `scripts/board-health-monitor.mjs:13-134` reimplements WIP accounting, duplicate detection, and healing logic already present under `packages/kanban/src/board/lints.ts` and related modules; it should be folded into the package instead of parsing markdown itself.
- `scripts/debug/debug_grep_esm.js:7-20` still points at `packages/smartgpt-bridge`, a package that no longer exists, so the script cannot succeed and is a candidate for archival.
- `scripts/piper-docops.mjs:5-115` (and sibling Piper scripts) import `../packages/pipelines/docops/dist/*.js` directly, essentially acting as thin wrappers that belong inside the `@promethean-os/docops` package CLI surface.
- `scripts/pm2-quickstart.mjs:10-151` shells out to PM2/NX and conditionally executes other scripts; its behavior overlaps the dedicated `packages/pm2-helpers` package which already owns ecosystem scaffolding.
- Documentation task `docs/agile/tasks/remove_commonjs_artifacts_repo_wide.md:49-116` explicitly calls out `scripts/check-changelog*.cjs` as CommonJS debt, yet four nearly identical variants (`check-changelog*.{mjs,ts}`) still live under `scripts/` even though `@promethean-os/docops` exposes `docops-check-changelog` via `packages/pipelines/docops/package.json:2-38`.

## Existing Issues / References

- `docs/agile/tasks/remove_commonjs_artifacts_repo_wide.md:49-116` (Done, but documents outstanding CJS debt for `check-changelog*.cjs`).
- `docs/agile/reports/automation-dashboard.md:16` lists `scripts/automation-batch-generator.mjs` as the current entry point; migrating it requires updating this report.

## Requirements

1. Produce an authoritative inventory of every file under `scripts/`, including status (active, duplicate, obsolete) and owning domain.
2. For each active script, name the target package (e.g., `@promethean-os/kanban`, `@promethean-os/docops`, `@promethean-os/security`, `@promethean-os/pm2-helpers`) or justify removal.
3. Identify duplicated implementations (e.g., the multiple `check-changelog` variants, `automation-emergency*.mjs` vs. task generators) and describe a single maintained source of truth.
4. Capture follow-up work required in docs (`scripts/README.md`, automation dashboards, pre-commit hooks) once scripts move or are deleted.

## Definition of Done

- Every `scripts/` entry is classified as **migrate**, **keep (with owner)**, or **retire**, with rationale tied to code or documentation references.
- For all **migrate** entries, the receiving package/module, integration surface (CLI/bin vs. library), and dependency adjustments are specified.
- Deprecated scripts (e.g., broken debug helpers, duplicate CommonJS checkers) have a removal plan including cleanup of any docs/hooks that still reference them.
- The consolidation plan is review-ready with clear sequencing (what to move first, what blockers exist) and explicit verification steps (tests/builds to run in the destination packages).

## Plan

### Phase 1 – Inventory & Evidence Gathering

- Walk the entire `scripts/` tree, annotate each script with owner/package, status, references, and whether it imports build artifacts (e.g., `../packages/*/dist`).
- Cross-check repository references via `rg` to understand who still calls each script (automation dashboards, pre-commit hooks, CI jobs).
- Record broken/outdated dependencies (e.g., `scripts/debug/debug_grep_esm.js` referencing `packages/smartgpt-bridge`).

### Phase 2 – Consolidation Mapping

- Group scripts into domains (Kanban automation, DocOps/Piper, Security, Build/NX, PM2/ops, Misc utilities).
- For each domain, decide whether functionality already exists inside a package (`packages/kanban`, `packages/pipelines/docops`, `packages/security`, `packages/pm2-helpers`, `packages/utils`) or needs a new one.
- Author migration notes covering API surface, configuration, and how to expose CLI commands (e.g., add bin entries in `package.json`).

### Phase 3 – Migration & Retirement Plan

- Draft the concrete steps to move logic (create package entry points, add tests, delete redundant scripts, update docs & dashboards).
- Specify validation per package (e.g., `pnpm --filter @promethean-os/kanban test` after porting automation tasks, `pnpm --filter @promethean-os/docops build` once check-changelog moves).
- Define a sunset checklist for `scripts/` (update `scripts/README.md`, remove obsolete directories like `debug/`, ensure CI references point at package CLIs).
