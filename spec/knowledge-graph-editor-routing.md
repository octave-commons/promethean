# Knowledge Graph Editor deep-link routing

- Prompt: ensure `/editor/<path>` URLs (e.g. `/editor/docs/agile/tasks/`) open the requested document path inside the Editor file viewer instead of loading the default blank state.
- Code refs: `services/knowledge-graph/packages/knowledge-graph-ui/src/index.tsx`:18-24 (router currently only mounts `/editor` without splat support), `services/knowledge-graph/packages/knowledge-graph-ui/src/pages/Editor.tsx`:10-199 (Editor layout plus `useFileViewer` wiring), `services/knowledge-graph/packages/knowledge-graph-ui/src/hooks/useFileViewer.ts`:6-125 (async loader already exposes `loadFileIntoViewer` but editor never calls it with URL data), `services/knowledge-graph/packages/knowledge-graph-ui/src/__tests__/editor.test.tsx`:1-65 (coverage limited to node selection), `services/knowledge-graph/packages/knowledge-graph-ui/src/__tests__/portal.test.tsx`:31-71 (Portal router fixture mirrors the same `/editor` route signature).
- Existing issues/PRs: none referenced; request came directly from current task context.
- Definition of done: `/editor/<docPath>` routes match in the deployed Solid router, Editor automatically fetches that `docPath` via `fetchFileContent` on mount and on path changes, UI still supports selecting nodes manually, and `pnpm --filter @promethean-os/knowledge-graph-ui test` passes.
- Requirements:
  1. Router must accept `/editor/*` so deep-link URLs render the Editor shell.
  2. Editor derives the requested doc path (URL-decoded, stripped of leading slash) from the current location without breaking existing viewer state.
  3. When a doc path is present, Editor calls `loadFileIntoViewer` exactly once per change and surfaces existing loading/error indicators.
  4. When no doc path is present, behavior remains unchanged.
  5. Tests cover both the router match and the file viewer deep-link load.

## Plan

### Phase 1 – Router support

1. Update `src/index.tsx` to register the editor route as `/editor/*` (or equivalent catch-all) so nested paths resolve.
2. Mirror the change inside `src/__tests__/portal.test.tsx` to keep the navigation harness aligned.
3. Verify Portal tests (and any cross-route navigation) still cover `/editor`.

### Phase 2 – Editor deep-link loader

1. Inject `useLocation` into `Editor.tsx` and create a memo that normalizes the requested sub-path (trim `/editor`, strip leading `/`, decode URI component, ignore empty values).
2. Pull `loadFileIntoViewer` from `useFileViewer` actions and run it inside a `createEffect` whenever the normalized path changes to a non-empty string; allow reuse for future path changes.
3. Consider `fileViewerPath` or `lastTriedPath` for dedupe if needed, but prefer one-shot loads to avoid resetting user edits unnecessarily.
4. Confirm that manual node selection still works because the effect simply early-returns when there is no deep-link.

### Phase 3 – Tests and verification

1. Extend `src/__tests__/editor.test.tsx` to render Editor inside a memory Router seeded with `/editor/docs/agile/tasks/`, assert `fetchFileContent` is called with `docs/agile/tasks/`, and ensure textarea reflects the returned content without requiring node selection.
2. Keep the existing selection test but wrap it in the same Router harness to satisfy `useLocation`.
3. Run `pnpm --filter @promethean-os/knowledge-graph-ui test` (or relevant subset) to verify the suite passes after each phase.
