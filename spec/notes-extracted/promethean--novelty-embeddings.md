---
title: "`def-mcp-workspace` DSL"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/novelty-embeddings.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# `def-mcp-workspace` DSL

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/novelty-embeddings.md`
- Category: `promethean`

## Draft Requirements
- ✅ **OpenCode** `opencode.jsonc` MCP blocks (`type: local|remote`) ([OpenCode][1])
- ✅ **Codex** `config.toml` MCP blocks (`[mcp_servers.<name>]`) + allow/deny tools ([OpenAI Developers][2])
- ✅ aware of MCP transports (**stdio** + **streamable HTTP**) ([Model Context Protocol][3])
- a def-mcp-server map (with :mcp/launch)
- a def-mcp-client map (with :transport + command/url)
- a raw endpoint map
- def-mcp-server map (with :mcp/launch)
- def-mcp-client map
- endpoint map"
- local servers: `{ "type": "local", "command": ["npx","-y",...], "environment": {...}, "timeout": 5000 }`
- remote servers: `{ "type": "remote", "url": "...", "headers": {...}, "oauth": {...}, "timeout": 5000 }` ([OpenCode][1])
- `[mcp_servers.<name>]`

## Summary Snippets
- Alright—let’s make the **“workspace file”** that becomes the single source of truth for:
- * ✅ **OpenCode** `opencode.jsonc` MCP blocks (`type: local|remote`) ([OpenCode][1]) * ✅ **Codex** `config.toml` MCP blocks (`[mcp_servers.<name>]`) + allow/deny tools ([OpenAI Developers][2]) * ✅ aware of MCP transports (**stdio** + **streamable HTTP**) ([Model Context Protocol][3])

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
