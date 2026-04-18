# Cephalon Unified Dashboard + Memory Recovery + OpenPlanner Stack

Date: 2026-03-26

## Goal
Provide a single local interface for inspecting all running cephalons with separate activity streams, restore memory visibility/search through OpenPlanner, and wire OpenPlanner into the cephalon hive stack.

## User-visible outcomes
- One dashboard for Duck / OpenHax / OpenSkull / Error-status.
- Separate streams for:
  - tool calls
  - browsing/web activity
  - runtime errors
  - recent memory/messages
- OpenPlanner running in the cephalon hive stack.
- Cephalons configured to emit new memories into OpenPlanner.
- Existing memories backfilled into OpenPlanner.

## Constraints
- Do not destabilize the local proxx hub on 8789/5174.
- Avoid hardcoding secrets into tracked files.
- Gracefully handle missing/down cephalons.
- Keep the dashboard useful even if OpenPlanner vector indexing degrades; FTS is enough for first recovery.

## Implementation shape
1. Add `openplanner` + `chroma` to `services/cephalon-hive/docker-compose.yml`.
2. Set `OPENPLANNER_API_BASE_URL` / `OPENPLANNER_API_KEY` on cephalon base services.
3. Add a `dashboard` service in `services/cephalon-hive`.
4. Dashboard service aggregates per-cephalon Memory UI APIs and log tails.
5. Add a backfill endpoint to ingest existing memories into OpenPlanner.
6. Start/recreate services and verify health + search.

## Verification
- `openplanner` responds on `/v1/health`.
- Dashboard loads and shows target cards + separated streams.
- Backfill ingests existing memories.
- OpenPlanner search returns cephalon memories.
- Existing working cephalons stay running.
