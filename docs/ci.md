# Continuous Integration

GitHub Actions run tests and collect coverage on every pull request.
Workflows delegate to the pnpm/Nx toolchain so local runs and CI stay in sync:

- `pnpm install --frozen-lockfile` sets up dependencies (or run `bb setup` for
  the Babashka wrapper).
- `pnpm exec nx affected -t build` compiles the impacted projects.
- `pnpm exec nx affected -t test --parallel --base="$NX_BASE" --head="$NX_HEAD"`
  executes the test suites with the same diff-awareness used in CI. Running
  `bb test` will execute the full test matrix when a diff isn’t required.
- `pnpm run coverage` (also exposed as `bb coverage`) produces the aggregated
  coverage reports that CI publishes as artifacts.

You can emulate this workflow locally using the `bb simulate-ci` task. The
Babashka entry point shells out to `scripts/simulate_ci.py`, which needs to be
finished to replay the pull-request workflow end to end. Until that script is
completed, `bb simulate-ci` simply reports that the simulation is stubbed.
Track the implementation status in
$[simulate-github-actions-workflow|prompts/simulate-github-actions-workflow.md]$.

When the script lands it will parse the workflow files and execute the
$$
`pull_request` job steps directly:
$$
```bash
bb simulate-ci
```

The simulation will run each `run:` command from the workflows in order,
honoring environment variables and working directories defined for the step.
Until then, rely on the Nx commands above and the workflow definitions for
ground truth.

Before sending a pull request, confirm the relevant Nx targets pass locally and
record the results in your task notes per $[process|agile/process.md]$.

## Lockfile healer

The `lockfile-heal` workflow runs on every push to `main` and once per day via
cron. It executes `scripts/ensure-lockfile.mjs`, which regenerates
`pnpm-lock.yaml` and checks the repository status. If a fresh generation changes
the lockfile, the workflow opens a pull request that commits the updated lock so
`main` stays authoritative.

Contributors should still run `pnpm install` locally whenever they add, remove,
or upgrade dependencies. Local installs ensure the working tree is consistent
before opening a pull request, while the healer workflow acts as a safety net in
case drift slips through.

Additional automation references live in
$[Babashka + Nx Automation Reference|notes/automation/bb-nx-cli.md]$. Align any
future CI documentation updates with that note and request a review from the CI
owners when changes land.

## Dependency caching

The CI workflows cache package downloads to speed up installs:

- `~/.cache/pip` for Python packages, keyed by the hash of `Pipfile.lock`
- `~/.npm` for npm packages, keyed by the hash of `package-lock.json`

If a job reports a cache miss:

1. Ensure the lockfiles are checked into the repository and match the
   environment you expect.
2. Modifying either lockfile invalidates the cache. Rerun the job to populate a
   new cache with the updated dependencies.
3. Delete the cache manually from the GitHub Actions interface if a cache
   becomes corrupt.

These caches are scoped by operating system so they won't cross-contaminate
between Windows, macOS, and Linux runners.

