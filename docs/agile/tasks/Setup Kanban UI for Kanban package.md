---
```
uuid: c3366097-0d29-4c8d-b7e1-32de4cf8072e
```
title: setup kanban ui for kanban package
```
status: in_progress
```
priority: P3
labels:
  - kanban
  - ui
  - framework-core
```
created_at: '2025-10-03T07:25:00.000Z'
```
---
## 🎯 Desired Outcome
A lightweight web UI served from `@promethean/kanban` that visualises the current board using the package's existing loaders, so agents can inspect column WIP without opening Obsidian.

## 📏 Acceptance Criteria
- `pnpm kanban ui` (or equivalent) serves an HTML dashboard reachable locally.
- The UI renders all board columns, task counts, and task metadata (title, priority, labels, created timestamp).
- Data refresh works without reloading the page (manual refresh button and automatic polling acceptable).
- Coverage via unit tests for the render pipeline and a smoke test for the server endpoint.
- README documents how to launch the UI.

## 🛠️ Implementation Notes
- Reuse `loadBoard` to obtain data; expose it through a small HTTP server in `packages/kanban`.
- Implement UI as a module under `src/frontend/` with zero external dependencies (vanilla web components or DOM helpers).
- Ship CSS with the UI so it is readable without further tooling.
- Add AVA tests for HTML rendering and server response.

## ❓ Open Questions / Risks
- Ensure CLI wiring keeps backward compatibility with existing commands.
- Confirm that serving compiled frontend assets from `dist/frontend` works under Nx build output.

## 🔄 Sync Notes (2025-10-20)
- Reviewed the existing UI scaffolding under `packages/kanban/src/frontend/` (`kanban-ui.ts`, `render.ts`, `styles.ts`) to avoid re-implementing the dashboard shell.
- Future polish work should extend these modules (e.g., new components, style tweaks) rather than introducing a parallel build or duplicate entry point.
- Server endpoints already expose the board payload; enhancements can focus on client rendering and refresh UX without touching CLI wiring unless explicitly needed.
