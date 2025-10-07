---
project: Promethean
status: accepted
$$
date: 2025-08-26
$$
tags:
  - adr
  - architecture
  - file-structure
  - packages
---

# ADR-0001: Introduce `packages/` Directory

## Context
Historically, `services/` contained both configuration and logic.  
This caused coupling between orchestration and business logic, making it harder to reuse and migrate code.

## Decision
We introduce a new `packages/` directory:
- `packages/` holds reusable, executable programs (logic).
- `services/` hold only configuration to run `packages/` as long-running daemons.
- `agents/` hold s-expression configs declaring which `packages/` and `services/` they require.

## Consequences
- Cleaner separation of concerns.
- Easier reuse of logic across services and agents.
- Services become lighter and easier to compose.
- Slight migration cost to move existing service logic into packages.

## Alternatives Considered
- **Keep logic in `services/`** (rejected: perpetuates coupling).
- **Merge `shared/` and `packages/`** (rejected: conflates libraries with executables).

## Status
- Proposed by: Pythagoras + user
- Reviewed by: core team