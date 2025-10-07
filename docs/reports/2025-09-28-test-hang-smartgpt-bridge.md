# SmartGPT Bridge Test Hang – 2025-09-28

## Test Commands
- `timeout 240 pnpm --filter "@promethean/voice-service" test`
- `timeout 240 pnpm --filter "@promethean/cephalon" test`
- `timeout 240 pnpm --filter "@promethean/agent" test`
- `timeout 240 pnpm --filter "@promethean/tests" test`
- `timeout 240 pnpm --filter "@promethean/embedding" test`
- `timeout 240 pnpm --filter "@promethean/smartgpt-bridge" test`

The first five suites completed in under two minutes. The SmartGPT Bridge suite consistently failed due to a hanging integration test.

## Failing Test
- File: `packages/smartgpt-bridge/src/tests/integration/indexer.incremental.test.ts`
- Case: `integration › indexer.incremental › bootstrap persists cursor and restart performs incremental diffs`
- Helper: `waitIdle` at the top of the file hard-codes a 5 s timeout before throwing `Error("waitIdle timeout")`.

## Observations
- Running the suite with a 240 s guard terminates with `Rejected promise returned by test`, followed by repeated `indexFile read failed` logs as the manager keeps draining even after AVA marks the test failed.
- Enabling JSON logging shows the bootstrap queue only contains `a.txt`, `b.txt`, and `c.md`, but the drain spends ~7 s per file when the package is executed from its workspace directory.
- Reproducing the test logic in isolation from the package directory yields:
  ```text
  first waitIdle timeout after 5004
  first waitIdle done { busy: true, queue: 2, active: true, draining: true }
  ```
  followed roughly 20 s later by `indexer drain complete`. This mirrors the AVA behaviour: the queue does eventually drain, but not within the 5 s budget enforced by `waitIdle`.

## Root Cause
`waitIdle` treats anything longer than 5 s as a failure, but `indexerManager.resetAndBootstrap` performs multiple synchronous LevelDB writes via `saveBootstrapState` `packages/smartgpt-bridge/src/indexerState.ts`. Those writes block long enough that each file takes several seconds to finish when the Level cache lives under `packages/smartgpt-bridge/.cache/smartgpt-bridge`. The async queue keeps running after the assertion fires, so AVA never reaches teardown and the process has to be killed by the external timeout.

## Mitigation Ideas
1. Increase the guard in `waitIdle` (e.g. 30 s) or poll `indexerManager.status()` until `processedFiles` reaches the expected count.
2. Stub `saveBootstrapState`/`loadBootstrapState` inside the test to use an in-memory map instead of LevelDB so the drain completes within milliseconds.
3. Temporarily mark the test `test.skip` until a less brittle bootstrap check is in place; the rest of the SmartGPT Bridge suite runs cleanly when this case is excluded.

## Next Steps
- Decide whether to refactor the fixture to avoid real disk-backed cache access or to relax the timeout.
- Once adjusted, re-run `pnpm --filter "@promethean/smartgpt-bridge" test` without the external guard to confirm the suite finishes under a few minutes.
