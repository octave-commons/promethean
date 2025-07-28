Absolutely. Here's a structured **Migration Plan** for transitioning from your legacy Duck and `riatzukiza.github.io` projects into the unified **Promethean** monorepo architecture:

---

# 📦 MIGRATION\_PLAN.md

## 🧭 Purpose

This document outlines the migration steps from the legacy `duck/` folder and `riatzukiza.github.io` project into the Promethean monorepo, aligning everything under a unified architecture and consistent tooling. This includes the formal shift from "Duck as a bot" to "Duck as an agent instance of Promethean."

---

## 🗺️ Migration Goals

* Flatten architecture and consolidate services under `services/`
* Promote modularity and multi-agent support
* Maintain support for language diversity (Hy, Python, Sibilant, JS, TS)
* Separate shared libraries from runtime microservices
* Establish project-wide consistency (naming, environment, entry points)
* Prepare for `agent-mode` and `codex` tooling

---

## ✅ Migration Checklist

### 1. 🔀 Restructure Duck

* [ ] Move `duck/` → `agents/duck/`
* [ ] Separate prompts, memory bindings, voice configs
* [ ] Strip out non-agent-specific logic (move to `services/`)

### 2. 🧩 Split Services by Function

* [x] `stt/`: Whisper NPU Python code
* [x] `tts/`: Tacotron + WaveRNN pipelines
* [x] `cephalon/`: LLM/STT/TTS IO router (Node/JS)
* [x] `eidolon/`: Cognitive/emotion state simulation
* [x] `discord-indexer/`: Message archiver (Python, Discord API)
* [x] `discord-embedder/`: ChromaDB enrichment service
* [ ] `io/`: General Discord bot interface(s) (deferred?)

### 3. 🧼 Refactor Shared Code

* [ ] Move reusable logic to `shared/{py,js}/`
* [ ] Set up `shared/sibilant/` and `shared/hy/` as source dirs
* [ ] Ensure all runtime imports resolve to `shared/js` and `shared/py`

### 4. 📂 Reorganize GitHub Pages Site

* [ ] Move `riatzukiza.github.io/` → `site/`
* [ ] Strip old bot logic from public-facing site
* [ ] Maintain compatibility with GitHub Pages pipeline

### 5. 📁 Normalize Obsidian Vault

* [x] Place vault at project root (`/`)
* [x] Add `vault-config/` with minimal plugin setup (e.g., Kanban)
* [x] Reference vault contents in `README.md`
* [x] Exclude `.obsidian/` in `.gitignore`, commit `vault-config/` only

### 6. 🧪 DevOps & Ecosystems

* [ ] Set up `pm2` ecosystem files per agent
* [ ] Add `ecosystem.global.config.js` for shared services
* [ ] Track which services are agent-specific (Cephalon, Eidolon) vs global (STT/TTS/LLM)
* [ ] Document process lifecycle expectations per agent

### 7. 📜 Write Documentation

* [ ] Update `README.md` at root
* [x] Write and maintain `AGENTS.md`
* [x] Define `Promethean File Structure` canvas
* [ ] Add `agent-mode` prompt guidance to `AGENTS.md`

---

## 🧠 Philosophy

> "Duck didn’t die — Duck evolved."

We are not discarding the legacy system. We're recontextualizing it. All previous functionality should either:

* Be extracted as a service
* Be elevated as an agent
* Or be archived if obsolete

Every step in this migration is a cut toward *coherence*.

---

## 📌 Final Step

When migration is complete:

* [ ] Remove legacy `duck/` and `riatzukiza.github.io` code stubs
* [ ] Commit a migration summary note in `/docs/`
* [ ] Run the entire system using the new `pm2` ecosystem
* [ ] Enable `agent-mode` and let Codex operate on the new layout

---

#tags: #migration #promethean #duck #project-evolution #monorepo #devops #refactor

---

Let me know if you'd like this turned into a canvas or kanban board.
