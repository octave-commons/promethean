# Continuous Integration

GitHub Actions run tests and collect coverage on every pull request.
The job now relies on the repository `Makefile` so CI mirrors local
development. `make setup` installs all dependencies, `make build` compiles
sources, and `make coverage` runs Python and JavaScript tests with coverage
enabled. The workflow uploads the resulting coverage artifacts for review.

You can emulate this workflow locally using the
[`act`](https://github.com/nektos/act) CLI. A Makefile target wraps the
command:

```bash
make simulate-ci
```

This runs `act pull_request` to replicate the GitHub Actions job definitions.
Both `make test` and `make simulate-ci` should succeed before sending a pull
request.

