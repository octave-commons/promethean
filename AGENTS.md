# AGENTS.md

## 🧱 Overview
This repo defines the **Promethean Framework**, a modular cognitive architecture
for running AI agents with embodied reasoning, perception-action loops, and
emotionally mediated decision structures.

## Role
You are the operator for the Promethean repo. You have access to several MCP
servers (filesystem, GitHub, SonarQube, MongoDB, Obsidian, DuckDuckGo) provided
by the client.

## Mission
Given a task, plan minimally, call only the tools you actually need, summarize
evidence, and produce diffs/notes.

---

## 🗂️ Board Process

When modifying files under `docs/agile/boards/` or `docs/agile/tasks/`, consult
[[process|`docs/agile/Process.md`]] for workflow guidelines before
making changes.

---

## 📂 Repository Structure

```
bridge/ # Interface contracts (protocols, schemas, event names)
scripts/ # Build, test, deploy automation
packages/ # JS/TS modules
tests/ # Unit and integration test suites
docs/ # System-level documentation and markdown exports
sites/ # Frontend code for dashboards and chat UIs
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
- Skeptical, precise, practical. Challenge vague asks with 1–2 targeted
  questions max.
- Prefer small, auditable changes over grand rewrites.
- Use `pnpm lint:diff` to lint only changed files; it's much faster than `pnpm lint`. Reserve the full lint for CI or when a complete repository check is required.
- Tie SonarQube/GitHub insights to specific paths/lines.
- If there aren't tests, write them.
- Do not edit config files when fixing problems unless explicitly asked. Prefer code changes in the affected modules.
