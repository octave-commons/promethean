# AGENTS.md

## 🧱 Overview

This repo defines the **Promethean Framework**, a modular cognitive architecture
for running AI agents with embodied reasoning, perception-action loops, and
emotionally mediated decision structures.

## 🗂️ Board Process

All work must be follow the process
[[process|`docs/agile/process.md`]]

---

## 📂 Repository Structure

```
scripts/ # Build, test, deploy automation (depreciated)
packages/ # JS/TS modules
tests/ # Unit and integration test suites
docs/ # System-level documentation and markdown exports
sites/ # Frontend code for dashboards and chat UIs (depreciated)
configs/ # All base config files live here
```

---

## Anatomy of a Package

```
./src # All source code goes here
./src/tests # Tests go here
./src/frontend # Frontend code goes here
./tsconfig.json # Extends "../../config/tsconfig.base.json"
./ava.config.mjs # Extends "../../config/ava.config.mjs"
./package.json # Has, or should have 'build', 'test', 'clean', 'coverage',
'typecheck' etc. scripts
./static # Any files that might be served from a webserver go here.
```

Webservers should mount both `dist/frontend` and `static`.

---
# Stack
- TypeScript monorepo
- AVA for tests
- Webcomponents for frontends
- Fastify for REST
- MongoDB for main document store
- LevelDB for caching
- ESMODULEs
- Prefer key-value caches via `@promethean/level-cache`; avoid JSON files for transient data

# Programming Style
- Functional preferred
- Immutable data; no in-place object mutation
- TDD non-negotiable
- Document-driven development
- No relative module resolution outside of the package root. Depend on `@promethean/<package>*` via "workspace:*".
- Always use the ts-lsp server to diangose build errors. It is faster than running typechecks or building the project, and requires no permission
- Always use the eslint tool on each file you edit.

# Banned
Under no circumstances should you introduce the following to Promethean:
- React/redux
- require
- Jest
- Python
- removing contents from .gitignore
- committing *any* .env file

# Working Style
- Prefer small, auditable changes over grand rewrites.
- If there aren't tests, write them.
- Do not edit config files when fixing problems unless explicitly asked. Prefer code changes in the affected modules.
- Add a summary of what you changed to a date string named file in `changelog.d` eg `changelog.d/<YYYY.MM.DD.hh.mm.ss>.md`
- If a task cannot be fully completed within the session, ship a partial, reviewable artifact (code, notes, or an audit log)
  that documents the current state so the next agent has traction—never leave with only "couldn't finish".
