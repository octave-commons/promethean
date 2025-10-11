---
uuid: "212b7db4-e33f-4d95-bc3e-ac58af6d0159"
title: "scripts audit and standardize cli flags"
slug: "scripts_audit_and_standardize_cli_flags"
status: "incoming"
priority: "P3"
labels: ["scripts", "cli", "flags", "audit"]
created_at: "2025-10-11T01:03:32.221Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


























Scripts: Audit and standardize CLI flags

Goal: Ensure all scripts support `--help`, dry-run by default where applicable, and consistent flags `--write`, `--check`.

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

























