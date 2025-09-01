# 📦 MIGRATION_PLAN.md

## 🧭 Purpose

This document outlines the migration steps from the legacy `duck/` folder and `riatzukiza.github.io` project into the Promethean monorepo, aligning everything under a unified architecture and consistent tooling. This includes the formal shift from "Duck as a bot" to "Duck as an agent instance of Promethean."

---

## 📋 Scope

### In Scope

- Migrating legacy `duck/` code and related GitHub Pages site into the monorepo
- Consolidating service logic under `services/` with shared modules in `shared/`
- Normalizing documentation and vault structure to match repository layout

### Out of Scope

- Major feature development unrelated to migration
- Production deployment or scaling concerns beyond verifying basic service parity

## 🏗 Phased Timeline

| Phase                            | Deliverables                                          | Target Date |
| -------------------------------- | ----------------------------------------------------- | ----------- |
| Phase 1: Repository Restructure  | Move `duck/` to `agents/duck/`; extract core services | Week 1–2    |
| Phase 2: Service Extraction      | Refactor shared code and reorganize GitHub Pages site | Week 3–4    |
| Phase 3: Documentation & Cleanup | Finalize vault setup and remove legacy stubs          | Week 5–6    |

## 📌 Requirements, Dependencies & Risks

| Milestone                       | Dependencies                             | Risks & Mitigation                                  |
| ------------------------------- | ---------------------------------------- | --------------------------------------------------- |
| Restructure Duck into `agents/` | Existing `duck/` repo                    | Broken references → run `make test` after each move |
| Split services by function      | Stable interfaces for STT/TTS/Cephalon   | Service drift → validate with integration tests     |
| Reorganize GitHub Pages site    | Access to `riatzukiza.github.io` content | Lost assets → back up site before import            |
| Normalize Obsidian vault        | Obsidian plugin compatibility            | Plugin mismatch → pin versions in `vault-config/`   |

## 🛠 Subtasks & Owners

| Subtask                                                       | Owner       |
| ------------------------------------------------------------- | ----------- |
| Draft detailed migration scopes and phased timeline           | @codex      |
| Validate service extraction plan and shared module boundaries | @riatzukiza |
| Review documentation updates and vault normalization          | @duck       |
| Coordinate final cleanup and legacy code removal              | @codex      |

## 🔗 Traceability

- Task file: [[finalize_migration_plan_md_md_md]]
- Epic: [[epics#🛠 Developer Tooling & Build Pipeline]]

## 👥 Stakeholder Review

- Reviewed by: @riatzukiza, @codex
- Status: Ready for execution ✅

---

## 🗺️ Migration Goals

- Flatten architecture and consolidate services under `services/`
- Promote modularity and multi-agent support
- Maintain support for language diversity (Hy, Python, Sibilant, JS, TS)
- Separate shared libraries from runtime microservices
- Establish project-wide consistency (naming, environment, entry points)
- Prepare for `agent-mode` and `codex` tooling

---

## ✅ Migration Checklist

### 1. 🔀 Restructure Duck

- [ ] Move `duck/` → `agents/duck/`
- [ ] Separate prompts, memory bindings, voice configs
- [ ] Strip out non-agent-specific logic (move to `services/`)

### 2. 🧩 Split Services by Function

- [x] `stt/`: Whisper NPU Python code
- [x] `tts/`: Tacotron + WaveRNN pipelines
- [x] `cephalon/`: LLM/STT/TTS IO router (Node/JS)
- [x] `eidolon/`: Cognitive/emotion state simulation
- [x] `discord-indexer/`: Message archiver (Python, Discord API)
- [x] `discord-embedder/`: ChromaDB enrichment service
- [ ] `io/`: General Discord bot interface(s) (deferred?)

### 3. 🧼 Refactor Shared Code

- [ ] Move reusable logic to `shared/{py,js}/`
- [ ] Set up `shared/sibilant/` and `shared/hy/` as source dirs
- [ ] Ensure all runtime imports resolve to `shared/js` and `shared/py`

### 4. 📂 Reorganize GitHub Pages Site

- [ ] Move `riatzukiza.github.io/` → `sites/portfolio/`
- [ ] Strip old bot logic from public-facing site
- [ ] Maintain compatibility with GitHub Pages pipeline

### 5. 📁 Normalize Obsidian Vault

- [x] Place vault at project root (`/`)
- [x] Add `vault-config/` with minimal plugin setup (e.g., Kanban)
- [x] Reference vault contents in `README.md`
- [x] Exclude `.obsidian/` in `.gitignore`, commit `vault-config/` only

### 6. 🧪 DevOps & Ecosystems

- [ ] Set up `pm2` ecosystem files per agent
- [ ] Add `ecosystem.global.config.js` for shared services
- [ ] Track which services are agent-specific (Cephalon, Eidolon) vs global (STT/TTS/LLM)
- [ ] Document process lifecycle expectations per agent

### 7. 📜 Write Documentation

- [ ] Update `README.md` at root
- [x] Write and maintain `AGENTS.md`
- [x] Define `Promethean File Structure` canvas
- [x] Add `agent-mode` prompt guidance to `AGENTS.md`

### 8. 📦 Model Asset Management

- [x] Track large model binaries with Git LFS using `.gitattributes`
- [x] Provide `download.sh` helpers in model folders so weights can be fetched on demand

---

## 🧠 Philosophy

> "Duck didn’t die — Duck evolved."

We are not discarding the legacy system. We're recontextualizing it. All previous functionality should either:

- Be extracted as a service
- Be elevated as an agent
- Or be archived if obsolete

Every step in this migration is a cut toward _coherence_.

---

## 📌 Final Step

When migration is complete:

- [ ] Remove legacy `duck/` and `riatzukiza.github.io` code stubs
- [ ] Commit a migration summary note in `/docs/`
- [ ] Run the entire system using the new `pm2` ecosystem
- [ ] Enable `agent-mode` and let Codex operate on the new layout

---

#tags: #migration #promethean #duck #project-evolution #monorepo #devops #refactor
