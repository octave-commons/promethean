# Pre-commit Workflow

This repository uses [pre-commit](https://pre-commit.com/) to enforce
formatting and lint rules for multiple languages.

## Installation

Install the tool inside your development environment and register the
Git hook:

```bash
pip install pre-commit
pre-commit install
```

## Running hooks

Run the hooks against modified files before committing:

```bash
pre-commit run --files <file1> <file2>
```

To check the entire repository, use `--all-files` instead of listing
specific paths.

If some tracked files contain spaces, you can run hooks on every file safely with:

```bash
git ls-files -z | xargs -0 pre-commit run --files
```

The CI workflow runs the same command to verify that committed files pass
the configured hooks.

## Changelog fragments

A custom hook blocks commits that modify `CHANGELOG.md` directly or add
multiple fragments for the same pull request in `changelog.d/`. Run
`pre-commit run --files changelog.d/<fragment>.md` after creating a
changelog entry to ensure the check passes.
