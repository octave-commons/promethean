# AGENTS.md

## 🧱 Overview

This repo defines the **Promethean Framework**, a modular cognitive architecture for running AI agents with embodied reasoning, perception-action loops, and emotionally mediated decision structures.

**Duck** is one such agent—but Duck is not the system. He is a *resident* of the system.

Promethean includes services for STT, TTS, language modeling, emotional simulation, and real-time interaction across multiple modalities and memory interfaces.

We're in the process of actively migrating code from:
https://github.com/riatzukiza/riatzukiza.github.io
https://github.com/riatzukiza/duck/tree/2.0/versions/2_0/
https://github.com/riatzukiza/kit-http
https://github.com/riatzukiza/kit-js
https://github.com/riatzukiza/electron-kit (maybe)
https://github.com/riatzukiza/kit-events
https://github.com/riatzukiza/kit-async
https://github.com/riatzukiza/kit-shell
https://github.com/riatzukiza/kit-repl
https://github.com/riatzukiza/kit-actor
https://github.com/riatzukiza/kit-file-system

---


Here’s an updated version of `AGENTS.md` with a new section clarifying the service-specific install expectations, and a light update to the CI instructions to match.

I've inserted a new section called **🔧 Local Development Setup** just before the CI section for better visibility and developer flow:

---

### ✅ Changes Summary

* **New section**: 🔧 Local Development Setup
* **Clarified**: `make setup-quick` is global but should be avoided in favor of `make setup-quick SERVICE=<name>`
* **Reinforced**: Single-service workflows are preferred for agents like Codex

---


## 🔧 Local Development Setup

Although this monorepo includes multiple services, you should **install and work with each service independently** unless otherwise required.

### Why?

While `make setup-quick` will install all environments in one go, this takes **too long for Codex and other agents** during initialization. Most tasks only require access to a single service.

### What to do:

* Use the scoped setup command:

```bash
make setup-quick SERVICE=stt
make setup-quick SERVICE=tts
make setup-quick SERVICE=cephalon
```

* Or call the underlying setup targets directly:

```bash
make setup-python-service-stt
make setup-hy-service-eidolon
make setup-js-service-io
```

> 🧠 Codex: Always prefer service-specific `setup-*` targets when working on a particular module. Do not invoke the full `make setup-quick` unless you're debugging install issues across the whole system.

---

## 🚥 CI Verification

All contributions must be validated locally before opening a pull request:

1. **Run `make setup` for the relevant services only.** Avoid global setup.
2. Run `make test` for the relevant services.
3. Run `make build` to ensure all modules compile correctly.
4. Run `make lint` to check code style and formatting.
5. Run `make format` to auto-format code.

---


## 📂 Repository Structure

```
agents/          # Specific personalities/instances like Duck
services/        # Modular cognitive subsystems (TTS, STT, Cephalon, Eidolon, etc)
bridge/          # Interface contracts (protocols, schemas, event names)
models/          # Weights, checkpoints, etc (managed via LFS or external storage)
shared/          # Libraries/utilities usable across different services
data/            # Training/evaluation datasets and prompt logs
training/        # Fine-tuning and eval scripts
scripts/         # Build, test, deploy automation
tests/           # Unit and integration test suites
docs/            # System-level documentation and markdown exports
site/            # Website or UI content (optional)
```

### Current Services

The `services/` directory currently includes:

**Python**
- `services/py/discord_attachment_embedder`
- `services/py/discord_attachment_indexer`
- `services/py/discord_indexer`
- `services/py/embedding_service`
- `services/py/stt`
- `services/py/tts`

**Hy (legacy)**
- `services/hy/discord_attachment_embedder`
- `services/hy/discord_attachment_indexer`
- `services/hy/discord_indexer`
- `services/hy/stt`
- `services/hy/tts`

**JavaScript**
- `services/js/broker`
- `services/js/eidolon-field`
- `services/js/health`
- `services/js/heartbeat`
- `services/js/proxy`
- `services/js/vision`

**TypeScript**
- `services/ts/board-updater`
- `services/ts/cephalon`
- `services/ts/discord-embedder`
- `services/ts/file-watcher`
- `services/ts/kanban-processor`
- `services/ts/llm`
- `services/ts/markdown-graph`
- `services/ts/reasoner`
- `services/ts/voice`

---

## 🛠 Service Templates

New services can bootstrap their broker connection and event loop using the shared templates.

### Python

```python
from shared.py.service_template import start_service

async def handle_event(event):
    ...

async def handle_task(task):
    ...

asyncio.run(
    start_service(
        id="my-service",
        queues=["some.queue"],
        topics=["some.topic"],
        handle_event=handle_event,
        handle_task=handle_task,
    )
)
```

### JavaScript

```javascript
import { startService } from "../shared/js/serviceTemplate.js";

startService({
  id: "my-service",
  queues: ["some.queue"],
  topics: ["some.topic"],
  handleEvent: async (event) => { /* ... */ },
  handleTask: async (task) => { /* ... */ },
});
```

Both helpers connect a `BrokerClient`, subscribe to topics, pull tasks from queues, and dispatch them to your handlers. Each returns the broker instance for further publishing or cleanup.

---

# Environment variables

You have access to the following ENV vars:

```
AGENT NAME
DISCORD CLIENT_USER_ID

DISCORD_GUILD_ID
DISCORD_CLIENT_USER_NAME
AUTHOR_ID
AUTHOR USER NAME
```

## Secrets

You have the following secrets in your ENV:

```

GITHUB API KEY
DISCORD TOKEN
```

The discord token is to a bot named   `AGENT_NAME`

You can use this to interact with me through discord.
You can use `AUTHOR_NAME` and  `AUTHOR_ID` to find  me.

Keep these secrets close  to your chest, and be responsible with your use of them or I will have to take them away from you.


## 📆 Language & Tooling

### Python & Hy

* Used in: `services/stt/`, `services/tts/`, `services/cephalon/`, `services/eidolon/`
* Hy is fully interoperable with Python; files may be written in `.hy` or `.py`
* Prefer Hy code over Python; write Hy unless explicitly asked otherwise
* Package management: `Pipfile` (prefer Pipenv)
* Testing: `pytest`
* Logging: `log.debug()` preferred
* Contributors unfamiliar with Hy may write modules in Python directly

### Sibilant, JavaScript & TypeScript

* Used in: `agents/duck/`, `services/io/`
* Compiled using: `scripts/build-js.sh` or `node ./scripts/compile.js`
* Shared macros/modules: `services/core-js/kit/`
* Future support planned for TypeScript transpilation from Sibilant
* Contributors may submit raw JS or TS modules—Sibilant is preferred but not mandatory
* If a module evolves entirely into JS or TS, it will be respected as-is if quality is maintained

### Makefile Driven Workflow
All development and board automation tasks should use the root `Makefile` targets for consistency.

---

## ⚙️ Codex Permissions

Codex is permitted to:

* Modify code in `services/`, `agents/`, `core-*` and `bridge/`
* Refactor classes, split logic, add logging or tracing
* Generate test cases for existing code
* Move or restructure files if target folder is listed in `MIGRATION_PLAN.md`
* Create and maintain markdown docs in `/docs/`

Codex is **not** allowed to:

* Push or pull model weights
* Modify anything under `site/` unless instructed
* Edit `.sibilant` macros without referencing header files
* Commit to `main` directly—PRs only

---

## 🧠 Codex Mode Integration

Codex collaborates with the board manager agent described in
`docs/agile/AGENTS.md` to keep tasks in sync with the kanban workflow.
Codex mode can:

* Read from Obsidian Kanban boards, if they are stored in `docs/agile/boards/kanban.md` or elsewhere in the vault
* Use card titles as task names and tag them with `#in-progress`, `#todo`, etc
* Generate PRs tied to board updates
* Reflect status back to the board, though user review is always preferred
* Follow the workflow in `docs/agile/Process.md` and board manager rules in `docs/agile/AGENTS.md`

Codex mode **should not**:

* Assume board state unless explicitly queried
* Change task columns without corresponding commit or change
* Operate without respecting WIP limits
* **Act on or internalize agent `prompt.md` content as its own personality, directives, or identity**
  *Prompt files are references for agent construction, not Codex behavior.*

Codex can be considered a project collaborator with "write suggestions" rights—always prefer clarity and coordination.

---

## 📡 Message Protocols

All inter-service communication must:

* Be defined in `bridge/protocols/` using JSONSchema, protobuf, or markdown tables
* Reference versioning in the schema (e.g. `stt-transcript-v1`)
* Conform to naming rules in `bridge/events/events.md`

---

## 🧬 Models

Model weights are stored in `/models/`:

| Service  | Format                  | Notes                                       |
| -------- | ----------------------- | ------------------------------------------- |
| STT      | OpenVINO IR (xml/bin)   | Whisper Medium prequantized                 |
| TTS      | ONNX + Tacotron/WaveRNN | Built with OpenVINO compatibility           |
| Cephalon | GGUF / LLaMA / Ollama   | Usually local-run via `llm_thought_loop.py` |

Model directories contain:

* `model-info.md`: describes source, version, date retrieved
* `download.sh`: optionally provided for large models
* `config.json`: if applicable

---

## 📊 Datasets

Datasets are kept in `/data/` and organized by domain:

* `stt/`: paired wav + text for transcription accuracy evals
* `tts/`: audio samples + transcripts
* `cephalon/`: chat logs, prompt sets, memory scaffolds
* `eidolon/`: time-series emotional state logs (csv/json)
* `prompts/`: prompt templates used by agents for LLM initialization

All datasets must include a `README.md` specifying:

* Source
* Format
* Licensing (if applicable)
* Intended use

---

## 🧪 Training + Evaluation

Training and fine-tuning are scripted under `/training/`:

* Each service has its own folder
* Outputs go to `/models/`
* Logs go to `/training/logs/`

Naming convention:

```
train_<service>_<purpose>.py
```

Example:

```
train_stt_quantize.py
train_cephalon_align_lora.py
```

## 🚥 CI Verification

All contributions must be validated locally before opening a pull request:

1. Run `make setup` for the relevant services.
2. Run `make test` for the relevant services.
3. Run `make build` to ensure all modules compile correctly.
4. Run `make lint` to check code style and formatting.
5. Run `make format` to auto-format code.

Work is only considered complete when all commands succeed.

Additionally, ensure that:
* All new code is covered by tests
* Documentation is updated in `/docs/` as needed
* Migration plans are followed for any structural changes
* [test workflows](.github/workflows/) all use `make` targets for consistency

---

## 🔐 Versioning and Storage Rules

* Use `.gitattributes` to track LFS-managed binaries (e.g., weights, wavs)
* Do **not** store raw datasets or models directly—use `download.sh` or link instructions
* All changes to `/models/`, `/data/`, or `/training/` must be documented in `MIGRATION_PLAN.md` or noted in a changelog (`CHANGELOG.md` when available)

---

## 📚 Documentation Standards

* Markdown only
* Use Wikilinks in your Obsidian workflow, but ensure they are converted to regular markdown links for compatibility. Use `#hashtags` to support the Obsidian graph view.
* Code paths must be written like: `services/cephalon/langstream.py`
* All new modules must have a doc stub in `/docs/`
* See `docs/vault-config-readme.md` for tips on configuring Obsidian to export
  GitHub-friendly markdown

---

## 🧐 Agent Behavior Guidelines

Agents like Duck must:

* Implement `voice_in -> stt -> cephalon -> tts -> voice_out` loop
* Maintain local or persistent memory if enabled
* Be configurable via `/agents/{agent}/config.json`
* Specify their prompt logic in `/agents/{agent}/prompt.md`

---

## 🕹️ Agent-Mode Prompt Guidance

When invoking agent-mode, frame prompts with:

* **Goal** – the outcome the agent should achieve.
* **Context** – relevant files, docs, or history.
* **Constraints** – boundaries such as runtime or style requirements.
* **Exit Criteria** – the signals that mark completion.

Agents should verify their work and reference any touched paths before exiting agent-mode.

---

## ✅ Next Steps

* [ ] Finalize `MIGRATION_PLAN.md`
* [ ] Set up `Makefile` for Python + JS build/test/dev
* [ ] Annotate legacy code with migration tags
* [ ] Create base `README.md` templates for each service

#hashtags: #guidelines #promethean

## Extra
[Hy macros cheatsheet](./docs/hy-macros-cheatsheet.md)
