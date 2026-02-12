---
title: "1) Tool shape assumption"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/modular-agent-system.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# 1) Tool shape assumption

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/modular-agent-system.md`
- Category: `promethean`

## Draft Requirements
- `def-mcp-server` → expose a set of `def-tool` tools as an MCP server (stdio OR http)
- `def-mcp-client` → define a connection to an external MCP server (stdio OR http)
- `def-tool-from-mcp` → create a local tool that *proxies* a remote MCP tool (Serena, etc.)
- `def-mcp-import` → bulk import several remote tools into a local namespace
- clj-kondo hooks so your macros are “real” to tooling
- defining MCP servers from local def-tool tools
- defining MCP clients (external servers)
- defining local tools that proxy remote MCP tools"
- client: def-mcp-client var
- remote-name: MCP tool name on the remote server
- name/title/description/inputSchema can be supplied,
- **server-side**

## Summary Snippets
- Hell yes. This is the missing ergonomic layer: **“tool defs are the source of truth” → “MCP servers are just a projection of those tool defs”** → “remote MCP servers can be imported back into the same tool format.”
- Below is a **macro DSL** that does exactly that:

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
