# Continuous Integration

GitHub Actions run tests and collect coverage on every pull request.
The workflow file `.github/workflows/tests.yml` installs dependencies and
executes `pytest` with the `pytest-cov` plugin. JavaScript tests are executed
through `c8` to gather coverage reports. Coverage artifacts are uploaded for
review after the job completes.

