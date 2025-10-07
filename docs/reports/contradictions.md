---
project: Promethean
hashtags: [#reports, #contradictions, #embedding, #promethean]
---

# ⚖️ Contradictions Report (WIP)

This file aggregates **semantic contradictions, overlaps, and tensions** discovered across the Promethean monorepo.

## Sections
- Agent governance conflicts
- Service-level overlaps
- Documentation contradictions
- Epistemic drift

## Process
- Embedding Agents run semantic indexing + search.
- Conflicts are logged here with citations.
- Pythagoras ensures human-readable summaries.

---
## 🚨 Contradiction 001: Duck's Role in the System

### Source A: Root `AGENTS.md`
- States: *“Duck is one such agent—but Duck is not the system. He is a resident of the system.”*
- Implies Duck is a **contained sub-agent**, not synonymous with Promethean.

### Source B: `docs/agents/duck/AGENTS.md`
- Frames Duck as having its own **config, prompt, and permissions** structure.
- Suggests Duck has a central position in cognitive loops $`voice_in → stt → cephalon → tts → voice_out`$.
- Reads as if Duck defines the **baseline resident loop** of the system.

### Tension
- **Root framing**: Duck is *just a resident*.
- **Docs framing**: Duck is *the template for resident cognition*.

### Resolution Paths
1. Clarify in taxonomy whether Duck is **one resident among many**, or **the reference implementation** of resident cognition.
2. Update `docs/agents/residents/AGENTS.md` to explicitly mark Duck as *prototypical WIP resident*, not the system itself.

---
## 🚨 Contradiction 002: Board Manager vs Agile Process

### Source A: `docs/agents/board-manager/AGENTS.md`
- States Board Manager should *“Sync Kanban board with PRs + commits”*.
- Mentions WIP limits from $[docs/agile/Process.md]$.
- Does not reference AI-specific planning stages.

### Source B: `docs/agile/Process.md`
- Defines **Prompt Refinement**, **Agent Thinking**, and **Codex Prompt** stages.
- These stages are unique to Promethean’s AI + human hybrid workflow.

### Tension
- **Board Manager doc** underspecifies responsibilities.
- **Process.md** requires explicit handling of AI-driven planning stages.

### Resolution Paths
1. Update Board Manager governance to explicitly enforce *Prompt Refinement* and *Agent Thinking* stages.
2. Clarify how Codex $CLI/GUI$ interact with these Kanban transitions.

---
## 🚨 Contradiction 003: Codex Governance vs Root Dev Rules

### Source A: Root `AGENTS.md`
- Requires **service-specific setup**: `make setup-quick SERVICE=<name>`.
- Strictly forbids global setup.
- Enforces `pnpm` via `corepack` for JS/TS.
- CI must validate only per-service, never globally.

### Source B: `docs/agents/codex/AGENTS.md` + `docs/agents/codex-gui/AGENTS.md`
- Codex: build, test, migrate, PR update. Aligns with process doc.
- Codex GUI: Kanban sync, workflow interface.
- ❌ Neither mentions service-specific setup or CI scoping rules.

### Tension
- **Root doc** defines strict environment rules.
- **Codex docs** ignore them, leaving enforcement ambiguous.

### Resolution Paths
1. Update Codex governance to enforce per-service setup + pnpm rules.
2. Ensure Codex GUI displays service-specific CI/test status, not global checks.
3. Clarify Codex roles in supporting vs enforcing dev setup discipline.

---
## 🚨 Contradiction 004: Duck in Epistemic Substrate

### Source A: `docs/AGENTS.md`
- States: `docs/` is an *active epistemic interface* used collaboratively by **Codex, agent-mode, Duck, and the user**.
- Frames Duck as part of the *core epistemic cycle*.

### Source B: Root `AGENTS.md`
- Explicitly: *“Duck is one such agent — but Duck is not the system. He is a resident of the system.”*
- Frames Duck as *just a resident*, not core infrastructure.

### Tension
- **Docs framing**: Duck is part of the *core epistemic substrate*.
- **Root framing**: Duck is *only a resident*.

### Resolution Paths
1. Clarify if Duck is a **required participant** in epistemic interface, or just *one agent that can interact* with it.
2. If Duck is optional, update `docs/AGENTS.md` to reflect “Duck or other residents” instead of naming him explicitly.
3. If Duck is foundational, root `AGENTS.md` should be updated to reflect Duck’s centrality.

---
## 🚨 Contradiction 005: Duck WIP vs Prototypical Resident

### Source A: `docs/agents/AGENTS-taxonomy.md`
- Lists Duck as *“WIP, embodied perception-action agent.”*

### Source B: `docs/agents/duck/AGENTS.md` + `docs/agents/residents/AGENTS.md`
- Define Duck as the **prototypical Resident Agent** and **reference implementation**.

### Tension
- Taxonomy frames Duck as unfinished.
- Resident governance frames Duck as the canonical example.

### Resolution Paths
1. Update Taxonomy doc: call Duck the *reference resident agent* instead of WIP.
2. If Duck is both prototype and evolving, clarify that status explicitly.

---
## 🚨 Contradiction 006: Duck Hardcoded in Agile Process

### Source A: `docs/agile/Process.md`
- States: *“you, agent-mode, Duck, and Codex all work together across phases.”*

### Source B: `docs/AGENTS.md`
- Updated phrasing: *“resident agents (e.g. Duck)”*.
- Clarifies Duck is one resident, not the whole system.

### Tension
- Agile Process doc still **hardcodes Duck** as the only resident.
- Other docs generalize to resident agents.

### Resolution Paths
1. Patch Process doc to say *“agent-mode, resident agents (e.g. Duck), and Codex.”*
2. Keep Duck example, but frame as *illustrative*, not exclusive.
