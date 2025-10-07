# Runbook: Mongo → Chroma Cutover

## Preconditions
- Backfill complete with 0 hard failures.
- CDC running; backlog within threshold for 30–60 minutes.
- Embedding model id and dimension verified against Chroma collections.

## Steps
1. Announce freeze window.
2. Stop writers briefly; ensure CDC catches up backlog = 0.
3. Final integrity report; verify counts/checksums.
4. Flip readers to Chroma (or hybrid adapter); enable metrics.
5. Resume writers; keep CDC for safety window.
6. Monitor error rate and search correctness; if stable, disable CDC.

## Validation
- Metrics: error rate < threshold, no backlog.
- Smoke test queries return expected results.

## Rollback
- Follow `rollback.md` if errors exceed threshold.

