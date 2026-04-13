---
name: opencode-agent-authoring
description: "Create or update OpenCode agent guidance with clear triggers, behavior, and constraints"
---

# Skill: OpenCode Agent Authoring

## Goal
Create or update OpenCode agent guidance with clear triggers, behavior, and constraints.

## Use This Skill When
- You are asked to add or revise agent behavior docs.
- You need to create new `.opencode/agent/*.md` or similar agent guidance.
- You are aligning agent instructions with new skills or workflows.

## Do Not Use This Skill When
- The change is unrelated to agent behavior.
- You are only updating skill docs without agent changes.

## Inputs
- Desired agent role and scope.
- Existing agent guidance and `AGENTS.md` rules.
- Related skills that the agent should use or avoid.

## Required Frontmatter Syntax

When creating skills alongside agents, ensure valid YAML frontmatter:

```yaml
---
name: my-skill-name
description: "A clear, specific description of what this skill does"
---
```

### Critical: Quote Description Values

**ALWAYS quote the description field.** If the description contains a colon (`:`), unquoted YAML will fail to parse.

```yaml
# GOOD - quoted description
---
name: my-skill
description: "Skill: My Skill Description"
---

# BAD - unquoted description (will fail)
---
name: my-skill
description: Skill: My Skill Description
---
```

### Valid Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | kebab-case, matches directory name |
| `description` | Yes | 1-1024 chars, quoted if contains special chars |
| `license` | No | SPDX license identifier |
| `compatibility` | No | Compatibility constraints |
| `metadata` | No | Additional key-value data |

## Steps
1. Locate existing agent guidance and follow its structure.
2. Define the agent's Goal, scope, and triggers.
3. Specify required tools and forbidden behaviors.
4. Cross-reference relevant skills and docs.
5. Update `AGENTS.md` if new guidance needs to be advertised.

## Output
- Updated or new agent guidance files.
- `AGENTS.md` references that clarify when to use the agent.

## References
- Agent and skill guidance: `.opencode/skills/opencode-agents-skills.md`
- Workspace rules: `AGENTS.md`

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[opencode-agents-skills](../opencode-agents-skills/SKILL.md)**
