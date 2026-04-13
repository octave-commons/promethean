---
name: opencode-reconstituter
description: "Run the reconstitute CLI to index, search, and reconstruct project context from OpenCode sessions"
---

# Skill: OpenCode Reconstituter

## Goal
Use the `reconstitute` CLI to index OpenCode sessions into Chroma, search for relevant context, and generate reconstruction notes for a target path.

## Use This Skill When
- You need to rebuild context for a project from OpenCode sessions.
- You want to generate `.reconstitute/output` artifacts for a target repo.
- You need to run the `reconstitute` loop with search and tool-assisted notes.

## Do Not Use This Skill When
- You only need to search sessions without the reconstruction loop (use `opencode-session-search`).
- You only need raw snapshot diffs (use `opencode-extract-diffs`).
- The OpenCode session index is missing and you cannot run the index step.

## Inputs
- Target path (for `run` command)
- Search query (for `search` command)
- Environment configuration for OpenCode, Chroma, and Ollama

## Steps

### Index Sessions
1. Ensure OpenCode, Chroma, and Ollama are available.
2. Run the index command.
3. Verify new records were upserted into the sessions collection.

### Search Sessions
1. Run a search query against the sessions collection.
2. Review the `context_messages` payload.

### Run Reconstitution
1. Provide a target path under the workspace.
2. Run the `reconstitute run <path>` command.
3. Inspect the markdown output under `.reconstitute/output`.

## Output
- Indexed session embeddings in Chroma.
- Search results with `context_messages` for Ollama.
- Markdown descriptions and notes under `.reconstitute/output`.

## Common Commands
```bash
pnpm -C packages/reconstituter reconstitute index
pnpm -C packages/reconstituter reconstitute search "orgs/octave-commons/cephalon-clj websocket rpc"
pnpm -C packages/reconstituter reconstitute run orgs/octave-commons/cephalon-clj
```

## Strong Hints
- `LEVEL_DIR` defaults to `.reconstitute/level`.
- `OUTPUT_DIR` defaults to `.reconstitute/output`.
- `CHROMA_COLLECTION_SESSIONS` defaults to `opencode_messages_v1` (model suffix appended).
- Use `MAX_PATHS` and `MAX_PATH_EXTRACTION_PASSES` to limit traversal.

## References
- CLI implementation: `packages/reconstituter/src/reconstitute.ts`
- Session index/search: `packages/reconstituter/src/opencode-sessions.ts`

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[opencode-extract-diffs](../opencode-extract-diffs/SKILL.md)**
- **[opencode-session-search](../opencode-session-search/SKILL.md)**
