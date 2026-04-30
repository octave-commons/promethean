---
name: opencode-skill-creation
description: "Create new OpenCode skills that validate, load reliably, and follow repository conventions"
---

# Skill: OpenCode Skill Creation

## Goal
Create new OpenCode skills that validate, load reliably, and follow repo conventions.

## Use This Skill When
- The user asks to create a new OpenCode skill or add reusable workflow guidance.
- You need to standardize repeated workflows into a dedicated skill.
- You are expanding the OpenCode skill catalog under `.opencode/`.

## Do Not Use This Skill When
- The change is a one-off edit or quick fix.
- You are only updating a single file without new workflow guidance.

## Inputs
- User request and target workflow context.
- Existing skills in `.opencode/skill/` and `~/.agents/skills/`.
- `AGENTS.md` skill list and any local agent guidance.

## OpenCode Compatibility Rules
- **Location**: OpenCode discovers skills at:
  - Project: `.opencode/skill/<name>/SKILL.md`
  - Global: `~/.config/opencode/skill/<name>/SKILL.md`
  - Claude-compatible (project): `.claude/skills/<name>/SKILL.md`
  - Claude-compatible (global): `~/.claude/skills/<name>/SKILL.md`
- **Frontmatter**: `SKILL.md` must begin with YAML frontmatter. Only these fields are recognized: `name`, `description`, `license`, `compatibility`, `metadata`.
- **Name rules**:
  - 1–64 chars
  - lowercase alphanumeric with single hyphen separators
  - no leading/trailing hyphen, no `--`
  - must match the directory name exactly
- **Description rules**: 1–1024 chars, specific enough for the agent to choose correctly.

## Required Frontmatter Syntax

Every skill must begin with valid YAML frontmatter:

```yaml
---
name: my-skill-name
description: "A clear, specific description of what this skill does"
---
```

### Critical: Quote Description Values

**ALWAYS quote the description field.** If the description contains a colon (`:`), unquoted YAML will fail to parse. This is the most common skill loading error.

```yaml
# GOOD - quoted description
---
name: my-skill
description: "Skill: My Skill Description"
---

# BAD - unquoted description (will fail to load)
---
name: my-skill
description: Skill: My Skill Description
---
```

### Frontmatter Example

```yaml
---
name: my-new-skill
description: "Create or modify widgets with proper validation and error handling"
license: MIT
compatibility:
  - opencode >=1.0.0
metadata:
  author: Developer
  version: 1
---
```

### Common Frontmatter Mistakes

| Mistake | Why It Fails | Fix |
|---------|--------------|-----|
| Unquoted `description: Skill: X` | Colon creates YAML mapping | Wrap in quotes: `"Skill: X"` |
| Wrong field names | Fields not recognized | Use only: name, description, license, compatibility, metadata |
| Name doesn't match folder | Discovery fails | Ensure directory and `name` field match exactly |
| Description too generic | Agent can't choose correctly | Be specific about what the skill does |
- **Discovery**: For project-local paths, OpenCode walks up from the current working directory to the git worktree and loads matching skills along the way.

## Steps
1. Review `.opencode/skill/skill-authoring/SKILL.md` for the standard template.
2. Pick a valid skill name (kebab-case) and folder name.
3. Create the canonical skill at `~/.agents/skills/<name>/SKILL.md` so Codex can load it.
4. Ensure `SKILL.md` starts with OpenCode-compatible frontmatter.
5. Create a project-local link for OpenCode:
   - `mkdir -p .opencode/skill/<name>`
   - `ln -s ~/.agents/skills/<name>/SKILL.md .opencode/skill/<name>/SKILL.md`
6. Write clear **Goal**, **Use This Skill When**, and **Do Not Use This Skill When** gates.
7. Define **Inputs**, **Steps**, **Output**, and **References**.
8. Cross-link related skills instead of duplicating content.
9. Update `AGENTS.md` to reference the new skill.

## Output
- A new skill folder under `~/.agents/skills/<name>/SKILL.md`.
- A project-local OpenCode-visible link at `.opencode/skill/<name>/SKILL.md`.
- Updated `AGENTS.md` entries referencing the new skill.

## References
- Skill authoring template: `.opencode/skill/skill-authoring/SKILL.md`
- Skill index guidance: `AGENTS.md`

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[skill-authoring](../skill-authoring/SKILL.md)**
