# Continuous Integration

GitHub Actions run tests and collect coverage on every pull request.
The workflow file `.github/workflows/tests.yml` installs dependencies and
executes `pytest` with the `pytest-cov` plugin. JavaScript tests are executed
through `c8` to gather coverage reports. Coverage artifacts are uploaded for
review after the job completes.

You can emulate this workflow locally using the
[`act`](https://github.com/nektos/act) CLI. A Makefile target wraps the
command:

```bash
make simulate-ci
```

This runs `act pull_request` to replicate the GitHub Actions job definitions.
Both `make test` and `make simulate-ci` should succeed before sending a pull
request.

