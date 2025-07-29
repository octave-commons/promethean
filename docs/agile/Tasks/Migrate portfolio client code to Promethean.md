## 🛠️ Task: Migrate portfolio client code to Promethean

Move the legacy portfolio web client from `riatzukiza.github.io` into
the Promethean monorepo under `site/`.  This keeps the project’s demo
pages available and ensures the build pipeline works from inside the
new repository.

---

## 🎯 Goals

- Preserve the existing portfolio site as part of Promethean
- Ensure the client code builds and serves from `/site/`
- Reference the old repo history for attribution

---

## 📦 Requirements

- [ ] Access the `riatzukiza.github.io` repository
- [ ] Link original repo for reference: <https://github.com/riatzukiza/riatzukiza.github.io>
- [ ] Copy HTML/CSS/JS assets into `site/portfolio/`
- [ ] Update asset paths and links for the new layout
- [ ] Document build steps in `site/README.md`

---

## 📋 Subtasks

- [ ] Clone or download the old repository
- [ ] Identify which pages and assets to keep
- [ ] Move selected files under `site/portfolio/`
- [ ] Add build or serve command to `package.json` or `Makefile`
- [ ] Reference [[../MIGRATION_PLAN.md]] for context
- [ ] Decide whether to import history via submodule or direct copy

---

## 🔗 Related Epics

#framework-core

---

## ⛓️ Blocked By

- [Migrating relevant modules from riatzukiza.github.io to -site- and -docs-](Migrating%20relevant%20modules%20from%20riatzukiza.github.io%20to%20-site-%20and%20-docs-.md)

## ⛓️ Blocks

- Future site styling or CI tasks

---

## 🔍 Relevant Links

- [kanban](../boards/kanban.md)

## ❓ Questions

- Should the portfolio be maintained as a submodule or migrated directly?
- Do we need a static build step or can GitHub Pages handle raw files?

#tags: #agile #task
