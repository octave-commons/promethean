# Large Benchmark Temp Workspace

This directory is intentionally empty. `src/benchmark/run-large.ts` clears and
rebuilds `large-benchmark-temp/fixtures` every time the large-scale benchmark
runs:

```bash
cd orgs/riatzukiza/promethean/packages/pipelines/buildfix
pnpm tsx src/benchmark/run-large.ts
```

The script synthesizes fixtures into this folder on demand, so committed
artefacts are unnecessary. Keeping only this placeholder ensures the path exists
for tooling that expects it without bloating the repository.
