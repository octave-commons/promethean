---
uuid: b2aab092-9a32-423b-a225-3f514a2cb69f
title: "Cephalon MCP Subcommands"
slug: 2026-01-29-cephalon-mcp-subcommands
status: incoming
priority: P2
tags: []
created_at: "2026-02-03T06:36:00.407448Z"
estimates:
  complexity: ''
  scale: ''
  time_to_completion: ''
storyPoints: null
---
# Cephalon MCP Subcommands

## Context
Add `cephalon mcp` subcommands to serve an MCP server and expose the same toolsets as Duck and OpenSkull, using `OPENHAX_DISCORD_TOKEN` as a fallback Discord token when serving.

## Requirements
- Add `cephalon mcp serve`, `cephalon mcp config`, and `cephalon mcp tools` subcommands.
- MCP toolset mirrors Duck + OpenSkull tool names.
- MCP config output lives under `cephalon-clj-brain` and is printable via `cephalon mcp config`.
- `OPENHAX_DISCORD_TOKEN` is recognized as a fallback for `DISCORD_TOKEN` in MCP serve.

## Planned Files
- `bin/cephalon` (command dispatch + usage + env wiring)
- `orgs/octave-commons/cephalon/recovered/cephalon-clj/cephalon-clj-brain/deps.edn` (add MCP dependency)
- `orgs/octave-commons/cephalon/recovered/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/toolset.clj` (shared tool lists)
- `orgs/octave-commons/cephalon/recovered/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/agent.clj` (use shared toolset)
- `orgs/octave-commons/cephalon/recovered/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/mcp.clj` (config/tools output)
- `orgs/octave-commons/cephalon/recovered/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/mcp_server.clj` (MCP server)
- `orgs/octave-commons/cephalon/recovered/cephalon-clj/cephalon-clj-brain/mcp/cephalon.mcp.json` (config file)

## Existing Issues / PRs
- None referenced.

## Definition of Done
- `cephalon mcp serve` starts the MCP server from `cephalon-clj-brain` and uses Duck/OpenSkull tools.
- `cephalon mcp config` prints a valid MCP JSON config containing Duck/OpenSkull tool lists.
- `cephalon mcp tools` lists tool names (supports agent filter).
- LSP diagnostics are clean for changed files (or recorded if unavailable).
