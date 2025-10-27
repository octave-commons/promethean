# Promethean

> *“Stealing fire from the gods to grant man the gift of knowledge and wisdom.”*
> Using **cloud LLMs** to make **local LLMs** smarter, specialized, and autonomous.

---


---

## 📂 Repository Structure

```
scripts/   # deprecated build/test/deploy
packages/  # JS/TS modules
tests/     # unit & integration tests
docs/      # system-level markdown docs
sites/     # deprecated UIs/dashboards
configs/   # base configuration
pseudo/    # throwaway scripts, pseudocode, retained for transparency
```

---

## ⚙️ Package Anatomy

```
src/               # source code
src/tests/         # test files
src/actions        # individual, short, functional, operations 
src/commands       # CLI interfaces
src/serializers    # take the output from actions and prepare them for dispatch to an external consumer
tsconfig.json      # extends ../../config/tsconfig.base.json
ava.config.mjs     # extends ../../config/ava.config.mjs
package.json       # scripts: build, test, clean, coverage, typecheck
pseudo/            # local pseudocode; never referenced internally
```

---

## 💻 Languages

* **Typescript**
* **Clojure(script)**

---

## 🧩 Programming Style

* Functional
* Data-oriented
* Test-driven
* Rapid prototyping
* Small, concise functions/files
* Clean code
* Factory pattern
* Dependency injection

---

## 🗂 Kanban Task Management

All agents must use the **Kanban system** (`@promethean-os/kanban`) for tracking and coordination.
The board lives at:
`docs/agile/boards/generated.md`

### Commands

```bash
pnpm kanban --help
pnpm kanban process
pnpm kanban audit
pnpm kanban update-status <uuid> <column>
pnpm kanban regenerate
pnpm kanban search <query>
pnpm kanban count
```

**Flow:**

1. `pnpm kanban search <work-type>`
2. `pnpm kanban update-status <uuid> in_progress`
3. `pnpm kanban update-status <uuid> done`
4. `pnpm kanban regenerate`

### File Locations

* Tasks → `docs/agile/tasks/*.md`
* Board → `docs/agile/boards/generated.md`
* Config → `promethean.kanban.json`
* CLI Reference → `docs/agile/kanban-cli-reference.md`

### Docs

* [[docs/agile/kanban-cli-reference.md]]
* [[docs/agile/process.md]]
* [[docs/agile/rules/kanban-transitions.clj]]

---

## 🧱 Local Package Commands

MUST ALWAYS USE **locally scoped commands**:

```bash
pnpm --filter @promethean-os/<pkg> test
pnpm --filter @promethean-os/<pkg> build
pnpm --filter @promethean-os/<pkg> clean
pnpm --filter @promethean-os/<pkg> typecheck
pnpm --filter @promethean-os/<pkg> start
pnpm --filter @promethean-os/<pkg> exec node ./dist/index.ts
```
---

## 🧭 Operational Notes

* Always run bash commands from **package root**
* Keep temporary scripts in `pseudo/` (never referenced by source)
* Store documentation in `docs/`
* File changes auto-commit with LLM-generated messages
* MUST ALWAYS use `pnpm --filter @promethean-os/<pkg> ...`
* MUST NEVER use `cd ... && anything...`
* MUST NEVER use dynamic imports.
* MUST NEVER use class statements or expressions

  * No manual commits or backups needed
* Documentation must be **Obsidian-friendly**

  * Use `[[wikilinks]]`
  * Use [Dataviews](https://blacksmithgu.github.io/obsidian-dataview/)
* Keep [[HOME]] updated — treat it as a **living document**
* Manage runtime processes via **PM2**

---

## ⚖️ License

All packages use:
```
"license": "GPL-3.0-only"
```
