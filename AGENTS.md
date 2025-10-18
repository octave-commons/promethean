# AGENTS.md

## 🧱 Overview

This repo defines the **Promethean Framework**, a modular cognitive architecture
for running AI agents with embodied reasoning, perception-action loops, and
emotionally mediated decision structures.

---

## 📂 Repository Structure

```
scripts/ # Build, test, deploy automation (depreciated)
packages/ # JS/TS modules
tests/ # Unit and integration test suites
docs/ # System-level documentation and markdown exports
sites/ # Frontend code for dashboards and chat UIs (depreciated)
configs/ # All base config files live here
pseudo/ # one off scripts, retained for transparency

```

---

## Anatomy of a Package

```
./src # All source code goes here
./src/tests # Tests go here
./tsconfig.json # Extends "../../config/tsconfig.base.json"
./ava.config.mjs # Extends "../../config/ava.config.mjs"
./package.json # Has, or should have 'build', 'test', 'clean', 'coverage',
'typecheck' etc. scripts
./static # Any files that might be served from a webserver go here.
pseudo/ # one off scripts, retained for transparency
```

Webservers should mount both `dist/frontend` and `static`.
When working on a package, the best way to execute commands is with
`pnpm --filter @promethean/<package-name> <command>`

### Example package local commands

`pnpm --filter @promethean/hacks test`
`pnpm --filter @promethean/hacks test:unit`
`pnpm --filter @promethean/hacks test:integration`
`pnpm --filter @promethean/hacks test:e2e`
`pnpm --filter @promethean/hacks clean`
`pnpm --filter @promethean/hacks build`
`pnpm --filter @promethean/hacks typecheck`
`pnpm --filter @promethean/hacks start`
`pnpm --filter @promethean/hacks exec node ./psudo/temp-script.js`


---

# Stack

- TypeScript for backend
- shadow-cljs for frontend
- nbb/bb scripting, and DSLs
- Clojure for heavy work
- MongoDB for main document store
- LevelDB for caching
- chroma for embedding based search
- ESMODULEs
- Prefer key-value caches via `@promethean/*-cache`; avoid JSON files for transient data

# Programming Style

- Functional preferred
- TDD non-negotiable
- Document-driven development
- No relative module resolution outside of the package root.
  - Depend on `@promethean/<package>*` via "workspace:\*".
- Always use the eslint tool on each file you edit.

# Working Style

- Prefer small, auditable changes over grand rewrites.
- If there aren't tests, write them.
- Do not edit config files when fixing problems unless explicitly asked.
  Prefer code changes in the affected modules.
- Add a summary of what you changed to a date string named file in `changelog.d` eg `changelog.d/<YYYY.MM.DD.hh.mm.ss>.md`
  that documents the current state so the next agent has traction—never leave with only "couldn't finish".

---

## 📋 Kanban Task Management

All agents must use the kanban system for task tracking and work management. The kanban board lives at `docs/agile/boards/generated.md` and is managed via the `@promethean/kanban` package.


### 📍 Working with Kanban

**✅ DO:**

- Use kanban commands from **any directory** in the repository
- Update task status via `pnpm kanban update-status <uuid> <column>`
- Regenerate board after making task changes: `pnpm kanban regenerate`
- Search tasks before creating new ones: `pnpm kanban search <query>`
- Check task counts to understand workflow: `pnpm kanban count`

**❌ DON'T:**

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
- CLI reference: `docs/agile/kanban-cli-reference.md`

### 📚 Further Documentation

- **Complete Kanban CLI Reference**: `docs/agile/kanban-cli-reference.md`
- **Process Documentation**: `docs/agile/process.md`
- **FSM Rules**: `docs/agile/rules/kanban-transitions.clj`

---

### Notes
- It is a large repo, remember to navigate to the right directory when running commands
- put temporary scripts in a `pseudo/` folder, retain them so the steps you take can be validated
- put markdown files in `docs/`
- documentation should be obsidian friendly markdown
  - use [[wikilinks]]
  - make use of dataviews https://blacksmithgu.github.io/obsidian-dataview/
  - Update the [[HOME]] file with important information, treat it as a living document

