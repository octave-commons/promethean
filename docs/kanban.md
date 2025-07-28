---

kanban-plugin: board

---

## 🟢 To Do

- [ ] Initialize Obsidian vault at repo root
- [ ] Add `.obsidian/` to `.gitignore`
- [ ] Structure vault to mirror `/services/`, `/agents/`, `/docs/`
- [ ] Add starter notes: `[[eidolon_fields]]`, `[[cephalon_inner_monologue]]`
- [ ] Migrate duck services to  promethean
- [ ] Migrate portfolio client code to promethean
- [ ] Create `vault-config/.obsidian/` with Kanban and minimal vault setup
- [ ] Write `vault-config/README.md` for Obsidian vault onboarding
- [ ] Ensure GitHub-compatible markdown settings are documented
- [ ] Add vault instructions to main `README.md`
- [ ] Migrate server side sibilant libs to promethean architecture.
- [ ] write simple ecosystem declaration library for new agents
- [ ] Write `vault-config/README.md` for Obsidian vault onboarding
- [ ] Ensure GitHub-compatible markdown settings are documented
- [ ] Add vault instructions to main `README.md`
- [ ] Migrate server side sibilant libs to promethean architecture.
- [ ] write simple ecosystem declaration library for new agents
- [ ] Finalize `MIGRATION_PLAN.md`
- [ ] Set up `Makefile` for Python + JS build/test/dev
- [ ] Annotate legacy code with migration tags
- [ ] Create base `README.md` templates for each service

## 🟡 In Progress (4)

	- [ ] Transferring `agents/duck/` and restructuring legacy code into `/agents/` and `/services/`
- [ ] Migrating relevant modules from `riatzukiza.github.io` to `/site/` and `/docs/`
- [ ] Obsidian vault is initialized at the root and actively being configured

## 🔵 Done

- [ ] Decided on monorepo architecture
- [ ] Moved initial Duck 2.0 content into `/Promethean/`
- [ ] Created canvas and populated `AGENTS.md`
- [ ] Defined language strategy: Hy/Python + Sibilant/TS/JS hybrid
- [ ] Vault root confirmed at repo root
- [ ] Obsidian config strategy established: untracked `.obsidian/`, with example in `vault-config/`


## 🧠 Notes

- [ ] JS and Python will maintain separate `core/` implementations for now
- [ ] Sibilant may compile to TS in future; raw JS is acceptable if quality is high
- [ ] Hy encouraged but optional — fallback to `.py` expected for broader contributors
- [ ] Use `#codex-task`, `#agent-specific`, `#framework-core`, `#doc-this`, `#rewrite-later` as task tags



* Resolve `allowImportingTsExtensions` errors in TypeScript configs under `services/cephalon` and `services/discord-embedder` #todo #typescript

* Add Node test scripts and ensure TypeScript compilation succeeds #todo #typescript #tests

* Fix flake8 issues across Python scripts, particularly in `services/discord-indexer` and `shared/py/speech` #todo #python

* Rename `split_sentances.py` to `split_sentences.py` and update imports #todo #python

* Review empty module `shared/py/speech/llm.py` and implement or remove #todo #python

# 🟡 In Progress (limit: 4)

%% kanban:settings
```
{"kanban-plugin":"board","list-collapse":[false]}
```
%%