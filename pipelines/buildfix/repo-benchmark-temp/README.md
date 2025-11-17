# Repo Benchmark Temp Workspace

`src/benchmark/run-repo-fixtures.ts` copies freshly generated repo fixtures into
this folder before executing the benchmark:

```bash
cd orgs/riatzukiza/promethean/packages/pipelines/buildfix
pnpm tsx src/benchmark/repo-fixture-generator.ts --output-dir ./repo-fixtures
pnpm tsx src/benchmark/run-repo-fixtures.ts
```

The benchmark script automatically clears `repo-benchmark-temp/` and rewrites
`fixtures/` at runtime, so no data needs to live in git. This placeholder keeps
the directory discoverable and provides regeneration instructions.
