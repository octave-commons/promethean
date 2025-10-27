# Review: file explorer c39b94ff-9e97-4fba-99d9-5cc713e09e5d

## Summary
The delivered slice still fails the task goals. Multiple disparate file-explorer UIs ship across the workspace, yet none of them surface a fuzzy search workflow or reuse the same backend. The SmartGPT bridge already exposes list/tree/view APIs, but it does not publish a fuzzy search route and still reports traversal violations as generic "file not found" errors. The planning subtask for documenting UX and permission constraints also remains unchecked.

## Findings

1. **UI coverage is fragmented and search-less.** The SmartGPT dashboard imports the legacy `<file-explorer>` component from `sites/components`, which only offers click-to-browse navigation and previews with no search affordance.【F:packages/frontends/smartgpt-dashboard-frontend/src/frontend/main.js†L1-L60】【F:sites/components/file-explorer.js†L19-L105】 Piper ships its own `<file-tree>` element that lists directories via `/api/files` but likewise omits any search box or shortcut.【F:packages/piper/src/frontend/file-tree.ts†L9-L183】 The DocOps dev UI adds yet another explorer, tying its search bar to DocOps-specific `/api/search` endpoints instead of repository-wide fuzzy lookup.【F:packages/frontends/docops-frontend/static/dev-ui/index.html†L40-L85】【F:packages/frontends/docops-frontend/static/dev-ui/js/main.js†L400-L498】 The acceptance criterion to "Search for files by name" is still unfulfilled across the active surfaces.

2. **Bridge backend lacks real fuzzy search.** The shared SmartGPT bridge routes only register list, tree, view, and stacktrace handlers; there is no `/files/search` entry point for UIs to call.【F:packages/smartgpt-bridge/src/routes/v0/files.ts†L8-L188】 The underlying `searchFiles` helper merely performs a lowercase substring filter capped at a single page of results, so even adding a route would not deliver ranked fuzzy matches.【F:packages/fs/src/fileExplorer.ts†L41-L44】 Reusing this backend without improving the algorithm would still miss the requirement.

3. **Restricted-path errors remain opaque.** When `viewFile` fails a root check it throws `new Error("file not found")`, collapsing permission issues into generic 404s.【F:packages/smartgpt-bridge/src/files.ts†L55-L100】 Frontends such as the legacy web component swallow the failure and hide the preview, so users never see a "restricted" message.【F:sites/components/file-explorer.js†L67-L82】 The integration test only asserts that an `error` field exists, so this regression stays undetected.【F:packages/smartgpt-bridge/src/tests/integration/server.files.view.security.test.ts†L9-L17】

4. **Planning subtask still open.** The kanban entry continues to mark "Outline UX and permission constraints" as incomplete, reinforcing the lack of a documented plan for unifying these UIs or clarifying permissions.【F:docs/agile/tasks/file-explorer.md†L23-L33】

## Recommendation
Reject the change and request: (a) a consolidated explorer UI that surfaces fuzzy search across the SmartGPT bridge backend, (b) a genuine fuzzy-ranking implementation plus an exposed `/files/search` route, (c) explicit permission error messaging in the API and clients, and (d) completion of the outstanding planning notes.
