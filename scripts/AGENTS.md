# Folder Guide: scripts/

Purpose: Task-specific or ad-hoc automation used by maintainers and agents for builds, linting, migrations, and diagnostics.

What belongs

- One-off or narrowly scoped scripts (lint guards, doc generators, migrations, validation helpers).
- Development utilities that don’t warrant a packaged tool.

Keep out

- Reusable libraries (see packages/).
- Deployable services (see services/).
- Long-lived repo tools or generators (see tools/).

Notes

- Keep scripts small and single-purpose; document usage in comments or README.md.
- If a script becomes broadly reused, promote it to tools/ or a CLI package.
