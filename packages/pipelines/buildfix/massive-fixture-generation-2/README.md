# Massive Fixture Dataset

This directory intentionally ships empty. The historical fixtures under
`massive-fixture-generation-2/fixture-*/` were removed because they can be
regenerated at any time via the BuildFix automation described in
`packages/pipelines/buildfix/README.md`.

To rebuild the dataset locally:

```bash
cd orgs/riatzukiza/promethean/packages/pipelines/buildfix
pnpm --filter @promethean-os/buildfix exec tsx src/benchmark/massive-fixture-generator.ts --target-errors 1000 --output-dir ./massive-fixture-generation-2
```

The generator will recreate the `fixture-*` subdirectories with fresh
TypeScript reproductions before benchmarks that enable `--use-massive-fixtures`
read them. Keeping the directory in git avoids runtime errors when the
fixtures have not been generated yet, while keeping the repo lightweight.
