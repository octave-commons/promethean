# Folder Guide: cli/

Purpose: Command-line applications and developer-facing entrypoints.

What belongs

- Published or internal CLIs that wrap library code into user workflows.
- CLI-specific configs (help text, command wiring), snapshots, and fixtures.
- Small adapters that convert CLI args to package calls.

Keep out

- Long-running daemons (see services/).
- General-purpose libraries without a CLI surface (see packages/).
- One-off automation scripts (see tools/ or scripts/).

Notes

- Prefer @promethean-os package dependencies; avoid duplicating logic from packages/.
- Keep UX docs in each CLI’s README; link to package docs where logic lives.
- Many CLIs here are git submodules (e.g., `compiler/`, `obsidian-export/`); push changes to upstream repos when present.
- Current in-repo CLIs include `compiler/`, `docs/`, `ecosystem-dsl/`, and `obsidian-export/`; keep each README aligned with its entrypoint.
