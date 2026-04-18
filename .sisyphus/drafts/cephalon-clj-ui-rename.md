# Draft: Cephalon-CLJ Rename + Humble UI

## Requirements (confirmed)
- “humble ui for @orgs/octave-commons/promethean-discord-io-bridge/”
- “whole project to be renamed to cephalon-clj”
- Provided dependency snippet suggesting HumbleUI usage:
  - `io.github.humbleui/ui` (git dependency with sha)
- Clarification: add a UI without replacing existing TUI(s).

## Technical Decisions
- New UI will be a JVM HumbleUI app inside `brain/`, launched via Clojure CLI.
- Rename scope: full rename including filesystem paths and namespaces/build targets.

## Research Findings
- Admin TUI (OpenTUI/CLJS) entrypoint: `admin-tui/shadow-cljs.edn` → `duck-admin.main/-main` with UI in `admin-tui/src/duck_admin/main.cljs`.
- Admin TUI bridge: `admin-tui/src/duck_admin/bridge.cljs` for OpenTUI React interop.
- Secondary TUI in JVM Clojure: `brain/src/brain/admin_tui.clj` (Lanterna-based).
- Naming surfaces found in configs/docs:
  - `ecosystem.pm2.edn` (pm2 app names with promethean-discord-io / brain / duck variants)
  - `admin-tui/package.json` (name = duck-admin-tui)
  - `admin-tui/README.md`, `docs/duck-deployment.md`, root `README.md`
  - `discord-io/shadow-cljs.edn`, `brain/deps.edn`, `shared/deps.edn`
- Test infrastructure exists:
  - JVM tests in `brain/test/**` via `brain/deps.edn` alias `:test` (main-opts `-m brain.test-runner`)
  - CLJS tests in `admin-tui/test/**` via `npm test` (shadow-cljs compile test + node dist/node-tests.cjs)

## Open Questions
- Should HumbleUI be used for the humble UI, and if so which client should it replace or power?
- Which UI should be made “humble”: CLJS OpenTUI (`admin-tui/`) only, the Lanterna JVM TUI (`brain/admin_tui.clj`), or both?
- What “humble” means in layout terms (which panels/features remain)?
- Desired naming mapping for subcomponents (brain, discord-io, admin-tui, duck profile).
- Test strategy: TDD, tests-after, or manual verification only.

## Scope Boundaries
- INCLUDE: Admin TUI UI adjustments + project naming alignment within this repo.
- EXCLUDE: Cross-repo renames (e.g., promethean-agent-system) unless explicitly requested.
