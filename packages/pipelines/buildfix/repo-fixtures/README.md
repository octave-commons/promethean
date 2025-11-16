# Repo Fixture Cache

Previously this folder contained a checked-in copy of the real-repo fixtures used
by `src/benchmark/run-repo-fixtures.ts`. The fixtures can be reproduced at any
moment, so the stored copies were deleted to keep the repository lean.

Generate a fresh set whenever you need to exercise the repo benchmark:

```bash
cd orgs/riatzukiza/promethean/packages/pipelines/buildfix
pnpm tsx src/benchmark/repo-fixture-generator.ts --repo-url git@github.com:riatzukiza/promethean.git --output-dir ./repo-fixtures
```

Then run the benchmark:

```bash
pnpm tsx src/benchmark/run-repo-fixtures.ts
```

The generator recreates `repo-file-*` directories with `package.json`,
`tsconfig.json`, and `src.ts` snapshots. This placeholder file simply keeps the
folder in version control so tooling knows where to write.
