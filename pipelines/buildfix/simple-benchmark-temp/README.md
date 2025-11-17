# Simple Benchmark Temp Workspace

`src/benchmark/run-simple.ts` wipes and recreates this directory whenever the
simple BuildFix benchmark executes:

```bash
cd orgs/riatzukiza/promethean/packages/pipelines/buildfix
pnpm tsx src/benchmark/run-simple.ts --no-bail
```

The fixtures are generated dynamically via the template helpers, so the previous
checked-in copies were removed. This README simply reserves the directory so
scripts that resolve `./simple-benchmark-temp` will always find a location to
populate.
