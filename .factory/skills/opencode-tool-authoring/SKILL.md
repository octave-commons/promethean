---
name: opencode-tool-authoring
description: "Design and implement OpenCode tools with correct schemas, execution behavior, and documentation"
---

# Skill: OpenCode Tool Authoring

## Goal
Design and implement OpenCode tools with correct schemas, execution behavior, and documentation.

## Use This Skill When
- You add or modify tool definitions in OpenCode.
- You implement a new custom tool or update tool behavior.
- The task mentions tool schemas, tool execution, or tool registration.

## Do Not Use This Skill When
- The change is unrelated to tools or tool execution.
- You are only updating UI or unrelated server logic.

## Inputs
- Tool purpose and interface.
- Existing tool definitions and configuration.
- Related protocol constraints (MCP/ACP) if applicable.

## Tool Documentation Frontmatter

When creating documentation or skill files for tools, use valid YAML frontmatter:

```yaml
---
name: my-tool-name
description: "A clear, specific description of what this tool does"
---
```

### Critical: Quote Description Values

**ALWAYS quote the description field.** If the description contains a colon (`:`), unquoted YAML will fail to parse.

```yaml
# GOOD - quoted description
---
name: my-tool
description: "Tool: Execute commands with validation"
---

# BAD - unquoted description (will fail to load)
---
name: my-tool
description: Tool: Execute commands with validation
---
```

### Valid Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | kebab-case, matches directory name |
| `description` | Yes | 1-1024 chars, quoted if contains special chars |
| `license` | No | SPDX license identifier |
| `compatibility` | No | Version constraints |
| `metadata` | No | Additional key-value data |

## Steps
1. Review existing tool definitions and schemas.
2. Define the tool input/output schema and constraints.
3. Implement or update the tool execution logic.
4. Validate tool registration and usage paths.
5. Update docs or examples describing the tool.

## Output
- Updated tool definition and execution behavior.
- Documentation or examples describing the tool surface.

## References
- Tools and MCP guidance: `.opencode/skills/opencode-tools-mcp.md`
- OpenCode tools docs: https://opencode.ai/docs/tools/
- OpenCode custom tools docs: https://opencode.ai/docs/custom-tools/

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[opencode-tools-mcp](../opencode-tools-mcp/SKILL.md)**
