# Folder Guide: experimental/

Purpose: Prototypes, incubating concepts, and unstable workstreams. Use this space for exploration that may graduate into packages/, services/, or cli/ later.

What belongs

- Spikes, prototypes, and feature experiments with their own READMEs/tests.
- Draft protocols or integrations not yet production-ready.

Keep out

- Shipping libraries (see packages/).
- Production services (see services/).
- Repo automation (see tools/ or scripts/).

Notes

- Clearly mark stability and expected consumers in each experiment README.
- When an experiment stabilizes, plan migration into the appropriate folder.
- Current experiments: `cephalon/`, `enso/`, `enso-protocol/`, `llm/`, `scar/`; keep READMEs reflecting status and ownership.
- If a directory is a git submodule, make changes upstream rather than directly here.
