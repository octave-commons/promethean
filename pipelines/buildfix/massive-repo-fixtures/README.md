# Massive Repo Fixtures Cache

The BuildFix massive benchmark generator writes its outputs here by default
(`src/benchmark/massive-fixture-generator.ts` sets `outputDir: './massive-repo-fixtures'`).
The repository no longer ships the generated fixtures because they can be
recreated on demand.

To regenerate fixtures into this directory:

```bash
cd orgs/riatzukiza/promethean/packages/pipelines/buildfix
pnpm --filter @promethean-os/buildfix exec tsx src/benchmark/massive-fixture-generator.ts --target-errors 1000
```

If you prefer to keep the dataset under `./massive-fixture-generation-2`
(used by `run-massive-benchmark.ts` defaults) pass `--output-dir` accordingly.
This README simply keeps the directory tracked without storing thousands of
fixture files.
