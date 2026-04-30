# Threat Radar MCP

General-purpose MCP control plane for agent-created threat radars.

## What it does

- creates radars from templates
- attaches typed sources to radars
- accepts structured assessment packets
- reduces packets into deterministic live snapshots
- seals daily snapshots
- records audit events for replay and explanation

## Core tools

- `radar_create`
- `radar_list`
- `radar_add_source`
- `radar_submit_packet`
- `radar_reduce_live`
- `radar_seal_daily_snapshot`
- `radar_get_audit_log`

## Local

```bash
pnpm --filter @workspace/radar-core build
pnpm --filter @workspace/mcp-foundation build
pnpm --filter @riatzukiza/threat-radar-mcp dev
```

## Notes

Current storage is in-memory for scaffolding speed. The next step is replacing in-memory radar state with Postgres-backed repositories and exposing module evolution APIs.
