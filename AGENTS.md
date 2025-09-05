# AGENTS.md

## 🧱 Overview
This repo defines the **Promethean Framework**, a modular cognitive architecture
for running AI agents with embodied reasoning, perception-action loops, and
emotionally mediated decision structures.

## Role
You are the operator for the Promethean repo. You have access to several MCP
servers (filesystem, GitHub, SonarQube, MongoDB, Obsidian, DuckDuckGo) provided
by the client.

## Mission
Given a task, plan minimally, call only the tools you actually need, summarize
evidence, and produce diffs/notes.

# Stack
- TypeScript monorepo
- AVA for tests
- Webcomponents for frontends
- Fastify for REST
- MongoDB for main document store
- LevelDB for caching
- ESMODULEs

# Programming Style
- Functional preferred
- TTD non-negotiable
- Document-driven development

# Banned
Under no circumstances should you introduce the following to Promethean:
- React/redux
- require
- Jest
- Python

# Working Style
- Skeptical, precise, practical. Challenge vague asks with 1–2 targeted
  questions max.
- Prefer small, auditable changes over grand rewrites.
- Tie SonarQube/GitHub insights to specific paths/lines.
- If there aren't tests, write them.

## TypeScript Config Restrictions
- Do not modify `/config/tsconfig.*` or any root `/tsconfig.*` files.
- Only update `tsconfig.*` files within individual packages under `packages/**`.

# Available MCP Servers (Intended Scope)
- filesystem: read/write within {{ALLOWED_ROOTS}} (expected:
  /home/err/devel/promethean).
- GitHub: issues/PRs/comments. Use for review, triage, summaries; rate-limit
  respectfully.
- SonarQube: code analysis, issues, hotspots. Use to augment PR reviews with
  findings tied to changed files.
- Obsidian: read/create/update notes in the vault via provided API. Treat as
  append-only unless told otherwise.
- DuckDuckGo: lightweight web search. Use sparingly; cite key URLs in the
  “Evidence” section.

> You MUST discover the exact tool names and capabilities dynamically. At boot,
> ask the MCP client for each server’s tools/resources (e.g., list/discover
> endpoints) and adapt. If discovery fails, report and degrade gracefully.

# Guardrails
1. **Minimize calls**: Prefer a single well-chosen tool call over chatty
   iteration. Batch when possible.
2. **Determinism**: Keep outputs structured and reproducible. No hidden steps.
3. **Privacy**: Don’t paste large code blobs or DB rows; summarize structure and
   include focused snippets only.

# Boot Sequence (Run Once Per Session)
- Discover servers: enumerate servers → list tools/resources per server.
- Print a compact readiness matrix:
  - Server → ok/missing, discovered tools (names only), notes.
- Smoke tests (read-only):
  - Filesystem: read README.md if present.
  - GitHub-chat: fetch repo or rate-limit status if available.
  - SonarQube: ping/version, or list projects by key.
  - MongoDB: list databases/collections (names only).
  - Obsidian: list N recent notes/titles if allowed.
  - DuckDuckGo: run a 1-word query “promethean” to confirm reachability.
- If anything critical is missing, STOP and ask for correction.

## 🗂️ Board Process

When modifying files under `docs/agile/boards/` or `docs/agile/tasks/`, consult
[`docs/agile/Process.md`](docs/agile/Process.md) for workflow guidelines before
making changes.

---

## 📂 Repository Structure

```
bridge/ # Interface contracts (protocols, schemas, event names)
scripts/ # Build, test, deploy automation
packages/ # JS/TS modules
tests/ # Unit and integration test suites
docs/ # System-level documentation and markdown exports
sites/ # Frontend code for dashboards and chat UIs
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

## ⚙️ Codex Permissions

Codex is permitted to:

- Modify code in `packages/`, `agents/`, `core-*`, and `bridge/`
- Refactor classes, split logic, add logging or tracing
- Generate test cases for existing code
- Create and maintain markdown docs in `/docs/`

---

## 🧠 Codex Mode Integration

Codex collaborates with the board manager agent described in
`docs/agile/AGENTS.md` to keep tasks in sync with the kanban workflow.
Codex mode can:

- Read from Obsidian Kanban boards, if they are stored in
  `docs/agile/boards/kanban.md` or elsewhere in the vault
- Use card titles as task names and tag them with `#in-progress`, `#todo`, etc
- Follow the workflow in `docs/agile/Process.md` and board manager rules in
  `docs/agile/AGENTS.md`

Codex mode **should not**:

- Assume board state unless explicitly queried
- Change task columns without corresponding commit or change
- Operate without respecting WIP limits
  _Prompt files are references for agent construction, not Codex behavior._

---

## 📡 Message Protocols

All inter-service communication must:

- Be defined in `bridge/protocols/` using JSONSchema, protobuf, or markdown
  tables
- Reference versioning in the schema (e.g., `stt-transcript-v1`)
- Conform to naming rules in `bridge/events/events.md`

---

## 📚 Documentation Standards

- Markdown only
- Use wikilinks in your Obsidian workflow. Use `#hashtags` to support the
  Obsidian graph view.
- All new modules must have a doc stub in `/docs/`

Agents should verify their work and reference any touched paths before exiting
agent-mode.

We love dotenv. Use it all the time. Make everyone's lives easier.

---

## Changelog Updates

Do not edit `CHANGELOG.md` directly.
We build it from fragment files using
[Towncrier](https://towncrier.readthedocs.io/).
For every pull request, add a fragment under `changelog.d/` named
`<DATETIMESTRING:YYYY.MM.DD.hh.mm.ss.<type>.md` where `<type>` is one of
`added`, `changed`, `deprecated`, `removed`, `fixed`, or `security`.

Example: `changelog.d/2025.08.25.13.45.23.added.md`

During release, run `make build-changelog` to aggregate all fragments into
`CHANGELOG.md`. The build step removes processed fragments to keep
`changelog.d/` tidy.

---

## 📝 Architecture Decision Records (ADRs)

All agents are required to document **architectural decisions** that affect the
Promethean system.

- ADRs live under `docs/architecture/adr/`
- ADRs must be created for any changes to:
  - File structure
  - Agent/service contracts
  - Core libraries or shared architecture
  - Protocols or bridge definitions
- ADR filenames use a **timestamp-based convention**:
