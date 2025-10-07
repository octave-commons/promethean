<!-- SYMPKG:PKG:BEGIN -->
# @promethean/mcp
**Folder:** `packages/mcp`  
**Version:** `0.1.0`  
**Domain:** `_root`
```mermaid
graph LR
  A["@promethean/mcp"]
  D1["@promethean/discord"]
  D2["@promethean/kanban"]
  A --> D1["@promethean/discord"]
  A --> D2["@promethean/kanban"]
  click D1 "../discord/README.md" "@promethean/discord"
  click D2 "../kanban/README.md" "@promethean/kanban"
```
## Dependencies
- [@promethean/discord](../discord/README.md)
- [@promethean/kanban](../kanban/README.md)
## Dependents
- _None_

## Included modules
- `@promethean/mcp/github/conflicts` — GitHub merge assistance helpers and MCP server factory.
- `@promethean/mcp/ollama` — Task parsing and streaming execution helpers for Ollama MCP integrations.
<!-- SYMPKG:PKG:END -->