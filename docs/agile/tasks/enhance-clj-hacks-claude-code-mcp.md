---
title: Enhance clj-hacks for Claude Code MCP server configs
$$
uuid: 5386dc78-da5b-4dfa-bef3-f82094c4c58a
$$
$$
created: 2025-10-06T20:06:54-05:00
$$
status: backlog
priority: P2
owner:
labels:
  - clj-hacks
  - mcp
  - claude-code
  - tooling
epic:
---

## Context
- **What changed?**: Need to extend clj-hacks MCP configuration management to fully support Claude Code MCP server specifications beyond the basic JSON schema.
- **Where?**: `packages/clj-hacks`, MCP adapters, validation logic
- **Why now?**: Claude Code MCP adoption requires proper configuration management with validation and templates.

## Description
The existing clj-hacks MCP infrastructure handles basic JSON configuration but lacks Claude Code-specific enhancements needed for full MCP server management.

## Goals
- Extend MCP schema with Claude Code specific metadata fields
- Add Claude Code configuration location awareness
- Implement Claude Code specific validation rules
- Provide template generators for common Claude Code MCP servers

## Requirements
- [ ] Enhanced schema supports Claude Code specific fields (cwd, env, timeout, capabilities, version, description)
- [ ] Claude Code adapter handles Claude Code's specific configuration format and requirements
- [ ] Configuration location awareness for Claude Code config paths
- [ ] Claude Code specific validation rules and error reporting
- [ ] Template generators for common Claude Code MCP server types
- [ ] Tests cover new Claude Code specific functionality
- [ ] Documentation updated with Claude Code MCP configuration examples

## Plan
1. Analyze Claude Code MCP configuration requirements and schema differences
2. Extend clj-hacks MCP schema with Claude Code specific fields
3. Create or enhance JSON adapter for Claude Code specific handling
4. Add Claude Code configuration path resolution
5. Implement Claude Code specific validation logic
6. Create template generators for common Claude Code MCP servers
7. Add comprehensive tests and documentation

## Definition of Done
- [ ] Claude Code MCP servers can be configured with full metadata support
- [ ] Configuration validation catches Claude Code specific issues
- [ ] Templates available for common Claude Code MCP server types
- [ ] Tests validate Claude Code configuration management
- [ ] Documentation includes Claude Code MCP setup examples

## Relevant Resources
- `packages/clj-hacks/src/clj_hacks/mcp/`
- `config/mcp_servers.edn`
- `promethean.mcp.json`
- Claude Code MCP documentation