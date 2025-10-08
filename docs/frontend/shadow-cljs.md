# Shadow-CLJS front-end pipeline

This document explains the initial infrastructure for compiling Promethean's
browser bundles with Shadow-CLJS(https://shadow-cljs.github.io/docs/UsersGuide.html).
It captures the outputs of migration step 1.

## Builds

Shadow builds live in the repository root `shadow-cljs.edn`. Each front-end now
has a dedicated `:browser` target that emits assets to `packages/frontends/<pkg>/dist/frontend`:

| Target | Namespace | Output |
```
| --- | --- | --- |
```
| `docops-frontend` | `promethean.frontends.docops.app` | `packages/frontends/docops-frontend/dist/frontend` |
| `health-dashboard-frontend` | `promethean.frontends.health_dashboard.app` | `packages/frontends/health-dashboard-frontend/dist/frontend` |
| `llm-chat-frontend` | `promethean.frontends.llm_chat.app` | `packages/frontends/llm-chat-frontend/dist/frontend` |
| `markdown-graph-frontend` | `promethean.frontends.markdown_graph.app` | `packages/frontends/markdown-graph-frontend/dist/frontend` |
| `portfolio-frontend` | `promethean.frontends.portfolio.app` | `packages/frontends/portfolio-frontend/dist/frontend` |
| `smart-chat-frontend` | `promethean.frontends.smart_chat.app` | `packages/frontends/smart-chat-frontend/dist/frontend` |
| `smartgpt-dashboard-frontend` | `promethean.frontends.smartgpt_dashboard.app` | `packages/frontends/smartgpt-dashboard-frontend/dist/frontend` |

Shared macros and runtime helpers live under `packages/shadow-ui` and compile
via the `shadow-ui` npm-module build.

## Commands

Each front-end package exposes new PNPM scripts:

```bash
pnpm --filter @promethean/<pkg> run build:shadow   # release build
pnpm --filter @promethean/<pkg> run watch:shadow   # dev watcher
```

NX targets mirror the scripts `shadow-build` and `shadow-watch` so they can be
used in affected pipelines. The repository root also exposes helpers:

```bash
pnpm shadow:build             # build shadow-ui + all front-ends
pnpm shadow:watch             # watch the shared runtime/macros package
pnpm shadow:watch:frontends   # run all front-end watchers in parallel
```

Existing TypeScript builds remain in place while we port code in later steps.

## Macro helpers
```
`@promethean/shadow-ui` introduces:
```
- `promethean.shadow-ui.html/html` – hiccup-style macro that emits HTML strings
  at compile time.
- `promethean.shadow-ui.runtime` – runtime helpers for logging bundle readiness,
  registering custom elements, and injecting HTML strings.

Refer to `packages/shadow-ui/README.md` for usage snippets.
