# Continuous Integration

GitHub Actions run tests and collect coverage on every pull request.
The job now relies on the repository `Makefile` so CI mirrors local
development. `make setup` installs all dependencies, `make build` compiles
sources, and `make coverage` runs Python and JavaScript tests with coverage
enabled. The workflow uploads the resulting coverage artifacts for review.

