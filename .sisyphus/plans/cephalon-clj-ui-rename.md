# Cephalon-CLJ Rename + HumbleUI Addition

## TL;DR

> **Quick Summary**: Add a new JVM HumbleUI app (Status + Chat + Input + Logs) inside the brain module while keeping existing TUIs intact, then fully rename the repository (paths, namespaces, configs, docs) to `cephalon-clj` with root namespaces under `cephalon.*`.
>
> **Deliverables**:
> - New HumbleUI app entrypoint inside the brain module
> - Updated deps/configs to include HumbleUI and new UI run alias
> - Full rename of folders, namespaces, build targets, PM2 app names, package names, and docs to `cephalon-clj`
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: UI addition → Rename passes → Tests/verification

---

## Context

### Original Request
"I want a humble ui for @orgs/octave-commons/promethean-discord-io-bridge/ and I want the whole project to be renamed to `cephalon-clj`."

### Interview Summary
**Key Decisions**:
- Add a new JVM HumbleUI app inside `brain/` without replacing existing TUIs.
- New UI feature set: Status + Chat + Input + Logs.
- Rename scope: full rename, including filesystem paths, namespaces, and build targets.
- Root namespaces should be `cephalon.*`.
- Subcomponent naming pattern: `cephalon-clj-<part>`.
- Tests-after strategy using existing test commands.

**Research Findings**:
- Admin TUI entrypoint: `admin-tui/shadow-cljs.edn` → `duck-admin.main/-main` with UI in `admin-tui/src/duck_admin/main.cljs`.
- JVM Lanterna TUI: `brain/src/brain/admin_tui.clj`.
- Naming references in `ecosystem.pm2.edn`, `admin-tui/package.json`, `admin-tui/README.md`, `docs/duck-deployment.md`, root `README.md`, `discord-io/shadow-cljs.edn`, `brain/deps.edn`, `shared/deps.edn`.
- Tests exist in `brain/test/**` (Clojure CLI alias `:test`) and `admin-tui/test/**` (`npm test`).

### Metis Review
**Identified Gaps (addressed)**:
- Guardrails added to prevent UI feature creep and avoid modifying existing TUIs.
- Explicit validation steps for rename completeness and PM2 integrity.
- Phased execution separating UI addition from rename pass.

---

## Work Objectives

### Core Objective
Deliver a new minimal HumbleUI-based UI alongside existing TUIs, then fully rename the project to `cephalon-clj` across code, paths, configs, and docs without changing runtime behavior.

### Concrete Deliverables
- New HumbleUI entrypoint under the brain module with Status + Chat + Input + Logs.
- Updated brain deps/aliases to run the new UI.
- Renamed directories (brain, discord-io, admin-tui, shared) and namespaces to `cephalon.*`.
- Updated PM2 ecosystem names, package names, build targets, and documentation references.

### Definition of Done
 - [x] New HumbleUI app starts without errors and connects to admin WS.
 - [x] All namespaces and filesystem paths reflect `cephalon.*` and `cephalon-clj-*` naming.
 - [x] No references to old names remain in repo (validated via search).
 - [x] Existing tests pass: `clojure -A:test` and `npm test`.

### Must Have
- Add new UI without removing or changing existing TUIs.
- Full rename using `cephalon.*` namespaces and `cephalon-clj-*` labels.
- Tests-after execution with existing test commands.

### Must NOT Have (Guardrails)
- Do not modify behavior of existing TUIs.
- Do not add extra UI features beyond Status + Chat + Input + Logs.
- Do not introduce new protocols or change admin WS message semantics.
- Do not rename external repos or services unless explicitly requested.
- Do not add a PM2 app entry for the new UI unless explicitly requested.

---

## Verification Strategy (Tests-After)

### Test Decision
- **Infrastructure exists**: YES
- **User wants tests**: Tests-after
- **Framework**: clojure.test (brain), shadow-cljs/cljs.test (admin-tui)

### Tests-After Workflow
1. Implement UI and rename changes.
2. Run existing tests:
   - `cd cephalon-clj-brain && clojure -A:test`
   - `cd cephalon-clj-admin-tui && npm test`

### Automated Verification (Agent-Executable)

**New HumbleUI start (CLI)**:
```bash
# Agent runs from repo root or cephalon-clj-brain dir after rename
clojure -M -m cephalon.ui.main
# Assert: process starts without exception and logs a startup line like "[ui] ready"
```

**Rename completeness (grep)**:
```bash
# Agent runs from repo root
rg "promethean-discord-io-bridge|promethean-discord|duck-admin|duck_admin" . \
  --glob '!**/node_modules/**' \
  --glob '!**/.clj-kondo/**' \
  --glob '!**/dist/**' \
  --glob '!**/logs/**'
# Assert: no matches outside vendor/cache artifacts
```

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (UI addition, no rename changes yet):
├── Task 1: Add HumbleUI dependency + new UI entrypoint inside brain
└── Task 2: Add minimal UI state + admin WS client wiring (reuse existing message patterns)

Wave 2 (Rename pass + verification):
├── Task 3: Rename directories + namespaces to cephalon.*
├── Task 4: Update build targets, package names, PM2 ecosystem, docs
└── Task 5: Verification (tests-after + rename search)

Critical Path: Task 1 → Task 2 → Task 3 → Task 4 → Task 5

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|----------------------|
| 1 | None | 2 | None |
| 2 | 1 | 3 | None |
| 3 | 2 | 4 | None |
| 4 | 3 | 5 | None |
| 5 | 4 | None | None |

---

## TODOs

- [x] 1. Add HumbleUI dependency and new UI entrypoint in brain

  **What to do**:
  - Add HumbleUI git dependency to `brain/deps.edn`.
  - Add a new Clojure CLI alias (e.g., `:ui`) that runs the new entrypoint.
  - Create a new UI namespace under `brain/src/brain/` (pre-rename) with a `-main` entrypoint.
  - Log a startup line to support automated verification.

  **Must NOT do**:
  - Do not modify existing TUIs or admin WS server behavior.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: New UI entrypoint and deps changes across JVM Clojure code.
  - **Skills**: [`workspace-navigation`]
    - `workspace-navigation`: locate correct module boundaries and Clojure entrypoints.
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: UI is JVM HumbleUI, not web front-end styling.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (sequential)
  - **Blocks**: Task 2
  - **Blocked By**: None

  **References**:
  - `brain/deps.edn` - add HumbleUI dependency and UI run alias.
  - `brain/src/brain/admin_tui.clj` - existing TUI patterns for state + WS wiring (do not modify).
  - `admin-tui/src/duck_admin/main.cljs` - reference for required UI features (chat/log/status).
  - HumbleUI docs: `https://github.com/HumbleUI/HumbleUI` - entrypoint and widget patterns.

  **Acceptance Criteria**:
  - [x] New UI entrypoint exists and runs without error.
  - [x] Startup log emitted (e.g., `[ui] ready`) for automated verification.

- [x] 2. Implement HumbleUI layout and admin WS client (status/chat/input/logs)

  **What to do**:
  - Build minimal HumbleUI layout for Status + Chat + Input + Logs.
  - Reuse admin WS message ops from existing TUIs (hello, tools list, sessions, chat send, log stream).
  - Use the same env var for WS URL (`DUCK_ADMIN_WS_URL`) to keep compatibility.
  - Ensure state updates mirror existing semantics (connected status, logs, messages).

  **Must NOT do**:
  - Do not add extra panels beyond the agreed scope.
  - Do not alter admin WS server contracts.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: New UI logic and WS integration.
  - **Skills**: [`workspace-navigation`]
    - `workspace-navigation`: navigate existing admin WS message patterns.
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: not applicable for JVM HumbleUI.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (sequential)
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:
  - `brain/src/brain/admin_ws.clj` - admin WS ops and message payloads.
  - `brain/src/brain/admin_tui.clj` - message handling logic for logs/messages.
  - `admin-tui/src/duck_admin/main.cljs` - UI state keys and message handling patterns.

  **Acceptance Criteria**:
  - [x] Status shows connection state and loop status.
  - [x] Chat input sends `:admin/chat.send` and updates message list on incoming messages.
  - [x] Logs display incoming `:admin/log` lines.

- [x] 3. Rename directories and namespaces to `cephalon.*`

  **What to do**:
  - Rename folders: `brain/`, `discord-io/`, `admin-tui/`, `shared/` to `cephalon-clj-<part>/`.
  - Rename namespaces from `brain.*`, `discord_io.*`, `duck-admin.*`, `promethean.*` to `cephalon.*` variants.
  - Apply explicit mapping:
    - `brain` → `cephalon-clj-brain` and `brain.*` → `cephalon.brain.*`
    - `discord-io` → `cephalon-clj-discord-io` and `discord_io.*` → `cephalon.discord-io.*`
    - `admin-tui` → `cephalon-clj-admin-tui` and `duck-admin.*` → `cephalon.admin-tui.*`
    - `shared` → `cephalon-clj-shared` and `promethean.*` → `cephalon.*`
  - Use `git mv` for filesystem changes to preserve history.

  **Must NOT do**:
  - Do not alter behavior beyond renaming.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Large-scale rename across Clojure/CLJS.
  - **Skills**: [`workspace-navigation`]
    - `workspace-navigation`: map old namespaces to new paths.
  - **Skills Evaluated but Omitted**:
    - `submodule-ops`: only needed if updating parent workspace submodule paths.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential)
  - **Blocks**: Task 4
  - **Blocked By**: Task 2

  **References**:
  - `brain/src/brain/` and `brain/test/brain/` - rename to `cephalon/brain/` (or `cephalon/brain/**`).
  - `discord-io/src/discord_io/` - rename to `cephalon/discord_io/`.
  - `admin-tui/src/duck_admin/` - rename to `cephalon/admin_tui/`.
  - `shared/src/promethean/` - rename to `cephalon/`.
  - `admin-tui/shadow-cljs.edn` and `discord-io/shadow-cljs.edn` - update `:main` namespace.
  - `brain/deps.edn` and `shared/deps.edn` - update namespaces and paths.

  **Acceptance Criteria**:
  - [x] All namespaces compile under new paths.
  - [x] No references to old namespaces remain in source/tests.

- [x] 4. Update configs, PM2 ecosystem, package names, and docs

  **What to do**:
  - Update PM2 app names to `cephalon-clj-*` in `ecosystem.pm2.edn`.
  - Update package names and README references (`admin-tui/package.json`, docs, root README).
  - Update scripts, build targets, and paths to renamed directories.
  - If the workspace submodule folder name changes, update the parent `.gitmodules` and any workspace docs that reference the old path.

  **Must NOT do**:
  - Do not change runtime behavior; rename only.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: mostly config/doc edits.
  - **Skills**: [`workspace-navigation`]
    - `workspace-navigation`: locate all references accurately.
  - **Skills Evaluated but Omitted**:
    - `opencode-configs`: not required for this repo's local configs.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential)
  - **Blocks**: Task 5
  - **Blocked By**: Task 3

  **References**:
  - `ecosystem.pm2.edn` - rename app names and updated paths.
  - `admin-tui/package.json` - update package name.
  - `admin-tui/README.md` - update paths and naming.
  - `docs/duck-deployment.md` - update PM2 names and paths.
  - `README.md` - update project title and references.

  **Acceptance Criteria**:
  - [x] Docs/configs use `cephalon-clj` naming consistently.
  - [x] PM2 app names match new naming.

- [x] 5. Tests-after verification and rename completeness checks

  **What to do**:
  - Run existing tests in renamed locations.
  - Search for remaining old names.

  **Must NOT do**:
  - Do not skip tests.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: execution of existing commands.
  - **Skills**: [`workspace-navigation`]
    - `workspace-navigation`: ensure commands run in correct folders.
  - **Skills Evaluated but Omitted**:
    - `workspace-build`: not required unless tests fail.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential)
  - **Blocks**: None
  - **Blocked By**: Task 4

  **References**:
  - `brain/deps.edn` - test alias `:test` command.
  - `admin-tui/package.json` - `npm test`.

  **Acceptance Criteria**:
  - [x] `clojure -A:test` passes in `cephalon-clj-brain`.
  - [x] `npm test` passes in `cephalon-clj-admin-tui`.
  - [x] `rg "promethean-discord-io-bridge|promethean-discord|duck-admin|duck_admin" . --glob '!**/node_modules/**' --glob '!**/.clj-kondo/**' --glob '!**/dist/**' --glob '!**/logs/**'` yields no matches.

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 2 | `feat(ui): add humbleui admin client` | new UI files + brain deps | start UI command |
| 4 | `refactor(rename): rename to cephalon-clj` | renamed paths, configs, docs | tests-after |

---

## Success Criteria

### Verification Commands
```bash
cd cephalon-clj-brain && clojure -A:test
cd cephalon-clj-admin-tui && npm test
rg "promethean-discord-io-bridge|promethean-discord|duck-admin|duck_admin" . \
  --glob '!**/node_modules/**' \
  --glob '!**/.clj-kondo/**' \
  --glob '!**/dist/**' \
  --glob '!**/logs/**'
```

### Final Checklist
- [x] New HumbleUI app runs and connects to admin WS.
- [x] Existing TUIs remain unchanged and operational.
- [x] All rename changes applied across paths, namespaces, configs, and docs.
- [x] Tests pass after changes.
