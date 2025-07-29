# 📁 Promethean File Structure

This is the formalized layout for the **Promethean Framework** monorepo.

It is designed for:

* Modular cognitive system design
* Multi-agent support (e.g. Duck)
* Root `ecosystem.config.js` starts shared services like STT and TTS
* Language-flexible implementation (Hy/Python and Sibilant/JS/TS)
* Integrated documentation and dataset pipelines

---

## 🗂 Root Directory

```plaintext
/                    ← Obsidian vault root and monorepo root
├── agents/          ← Individual agent instances (Duck, etc.)
│   ├── duck/        ← Voice config, prompt logic, memory bindings
│   └── ...          ← Future agents
│
├── services/        ← Microservices, each a standalone process
│   ├── cephalon/             ← Node-based ML IO router (STT → LLM → TTS)
│   ├── stt/                  ← Python/HY: OpenVINO Whisper
│   ├── tts/                  ← Python: Tacotron/WaveRNN
│   ├── eidolon/              ← Field-based emotional simulation
│   ├── discord-indexer/      ← Discord message archival
│   ├── discord-embedder/     ← ChromaDB vector embedding service
│   └── io/                   ← General bot interfaces (Discord, etc.)
│
├── shared/          ← Language-specific shared libraries
│   ├── hy/          ← Hy Lisp source
│   ├── py/          ← Transpiled + native Python modules
│   # JS/TS structure reflects backend vs frontend separation:
│   └── js/
│       ├── common/   ← Logic usable both client & server
│       ├── server/   ← Node.js-only utilities
│       └── client/   ← Browser-only logic
│   └── ts/
│       ├── common/
│       ├── server/
│       └── client/
│   └── sibilant/    ← Sibilant/Lithp source
│       ├── common/
│       ├── server/
│       ├── client/
│       ├── headers/ ← Sibilant/Lithp headers
│       └── inc/     ← Sibilant/Lithp includables
├── bridge/          ← Language-agnostic protocols & message contracts
│   ├── protocols/   ← JSONSchema, Protobufs, OpenAPI definitions
│   ├── events/      ← Pub/sub event names and enums
│   └── constants/   ← Shared values used across ecosystems
│
├── models/          ← Model weights, configs, tokenizer assets
│   ├── stt/
│   ├── tts/
│   ├── cephalon/
│   └── shared/
│
├── data/            ← Raw, cleaned, and derived datasets
│   ├── stt/
│   ├── tts/
│   ├── cephalon/
│   ├── eidolon/
│   └── prompts/
│
├── training/        ← Training scripts, logs, and fine-tuning configs
│   ├── stt/
│   ├── tts/
│   ├── cephalon/
│   └── logs/
│
├── scripts/         ← Build tools, devops, transpilers
│   ├── build-py.sh
│   ├── build-js.sh
│   └── deploy-agent.sh
│
├── tests/           ← Unit and integration test suites
│   ├── py/
│   ├── hy/
│   ├── sibilant/
│   ├── ts/
│   └── js/
│
├── docs/            ← Internal documentation (Obsidian-safe)
│   ├── vault-config/
│   ├── AGENTS.md
│   ├── MIGRATION_PLAN.md
│   └── READMEs, notes, specs
│
├── site/            ← Public-facing site (from riatzukiza.github.io)
│   ├── assets/
│   ├── index.html
│   └── blog/
│
├── .obsidian/       ← User-local vault config (ignored by git)
├── vault-config/    ← Example Obsidian setup with required plugins
├── README.md
├── AGENTS.md
├── Pipfile / requirements.txt
├── package.json
└── Makefile
```

---

## 🧩 Design Principles

* Vault sits at root to link code, notes, and kanban seamlessly
* Core services should be swappable and agent-agnostic
* Protocol layer defines how services interoperate across languages
* Language diversity is expected—use what works, don’t fight it
* `shared/` holds reusable libraries, organized by language
* JS/TS shared logic is split into `common/`, `client/`, `server/` to manage scope
* Lisp-like code (Hy, Sibilant) transpiles into `py/`, `js/`; always import from those
* Services only run processes; shared code never lives under `services/`

---

## ✅ Notes for Codex

* All service logic must live in `services/`
* All prompt/memory config belongs in `agents/{name}/`
* `AGENTS.md` governs repo structure and allowed operations
* Model files must go in `models/`, not `services/`
* Only import from `shared/py/` or `shared/js/` at runtime

---

#hashtags: #project-structure #promethean #repo-layout #architecture #mono-repo

#tags: #docs
