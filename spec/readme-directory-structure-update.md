# README directory structure update

## Context

- README.md lines 123-149 describe package ecosystem and submodule locations using `packages/<name>` paths that no longer match the repo layout (packages now live under cli/, services/, or experimental/).
- Submodule instructions at README.md:133 reference `git submodule update --init packages/<name>`, which is now inaccurate after relocation.
- PACKAGE-DOC-MATRIX (README.md:243+) is auto-generated; avoid manual edits.

## Requirements

- Replace outdated `packages/<name>` path references in manual prose with current cli/services/experimental locations.
- Update submodule guidance to the new directory names and initialization commands.
- Keep auto-generated sections untouched.

## Definition of Done

- README.md manual text reflects the new directory structure (cli/, services/, experimental/).
- Submodule instructions point to correct paths and commands for the moved repositories.
- No remaining manual references to deprecated `packages/` locations (excluding generated matrix).
- Spec recorded; no tests needed (documentation-only change).

## Existing issues / PRs

- Not checked; assume none relevant for this doc correction.
