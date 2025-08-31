Scripts: Audit and standardize CLI flags

Goal: Ensure all scripts support `--help`, dry-run by default where applicable, and consistent flags (`--write`, `--check`).

Scope:
- Sweep `scripts/**` and align:
  - `--write` to apply changes
  - `--check` to exit nonzero if changes would be made
  - `--dir`, `--board`, etc., with sensible defaults
  - Print clear output on dry-run vs applied
- Add `--verbose` where useful.

Exit Criteria:
- Consistent CLI ergonomics across scripts, with help messages.

#incoming #scripts #cli #dx

