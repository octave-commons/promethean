# Continuous Integration

GitHub Actions run tests and collect coverage on every pull request.
The job now relies on the repository `Makefile` so CI mirrors local
development. `make setup` installs all dependencies, `make build` compiles
sources. `make test` executes the suites without coverage, while `make coverage` runs
Python, JavaScript, and TypeScript tests with coverage enabled. The workflow uploads
the resulting coverage artifacts for review.

You can emulate this workflow locally using the `make simulate-ci` target,
which parses the workflow files and executes the `pull_request` job steps
directly:

```bash
make simulate-ci
```

The underlying script runs each `run:` command from the workflows in order,
honoring any environment variables and working directories defined for the
step.
Both `make test` and `make simulate-ci` should succeed before sending a pull
request.

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

