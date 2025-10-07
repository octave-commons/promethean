---
project: Promethean
status: accepted
$$
date: 2025-09-06
$$
tags:
  - adr
  - architecture
  - decision
---

# ADR-2025-09-06: Introduce Nx Workspace

## Context
Build scripts across packages were growing in complexity and lacked a unified task runner. The repository contains many packages that require consistent build, lint, and test targets.

## Decision
Adopt Nx as the workspace orchestrator. Each package now includes a `project.json` with standardized targets (`build`, `typecheck`, `lint`, and `test`). A root `nx.json` defines caching and dependency behavior.

## Consequences
- Developers can run tasks for individual packages through a single Nx CLI.
- Build artefacts are cached, reducing redundant work.
- Requires maintaining Nx configuration files.

## Alternatives Considered
- Continue using ad-hoc pnpm scripts (rejected due to lack of orchestration).
- Custom scripting to wire packages $rejected in favor of a well-supported tool$.

## Status
- Proposed by: codex-agent
- Reviewed by: core team
- Supersedes: none
- Superseded by: none
