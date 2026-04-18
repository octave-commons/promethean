---
name: opencode-agent-file-generator
description: "Recursively initialize and update AGENTS.md files across the workspace with context-aware skill advertisements."
trigger: ["init agents", "regenerate agents", "update agent files"]
---

# Skill: OpenCode Agent File Generator

## Goal
To automatically distribute relevant skill knowledge to every sub-package in a mono-repository or workspace. This ensures that AI agents operating in specific directories know exactly which tools are available and relevant to that context, without being overwhelmed by the entire workspace's skill catalog.

## Use This Skill When
- You have added new skills and need to propagate them to relevant packages.
- You have created new sub-packages or projects and need to initialize their `AGENTS.md`.
- The `AGENTS.md` files are out of sync or contain outdated instructions.
- You want to refresh the "Trigger Words" or descriptions in agent context files.

## How It Works
The skill relies on two Python scripts in `scripts/`:

1.  **Analyze (`scripts/analyze_skills.py`)**:
    - Scans all `SKILL.md` files in `.opencode/skills/`.
    - Extracts metadata (name, description, category).
    - Parses the `## Suggested Next Skills` section to build the dependency graph.
    - Saves the result to `.opencode/skill_graph.json`.

2.  **Generate (`scripts/generate_agents.py`)**:
    - Reads `.opencode/skill_graph.json`.
    - Recursively scans the workspace for projects.
    - Heuristically matches skills to projects.
    - Updates `AGENTS.md` files.

## Execution
To run the full pipeline:

```bash
# 1. Analyze and build the graph
python3 .opencode/skills/opencode-agent-file-generator/scripts/analyze_skills.py

# 2. Distribute agent files
python3 .opencode/skills/opencode-agent-file-generator/scripts/generate_agents.py
```
