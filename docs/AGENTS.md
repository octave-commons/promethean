# AGENT: Documentation Vault

## Overview

The `docs/` directory is the Promethean system's knowledge substrate and memory layer. It serves as both a human-facing vault (via Obsidian) and an AI-readable semantic map of the system’s structure, intentions, and ongoing development.

This is not passive documentation — it is an active *epistemic interface* through which Codex, agent-mode, Duck, and the user collaboratively build, refine, and evolve the system.

## Responsibilities

- Mirror the shape and logic of the codebase (`/services`, `/agents`, `/shared`)
- Maintain structured documents (`AGENT.md`, `README.md`, `process.md`) for each component
- Serve as the workspace for document-driven development
- Provide structured inputs to Codex and synthesis agents
- Surface design history, cognitive models, and meta-state of the system
- Track Kanban-based development flow through embedded markdown boards

## Inputs

- Raw thoughts from `unique/` dumps
- Structured prompts from `Codex Prompt` and `Agent Thinking`
- Output from Codex (code, docs, specs)
- Human-authored markdown files, Mermaid diagrams, and notes

## Outputs

- Structured `.md` files, organized by mirrored system hierarchy
- Mermaid diagrams of cognitive flow, process pipelines, and agent interrelations
- Codex-ready prompt stubs and agent behavior definitions
- Documents suitable for embedding in `AGENTS.md`, task trackers, or README overlays
- `vault-config/` baseline for replicating the Obsidian environment

## Dependencies

- Obsidian vault logic
- Codex prompt conventions
- Agent-mode dialogue structure
- `kanban.md`, `process_board_flow.md`, and other core docs
- Vault symlinks to code mirrors

## Related Services

- `synthesis_agent` (generates/refines docs from raw data)
- `codex` (acts on tasks and prompt definitions within the vault)
- `vault-config/` (replicates vault for new contributors or environments)

## Launch Instructions

Passive system — no execution required. Mounted automatically via Obsidian.

To sync with system structure:

```bash
npm run build:docs  # optional sync or generate script
````

To browse:

* Open `docs/` in Obsidian with plugins enabled
* Use `graph view` to explore interlinked components
* Kanban lives in `docs/process/`

## Future Work

* Add semantic overlays for `layer1` through `layer8`
* Mirror `/shared/` utils with language-specific doc folders
* Auto-generate `AGENTS.md` stubs from `services/` structure
* Integrate synthesis-agent pass on `unique/` to produce draft docs

## Tags

#agent #docs #epistemic #framework-core #codex-input #knowledge-substrate

