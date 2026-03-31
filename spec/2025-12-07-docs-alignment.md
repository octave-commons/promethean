# Documentation Alignment Review

## Context

- Task: Ensure root README and folder AGENTS guides (root, cli, services, packages, experimental) match current repo layout under `cli/`, `services/`, `packages/`, `experimental/`.

## Relevant Files

- README.md (structure + package ecosystem) — lines ~1-263
- AGENTS.md (root instructions + directory map) — lines ~1-127
- cli/AGENTS.md — lines ~1-21
- services/AGENTS.md — lines ~1-21
- packages/AGENTS.md — lines ~1-126
- experimental/AGENTS.md — lines ~1-20

## Existing Issues / PRs

- None referenced; no linked tasks in repo.

## Definition of Done

- Docs describe actual folder layout and current home for active packages (submodules and in-repo code) without contradicting statements.
- Folder guides clarify what belongs/keep out in context of current contents.
- Root README and AGENTS consistently reference cli/services/packages/experimental locations and legacy package status.
- Cross-links remain intact; no broken instructions introduced.

## Requirements / Notes

- Keep GPL notice untouched.
- Avoid altering auto-generated sections (PACKAGE-DOC-MATRIX, remote README list).
- Maintain ASCII; concise wording.
- Highlight legacy vs active package locations and submodule presence where relevant.

## Session Notes

- Renamed kanban transitions DSL to `docs.agile.rules.kanban-transitions` and aligned filename to `kanban_transitions.clj` with namespace fixes.
- Fixed erroneous `str/lower-case` calls with default strings and cleaned unused bindings across transition predicates and WIP checks.
- Silenced unused bindings in sentinel tests by using arity-agnostic log stub and preserved publish assertions.
