---
title: "1) Unified “endpoint” shape"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/runtime-tick-system.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# 1) Unified “endpoint” shape

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/runtime-tick-system.md`
- Category: `promethean`

## Draft Requirements
- `def-tool` → local tool definition + impl
- `def-mcp-server` → expose local tools over MCP (stdio/http)
- `def-mcp-client` + `def-tool-from-mcp` → import remote MCP tools (Serena etc.)
- def-mcp-client map
- def-mcp-server map (ONLY if it includes command/url info)
- an already-normalized endpoint map
- `pack/base`
- `pack/streaming`
- `pack/project-X`
- `def-endpoint` macro (stdio/http, env, headers)
- `def-mcp-bundle` macro (endpoints + imports + exports)
- `write-opencode!` / `write-codex!` helpers

## Summary Snippets
- Nice — this is where it starts feeling *product-grade*.
- You already have:

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
