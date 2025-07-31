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

