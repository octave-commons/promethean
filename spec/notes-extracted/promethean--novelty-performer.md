---
title: "✅ Step 1: Make `def-mcp-server` carry its own launch info"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/novelty-performer.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# ✅ Step 1: Make `def-mcp-server` carry its own launch info

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/novelty-performer.md`
- Category: `promethean`

## Draft Requirements
- ✅ **OpenCode** `opencode.jsonc` `"mcp": { ... }` blocks ([OpenCode][1])
- ✅ **Codex** `~/.codex/config.toml` `[mcp_servers.*]` blocks ([OpenAI Developers][2])
- ✅ from the *same* definitions you already have (`def-mcp-server`, `def-mcp-client`, imports, etc.)
- server vars (with `:mcp/launch`)
- client vars (`def-mcp-client`)
- explicit endpoints (`def-endpoint`)

## Summary Snippets
- Perfect — now we make your MCP layer *actually shippable* by having **one source of truth** generate:
- * ✅ **OpenCode** `opencode.jsonc` `"mcp": { ... }` blocks ([OpenCode][1]) * ✅ **Codex** `~/.codex/config.toml` `[mcp_servers.*]` blocks ([OpenAI Developers][2]) * ✅ from the *same* definitions you already have (`def-mcp-server`, `def-mcp-client`, imports, etc.)

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
