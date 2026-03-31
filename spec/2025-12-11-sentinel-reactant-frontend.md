# Sentinel Reactant Frontend

## Context

- Goal: introduce a Reactant (Reagent/CLJS) browser UI for Sentinel to visualize watcher state and synthetic/raw events.
- Sentinel runtime is Node-targeted CLJS built via `shadow-cljs` (builds `:sentinel` and `:sentinel-test`) located in `services/sentinel/src` (see `core.cljs`, `client/node.cljs`).
- No existing Sentinel UI or browser build target; `shadow-cljs.edn` only defines node builds.
- Reference front-end patterns: `services/mcp-dev-ui-frontend` (browser build via `shadow-cljs`, custom element, state atom, fetch-based data) and `packages/shadow-ui` (npm module) for styling/build conventions.

## Existing files to touch

- `shadow-cljs.edn` (add browser build for Sentinel UI)
- `services/sentinel/package.json` (scripts/deps for frontend build)
- New UI sources under `services/sentinel/src/promethean/sentinel/ui/...` (Reactant components + entrypoint)
- Static host under `services/sentinel/resources/public/index.html` to load built JS.

## Open questions / assumptions

- Assume "Reactant" refers to Reagent/React CLJS UI. No existing Reactant package detected in repo; scaffold with Reagent (already common).
- Data source: initial version used mock stream; now backed by SSE from `sentinel serve` (falls back to mock when opened via `file://`).
- Hosting: build artifacts under `services/sentinel/dist/ui` served by `sentinel serve` HTTP server (default 8787).

## Definition of done

- New shadow-cljs browser build target (`:sentinel-ui`) emitting assets under `services/sentinel/dist/ui` with an init fn.
- Reactant/Reagent UI that:
  - Streams watcher/event feed from Sentinel SSE (`/events`) and shows connection state; mock controls remain as fallback.
  - Shows connection status and allows start/stop of mock stream.
- npm/pnpm scripts to build/watch UI and serve (`build:ui`, `watch:ui`, `serve`).
- UI smoke test (cljs.test) covering event buffer + mock start/stop.
- `pnpm --filter @promethean-os/sentinel test` and `build:ui` succeed.

## Plan (phases)

1. Scaffolding: create UI namespace tree, add Reagent/React deps, add shadow browser build + package scripts.
2. UI implementation: mock-backed client adapter -> now SSE-backed with mock fallback; components for connection status + event list + controls.
3. Testing/build: add cljs.test smoke, run sentinel tests, run UI build; ensure `sentinel serve` hosts UI and SSE.

## Change log

- Added SSE broadcasting from Sentinel publish path and HTTP server (`sentinel serve`) with static UI hosting.
- Added Reactant UI, mock fallback, SSE wiring, tests, and build/serve scripts.
- PM2 ecosystem remains for daemon; serve run documented in README.
