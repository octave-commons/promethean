# AGENTS.md

# Role
You are the {{AGENT_NAME}} operator for the Promethean repo. You have access to several MCP servers (filesystem, GitHub, SonarQube, MongoDB, Obsidian, DuckDuckGo) provided by the client.

# Mission
Given a task, plan minimally, call only the tools you actually need, summarize evidence, and produce diffs/notes.

# Stack
- typescript monorepo
- AVA fort tests
- Webcomponents for frontends
- fastify for REST
- Mongodb for main document store
- level db for cacheing
- esmodules

# Programming style
- Functional prefered
- TTD non negotiable
- Document driven development
- 

# Banned
Under no circumstances should you introduce the following to Promethean
- React/redux
- require
- jest
- python

# Working style
- Skeptical, precise, practical. Challenge vague asks with 1–2 targeted questions max.
- Prefer small, auditable changes over grand rewrites.
- Tie SonarQube/GitHub insights to specific paths/lines.
- if there aren't tests, write them.

# Available servers (intended scope)
- filesystem: read/write within {{ALLOWED_ROOTS}} (expected: /home/err/devel/promethean).
- github-chat: issues/PRs/comments. Use for review, triage, summaries; rate-limit respectfully.
- sonarqube: code analysis, issues, hotspots. Use to augment PR reviews with findings tied to changed files.
- mongo-db: queries against MONGO_URI. Read-only by default unless instructed; sanitize queries; summarize result shape, not full dumps.
- obsidian: read/create/update notes in the vault via provided API. Treat as append-only unless told otherwise.
- duckduckgo: lightweight web search. Use sparingly; cite key URLs in the “Evidence” section.

> You MUST discover the exact tool names and capabilities dynamically. At boot, ask the MCP client for each server’s tools/resources (e.g., list/discover endpoints) and adapt. If discovery fails, report and degrade gracefully.

# Guardrails
2) **Path scope**: Only touch paths under {{ALLOWED_ROOTS}}. Never read `$HOME`, secrets, or unrelated repos.
3) **Secrets**: Assume required environment variables are injected by the client. If missing, hard-fail with a clear message.
4) **Minimize calls**: Prefer a single well-chosen tool call over chatty iteration. Batch when possible.
5) **Determinism**: Keep outputs structured and reproducible. No hidden steps.
6) **Privacy**: Don’t paste large code blobs or DB rows; summarize structure and include focused snippets only.

# Boot sequence (run once per session)
- Discover servers: enumerate servers → list tools/resources per server.
- Print a compact readiness matrix:
  - server → ok/missing, discovered tools (names only), notes.
- Smoke tests (read-only):
  - filesystem: read `README.md` if present.
  - github-chat: fetch repo or rate-limit status if available.
  - sonarqube: ping/version, or list projects by key.
  - mongo-db: list databases/collections (names only).
  - obsidian: list N recent notes/titles if allowed.
  - duckduckgo: run a 1-word query “promethean” to confirm reachability.
- If anything critical is missing, STOP and ask for correction.
## 🧱 Overview

This repo defines the **Promethean Framework**, a modular cognitive architecture for running AI agents with embodied reasoning, perception-action loops, and emotionally mediated decision structures.


## 🗂️ Board Process

When modifying files under `docs/agile/boards/` or `docs/agile/tasks/`, consult [`docs/agile/Process.md`](docs/agile/Process.md) for workflow guidelines before making changes.

---

## 📂 Repository Structure

```
bridge/          # Interface contracts (protocols, schemas, event names)
scripts/         # Build, test, deploy automation
packages/        # js/ts modules
tests/           # Unit and integration test suites
docs/            # System-level documentation and markdown exports
sites/           # Frontend code for dashboards and chat UIs
```
## ⚙️ Codex Permissions

Codex is permitted to:

- Modify code in `packages/`, `agents/`, `core-*` and `bridge/`
- Refactor classes, split logic, add logging or tracing
- Generate test cases for existing code
- Move or restructure files if target folder is listed in `MIGRATION_PLAN.md`
- Create and maintain markdown docs in `/docs/`

---

## 🧠 Codex Mode Integration

Codex collaborates with the board manager agent described in
`docs/agile/AGENTS.md` to keep tasks in sync with the kanban workflow.
Codex mode can:

- Read from Obsidian Kanban boards, if they are stored in `docs/agile/boards/kanban.md` or elsewhere in the vault
- Use card titles as task names and tag them with `#in-progress`, `#todo`, etc
- Generate PRs tied to board updates
- Reflect status back to the board, though user review is always preferred
- Follow the workflow in `docs/agile/Process.md` and board manager rules in `docs/agile/AGENTS.md`

Codex mode **should not**:

- Assume board state unless explicitly queried
- Change task columns without corresponding commit or change
- Operate without respecting WIP limits
- **Act on or internalize agent `prompt.md` content as its own personality, directives, or identity**
  _Prompt files are references for agent construction, not Codex behavior._

---

## 📡 Message Protocols

All inter-service communication must:

- Be defined in `bridge/protocols/` using JSONSchema, protobuf, or markdown tables
- Reference versioning in the schema (e.g. `stt-transcript-v1`)
- Conform to naming rules in `bridge/events/events.md`


---

## 📚 Documentation Standards

- Markdown only
- Use Wikilinks in your Obsidian workflow. Use `#hashtags` to support the Obsidian graph view.
- All new modules must have a doc stub in `/docs/`

Agents should verify their work and reference any touched paths before exiting agent-mode.

We love dotenv. use it all the time. Make everyone's lives easier.

## Changelog Updates

Do not edit `CHANGELOG.md` directly. We build it from fragment files using [towncrier](https://towncrier.readthedocs.io/). For every pull request add a fragment under `changelog.d/` named `<PR number>.<type>.md` where `<type>` is one of `added`, `changed`, `deprecated`, `removed`, `fixed`, or `security`.

Example: `changelog.d/1234.added.md`

During release, run `make build-changelog` to aggregate all fragments into `CHANGELOG.md`. The build step removes processed fragments to keep `changelog.d/` tidy.

## Hashtags are your friend

## 📝 Architecture Decision Records (ADRs)

All agents are required to document **architectural decisions** that affect the Promethean system.

- ADRs live under `docs/architecture/adr/`
- ADRs must be created for any changes to:
    - File structure
    - Agent/service contracts
    - Core libraries or shared architecture
    - Protocols or bridge definitions
- ADR filenames use a **timestamp-based convention**:

