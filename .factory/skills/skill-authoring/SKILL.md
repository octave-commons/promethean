---
name: skill-authoring
description: "Create or revise skills so they are reusable, scoped, and load correctly in OpenCode and Codex"
---

# Skill: Skill Authoring

## Goal
Create or revise repo skills so they are reusable, scoped, and load correctly in OpenCode and Codex.

## Use This Skill When
- A task repeats across issues or repos and needs a dedicated skill.
- You are asked to "create a skill" or "add guidance" for agent behavior.
- The workflow needs stronger guardrails or a consistent checklist.

## Do Not Use This Skill When
- The change is a one-off edit or quick fix.
- You only need to update a single file without new workflow guidance.

## Inputs
- The user request and target workflow context.
- Existing agent instructions (`AGENTS.md`) and any `.opencode/` docs.

## Required Output
1. A new or updated skill in `~/.agents/skills/<name>/SKILL.md` with YAML frontmatter.
2. A project-local OpenCode-visible link at `.opencode/skill/<name>/SKILL.md`.
3. A short update in `AGENTS.md` that tells when to use the new skill.

## OpenCode Compatibility Checklist
- `SKILL.md` begins with YAML frontmatter.
- `name` matches folder and matches `^[a-z0-9]+(-[a-z0-9]+)*$`.
- `description` is 1–1024 characters and specific.
- Frontmatter fields are only: `name`, `description`, `license`, `compatibility`, `metadata`.

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

### Frontmatter Fields

| Field | Required | Format |
|-------|----------|--------|
| `name` | Yes | kebab-case, 1-64 chars, matches directory name |
| `description` | Yes | 1-1024 chars, quoted if contains special chars |
| `license` | No | SPDX license identifier |
| `compatibility` | No | Compatibility info |
| `metadata` | No | Key-value metadata object |

### Example: Complete Valid Frontmatter

```yaml
---
name: my-new-skill
description: "Create or modify widgets with proper validation and error handling"
license: MIT
compatibility:
  - opencode >=1.0.0
  - claude
metadata:
  author: Your Name
  version: 1
---
```

## Strong Hints
- Prefer 1-2 pages of concise instructions; avoid essays.
- Include explicit "Use This Skill When" and "Do Not Use" gates.
- Keep steps actionable and testable; avoid vague advice.
- Avoid duplicating global rules; reference them instead.

## Suggested Template
```
# Skill: <Name>

## Goal
<single sentence>

## Use This Skill When
- <trigger>

## Do Not Use This Skill When
- <anti-trigger>

## Inputs
- <inputs>

## Steps
1. <step>

## Output
- <deliverable>
```
