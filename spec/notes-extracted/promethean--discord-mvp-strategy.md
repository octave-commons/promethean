---
title: "1) New DSL: `def-mcp-workspace+` and extra `emit` targets"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/discord-mvp-strategy.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# 1) New DSL: `def-mcp-workspace+` and extra `emit` targets

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/discord-mvp-strategy.md`
- Category: `promethean`

## Draft Requirements
- ✅ `opencode.jsonc` (full file)
- ✅ `~/.codex/config.toml` (blocks)
- ✅ **Codex CLI** commands (`codex mcp add …`, `codex mcp list`, etc.)
- ✅ **OpenCode CLI** commands (`opencode mcp auth …`, `opencode mcp logs …`, etc.)
- ✅ plus “copy/paste blocks” for both
- `(endpoint …)`
- `(use …)`
- `(emit …)`
- `:opencode` → write `opencode.jsonc`
- `:codex` → write `config.toml` blocks
- `:codex-cli` → write CLI script file (or just print commands)
- `:opencode-cli` → write CLI script file

## Summary Snippets
- Cool — let’s push it into the “this feels illegal” tier:
- You’ll get a **single workspace DSL** that can emit:

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
