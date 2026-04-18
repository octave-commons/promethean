---
name: mcp-server-integration
description: "Add and configure Model Context Protocol (MCP) servers with correct protocol compliance and tool registration"
---

# Skill: MCP Server Integration

## Goal
Add and configure Model Context Protocol (MCP) servers with correct protocol compliance and tool registration.

## Use This Skill When
- You add a new MCP server to the workspace.
- You configure MCP server connections or authentication.
- The request mentions MCP tools or MCP server integration.

## Do Not Use This Skill When
- The change is unrelated to MCP or tool calling.
- You only need to modify an existing MCP server implementation.

## Inputs
- MCP server details and capabilities.
- Connection configuration and authentication.
- Tool definitions to expose via MCP.

## Steps
1. Review MCP protocol requirements and server capabilities.
2. Configure server connection and authentication settings.
3. Register MCP tools with OpenCode tool configuration.
4. Validate server responses and tool execution paths.
5. Update docs or examples for the new MCP server.

## Output
- Configured MCP server connection.
- Registered MCP tools and verified behavior.
- Documentation updates describing the integration.

## References
- MCP guidance: `.opencode/skills/opencode-tools-mcp.md`
- MCP docs: https://modelcontextprotocol.io/docs
- OpenCode MCP docs: https://opencode.ai/docs/mcp-servers/

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[opencode-tools-mcp](../opencode-tools-mcp/SKILL.md)**
