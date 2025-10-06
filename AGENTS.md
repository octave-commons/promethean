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

---

## 📋 Kanban Task Management

All agents must use the kanban system for task tracking and work management. The kanban board lives at `docs/agile/boards/generated.md` and is managed via the `@promethean/kanban` package.

### 🎯 Core Kanban Commands

```bash
# Basic kanban operations (work from any directory in the repo)
pnpm kanban regenerate     # Generate board from task files
pnpm kanban sync          # Bidirectional sync with conflict reporting
pnpm kanban pull          # Sync board from task frontmatter
pnpm kanban push          # Project board columns back to tasks

# Task management
pnpm kanban list          # List all tasks
pnpm kanban search <query> # Search tasks by title or content
pnpm kanban update-status <uuid> <column> # Move task to different column
pnpm kanban count         # Show task counts by column

# Board operations
pnpm kanban getColumn <column>     # Get tasks in specific column
pnpm kanban getByColumn <column>   # Get formatted tasks for column
```

### 📍 Working with Kanban

**✅ DO:**
- Use kanban commands from **any directory** in the repository
- Update task status via `pnpm kanban update-status <uuid> <column>`
- Regenerate board after making task changes: `pnpm kanban regenerate`
- Search tasks before creating new ones: `pnpm kanban search <query>`
- Check task counts to understand workflow: `pnpm kanban count`

**❌ DON'T:**
- Navigate to specific directories to use kanban commands
- Manually edit the generated board file
- Create tasks without checking for duplicates first
- Forget to sync board changes back to task files

### 🔄 Common Agent Workflows

1. **Start work**: `pnpm kanban search <work-type>` → find relevant tasks
2. **Update task**: `pnpm kanban update-status <uuid> in_progress`
3. **Complete work**: `pnpm kanban update-status <uuid> done`
4. **Generate board**: `pnpm kanban regenerate`

### 📁 Task File Locations
- Tasks live in: `docs/agile/tasks/*.md`
- Generated board: `docs/agile/boards/generated.md`
- Config file: `promethean.kanban.json`

### 🐛 Path Resolution Note
The kanban system automatically resolves paths correctly from any subdirectory. If you encounter path issues, ensure you're running commands from within the git repository.
