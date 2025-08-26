# Runbook: Rollback from Chroma to Mongo

## Preconditions
- Elevated error rate or search correctness issues after cutover.

## Steps
1. Announce rollback.
2. Freeze writers; stop CDC tailer.
3. Flip readers back to Mongo.
4. Optionally purge recent delta from Chroma using last checkpoint window.
5. Resume writers; monitor stability.

## Validation
- Metrics: error rate normalized.
- Queries match known-good responses.

