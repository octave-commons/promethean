# Discovery Report: riatzukiza/promethean

## What’s going on high-signal

- **Active shift to file-first project mgmt + ECS refactor.**  
  Open PRs wire a *file-backed* board system `/boards` + schema + CI and migrate Kanban/heartbeat into **ECS “worlds”** and an ECS-based filesystem facade (PRs #1157, #1159, #1160, #1161).
- **Security holes in sandboxed FS (MCP).**  
  Three open vulns target symlink escapes and missing parity checks in `packages/mcp/src/files.ts` (Issues #1143, #1144, #1145). These are real and exploitable in typical sandbox models.
- **Release/versioning in flux.**  
  Towncrier fragments for 0.1.0 were staged/closed (#1151). A separate **Changesets** setup is open (#1152) with an “Option A” plan prefer PR-gated semver + per-pkg CHANGELOGs.
- **Infra & hygiene.**  
  - **Fastify bumped to 5.3.2** via Dependabot (security) and merged (#1139).  
  - **Lockfile “healer”** workflow proposed (#1162) to auto-refresh pnpm lockfiles.  
  - Legacy Python/Hy tooling removal is in flight (#1154).  
  - Some non-JS runners called out as failing in container notes (e.g., `bb`, `clojure`)—good to purge or isolate fully.

## What needs attention first (in order)

1. **Patch the MCP filesystem vulns** (#1143, #1144, #1145).  
   - Add **symlink-aware guards** everywhere a path is accepted: `realpath` parent dir, `lstat` targets, refuse `S_IFLNK` on any write path, enforce “inside root” on the **resolved** path, and open with `O_NOFOLLOW` semantics where possible.  
   - Bring **`writeFileLines`** to parity with `writeFileContent`.  
   - Expand AVA tests: synthetic tree with nested symlinks pointing out of root; ensure reads/writes/tree walk all fail closed.  
   - This is the only category I’d block releases on.

2. **Stabilize ECS FS + Kanban pipeline (open PRs #1157–#1161).**  
   - Make the ECS FS facade the *only* write path; kill any direct fs calls left in Kanban/heartbeat.  
   - Ensure **idempotency** on intents and deterministic snapshot/write buffering.  
   - Prove lifecycle via AVA: intent → snapshot → buffered write → final fs state; assert no partials on errors.

3. **Decide on versioning: pick Changesets or Towncrier as source of truth.**  
   - My take: **Changesets** for publish/versioning/changelogs per package; **Towncrier** optional for curated top-level notes. Don’t run both for version computation.

4. **Land the board file-first CI path (#1157) then automation (#1158).**  
   - Validate tasks via schema + lints on CI.  
   - Generate `boards/index.jsonl` (write mode gated) and keep mirrors GH Issues/Projects **downstream** and optional.  
   - Ship a tiny **WebComponent** viewer for `index.jsonl` (native ESM, no framework, flat package).

5. **Adopt the lockfile healer (#1162)** but limit its blast radius.  
   - Scope to a dedicated bot branch, auto-PR, never commit to `main` directly, and fail fast if `pnpm` major changes lockfile format.

## Risks / gotchas I see

- **Sandbox trust model**: “check + then use” races if you don’t anchor the write with `O_NOFOLLOW` (or Node’s nearest safe equivalent) and re-validate after open.  
- **ECS write buffering**: buffering combined with symlink guards can diverge if normalization differs between layers. Normalize **once**, early, in the facade.
- **Dual changelog systems**: Two sources of truth → guaranteed drift. Decide now.
- **CI noise** from automated PRs Dependabot + healer + projector. Use labels + auto-merge rules carefully, or it’ll bury real work.
- **Private packages**/registry hiccups noted in PR text 404 on `@promethean/markdown`. Either publish, proxy, or gate tests to skip optional pkgs on CI.

## Concrete fixes (short and sharp)

- **FS guard utility** (pure functions, ESM TS, functional style):
  - `resolveToRoot(root: URL | string, p: string): Promise<{ abs: string, real: string }>` → returns normalized absolute and `realpath`.
  - `assertInsideRoot(rootReal: string, real: string): void` → throws if `!real.startsWithrootReal + sep`.
  - `rejectSymlink(lstat: fs.Stats): void` → throws if `lstat.isSymbolicLink()`.
  - Compose these in `readFile`, `writeFileContent`, `writeFileLines`, and `treeDirectory`. No mutation; return new values; small composable helpers.
- **Open flags**: Where Node allows, open writes with `fs.openpath, fs.constants.O_NOFOLLOW | O_WRONLY | O_CREAT | O_TRUNC, 0o600` and then `fstat` to verify still not a symlink (defend against TOCTOU).
- **AVA tests**:
  - Build a tmp sandbox with: `safe/ok.txt`, `safe/link-dir -> /etc`, `safe/link-file -> /etc/hosts`.  
  - Expect `treeDirectory('safe')` to **skip/fail** on links that resolve outside root; expect all writes via links to throw.  
  - Table-driven tests for all entry points.

## Versioning call (my recommendation)

- **Merge #1152 (Changesets)**.  
  - Keep Towncrier only for a top-level human changelog fed from Changeset summaries.  
  - Add `release.yml` that:  
    1) runs `pnpm dlx @changesets/cli version` on main,  
```
2) builds/publishes with `NPM_TOKEN`,
```
    3) commits generated changelogs.  
  - SemVer rule reminder: in `0.x`, **feature + breaking → minor**, fixes → patch.

## Board/docops plan that won’t spiral

- Land **schema + lints + indexer** first (#1157).  
- **Projector** gets a **dry-run by default**; `--apply` guarded by `GITHUB_TOKEN`.  
- Build a **single-file WebComponent** that renders `index.jsonl` (native ESM, no framework; sortable columns; keyboard nav).  
- DocOps: generate release notes from Changesets; Towncrier optional aggregator.

## One-week action plan

- **Day 1–2: Security closeout**
  - Patch #1143/#1144/#1145 with the shared guard utilities + AVA suite.
  - Add CI job `security-fs-check` that runs only the MCP FS tests.

- **Day 3: ECS pipeline hardening**
  - Merge FS ECS (#1160) and Kanban ECS integration #1159/#1161 after adding deterministic tests.  
  - Kill any direct fs path left in Kanban/heartbeat.

- **Day 4: Versioning**
  - Merge #1152; add `release.yml`; run a dry run; publish canaries with `-next` tag if desired.

- **Day 5: Boards**
  - Merge #1157, wire `index.jsonl` writer behind `--write`, CI lints always.  
  - Start the minimal WebComponent viewer native ESM, flat package, GPL-3.0-only.

- **Day 6: Hygiene**
  - Merge #1162 healer; scope schedules; label as `automation`.  
  - Normalize repo: remove dead `bb/clojure` paths from CI; ensure `pnpm` + `ava` is the single test runner.

- **Day 7: Buffer**
  - Triage remaining Dependabot/infra PRs; close stale issues; write a short SECURITY.md explaining the sandbox model and guarantees.

## Quick triage decisions I’d make (opinionated)

- ✅ Merge: #1139 (already merged), #1146/#1147/#1148 (merged), move on.  
- 🔴 Block release until: #1143/#1144/#1145 fixed.  
- ✅ Proceed: #1157–#1161 once tests are beefed up and FS facade is sole writer.  
- ✅ Adopt: #1152 (Changesets) over Towncrier as the mechanism (keep Towncrier as presentation only).  
- ⚠️ Keep #1162 but don’t let it commit to `main`; auto-PR only.