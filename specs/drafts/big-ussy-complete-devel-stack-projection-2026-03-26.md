# Big Ussy Complete Devel Stack Projection

Date: 2026-03-26

## Goal
Create a deployment/projection script that mirrors the current local devel stack onto `error@big.ussy.promethean.rest` while preserving the wheel-and-spoke topology:
- local canonical proxx remains a canonical hub
- remote canonical big-ussy proxx becomes a second canonical hub
- remote cephalon-hive stays a spoke stack hanging off the remote canonical hub
- local canonical <-> remote canonical federation is maintained by a separate account-projection/copy service, not by Proxx core logic

## Required outcomes
- Sync relevant workspace sources/service homes to `/home/error/devel`
- Bring up remote canonical `services/proxx`
- Bring up remote `services/cephalon-hive` + dashboard + openplanner/chroma
- Keep remote cephalon-hive proxx federated to the remote canonical hub
- Register local canonical <-> remote canonical peers
- Establish reverse tunnel/relay so remote canonical can reach local canonical
- Start a separate sync daemon on both sides that performs federation pull + import-all

## Boundaries
- Proxx remains a protocol/framework/runtime, not the owner of deployment policy
- Sync/copy logic lives in sidecar/service scripts under `services/proxx/sync`
- The deployment script is the orchestration layer

## Relevant paths
- `services/proxx`
- `services/openplanner`
- `services/cephalon-hive`
- `orgs/open-hax/proxx`
- `orgs/octave-commons/cephalon/packages/cephalon-ts`
- `packages/event`
- `packages/openplanner-cljs-client`

## Validation
- script passes `bash -n`
- sync daemon passes `node --check`
- remote canonical health endpoint reachable after deploy
- remote cephalon-hive stack reachable after deploy
- local and remote canonical peer records exist
- local and remote canonical sync daemons start cleanly
