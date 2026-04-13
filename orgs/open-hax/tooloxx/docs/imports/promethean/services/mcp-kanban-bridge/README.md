<!-- READMEFLOW:BEGIN -->
# @promethean-os/mcp-kanban-bridge

MCP server bridge for kanban operations - enables AI assistants to manipulate kanban boards through Model Context Protocol

[TOC]


## Install

```bash
pnpm -w add -D @promethean-os/mcp-kanban-bridge
```

## Quickstart

```ts
// usage example
```

## Commands

- `build`
- `test`
- `clean`
- `dev`
- `typecheck`
- `start`

## License

GPL-3.0-only


### Package graph

```mermaid
flowchart LR
  _promethean_os_mcp_kanban_bridge["@promethean-os/mcp-kanban-bridge\n0.1.0"]
  _promethean_os_kanban["@promethean-os/kanban\n0.2.0"]
  _promethean_os_utils["@promethean-os/utils\n0.0.1"]
  _promethean_os_mcp_kanban_bridge --> _promethean_os_kanban
  _promethean_os_mcp_kanban_bridge --> _promethean_os_utils
  classDef focal fill:#fdf6b2,stroke:#222,stroke-width:2px;
  class _promethean_os_mcp_kanban_bridge focal;
```


<!-- READMEFLOW:END -->
