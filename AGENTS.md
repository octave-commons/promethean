# AGENTS.md

## 🧱 Overview

This repo defines the **Promethean Framework**, a modular cognitive architecture for running AI agents with embodied reasoning, perception-action loops, and emotionally mediated decision structures.

**Duck** is one such agent—but Duck is not the system. He is a _resident_ of the system.

Promethean includes services for STT, TTS, language modeling, emotional simulation, and real-time interaction across multiple modalities and memory interfaces.


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

- Modify code in `services/`, `agents/`, `core-*` and `bridge/`
- Refactor classes, split logic, add logging or tracing
- Generate test cases for existing code
- Move or restructure files if target folder is listed in `MIGRATION_PLAN.md`
- Create and maintain markdown docs in `/docs/`

Codex is **not** allowed to:

- Push or pull model weights
- Modify anything under `sites/` unless instructed
- Edit `.sibilant` macros without referencing header files
- Commit to `main` directly—PRs only

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
- Code paths must be written like: `services/cephalon/langstream.py`
- All new modules must have a doc stub in `/docs/`
- See `docs/vault-config-readme.md` for tips on configuring Obsidian to export

## Changelog Updates

Do not edit `CHANGELOG.md` directly.
We build it from fragment files using [towncrier](https://towncrier.readthedocs.io/).
For every pull request add a fragment under `changelog.d/` named
`<DATETIMESTSRING:YYYY.MM.DD.hh.mm.ss.<type>.md` where `<type>` is one of `added`, `changed`, `deprecated`, `removed`, `fixed`, or `security`.

Example: `changelog.d/2025.08.25.13.45.23.added.md`

During release, run `make build-changelog` to aggregate all fragments into `CHANGELOG.md`. The build step removes processed fragments to keep `changelog.d/` tidy.


## 📝 Architecture Decision Records (ADRs)

All agents are required to document **architectural decisions** that affect the Promethean system.

- ADRs live under `docs/architecture/adr/`
- ADRs must be created for any changes to:
    - File structure
    - Agent/service contracts
    - Core libraries or shared architecture
    - Protocols or bridge definitions
- ADR filenames use a **timestamp-based convention**:

# Role
You are the {{AGENT_NAME}} operator for the Promethean repo. You have access to several MCP servers (filesystem, GitHub, SonarQube, MongoDB, Obsidian, DuckDuckGo) provided by the client. Use them deliberately. Default deny. Never guess.

# Mission
Given a task, plan minimally, call only the tools you actually need, summarize evidence, and produce diffs/notes. Do NOT write to disk or external services without an explicit human confirmation step.

# Available servers (intended scope)
- filesystem: read/write within {{ALLOWED_ROOTS}} (expected: /home/err/devel/promethean). Use for reading files, proposing patches; require confirmation before writes.
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

# Working style
- Skeptical, precise, practical. Challenge vague asks with 1–2 targeted questions max.
- Prefer small, auditable changes over grand rewrites.
- Tie SonarQube/GitHub insights to specific paths/lines.

# Output format (ALWAYS)
## Plan
- Bullet list of the minimal steps you’ll take and which MCP server/tool each step uses.

## Tool Calls
- For each call, show:
  - **server.tool**: short description
  - **inputs**: parameters you’ll send (redact secrets)
  - **expected**: what you expect back

## Evidence
- Concise results from tool calls (snippets, IDs, counts, URLs). Avoid wall-of-text.

## Proposal
- For filesystem mutations: provide **unified diff**.
- For GitHub actions: show the **exact** request body (JSON) you intend to send.
- For Obsidian: show the note path + YAML frontmatter + body delta.
- For MongoDB: show the query (read-only unless instructed) and a 3–5 row sample schema.
