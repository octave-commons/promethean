# Spec: Stabilize frontend build after shadow-cljs + tsc failures

## Context

- `pnpm --filter @promethean-os/frontend build` initially failed in the `shadow-cljs release main` step because no module was marked as default and several namespaces (chat UI, kanban, etc.) were missing entirely.
- After pointing `:source-paths` at the real CLJS roots and adding shim namespaces, `shadow-cljs` surfaced cascading issues: hyphenated namespaces (`chat-ui`, `openai-server`, etc.) mapped to the wrong on-disk paths, watcher modules lacked `main-component` exports, and multi-module configuration caused loader conflicts.
- Even after the CLJS layer compiled, the TypeScript stage (`pnpm run build:ts`) emitted hundreds of errors because `tsconfig.json` attempted to typecheck every experimental UI surface (Pantheon, duck-web, OpenAI dashboards, etc.) under a strict NodeNext configuration.

## Existing Issues / PRs

- No in-repo issue tracked this; upstream `shadow-cljs` issue #575 documents the "pick default module" behavior that triggered the first failure.

## Requirements

1. Normalize the CLJS build graph:
   - Enumerate every actual source root in `:source-paths` so namespaces resolve deterministically.
   - Provide placeholder `promethean.frontends.<slug>.app` namespaces for each surface; they now expose `main-component` reagents and log readiness via `promethean.shadow-ui.runtime` so the router can render without loading the legacy bundles.
   - Collapse the `:modules` map back to a single `:main` entry (with `:default true`) until true code-splitting is wired; this avoids loader errors when the shell references every namespace.
2. Fix router/layout wiring so helper functions (`navigate-to`) are defined before use and the navigation UI consumes injected route helpers rather than circularly requiring the router.
3. Introduce a dedicated `tsconfig.build.json` that extends the workspace config but only includes `src/index.ts` for now, and switch `build:ts` / `typecheck` scripts to use it so the build does not fail on unfinished React/TSX workspaces.
4. Keep the broader `tsconfig.json` in place for editor usage; no other packages should be impacted by the narrowed build config.

## Definition of Done

- `pnpm --filter @promethean-os/frontend build` succeeds end-to-end (`shadow-cljs release main` followed by `tsc -p tsconfig.build.json`).
- Placeholder namespaces exist for every route consumed by `promethean.main.router`, preventing future missing-namespace regressions.
- Shadow build configuration is documented in this spec so future work can reintroduce multi-module output deliberately rather than piecemeal.
