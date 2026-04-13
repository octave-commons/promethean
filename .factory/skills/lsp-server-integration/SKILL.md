---
name: lsp-server-integration
description: "Add and configure Language Server Protocol (LSP) servers to provide language intelligence in OpenCode"
---

# Skill: LSP Server Integration

## Goal
Add and configure Language Server Protocol (LSP) servers to provide language intelligence in OpenCode.

## Use This Skill When
- You add language support for a new file type.
- You configure or replace LSP servers for a language.
- The request mentions LSP, language servers, or language intelligence.

## Do Not Use This Skill When
- The task does not involve LSP or language intelligence.
- You only need editor configuration unrelated to OpenCode.

## Inputs
- Target language and file extensions.
- LSP server package or executable.
- Server initialization options and capabilities.

## Steps
1. Identify the target language and required LSP features.
2. Install or reference the correct LSP server.
3. Configure server initialization options and workspace root detection.
4. Register the server in OpenCode LSP configuration.
5. Validate diagnostics, completion, and hover features.

## Output
- Configured LSP server entry.
- Verified language intelligence behavior.
- Updated documentation for the added language support.

## References
- LSP protocol: https://microsoft.github.io/language-server-protocol/
- OpenCode configuration guidance: `.opencode/skills/opencode-configs.md`

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[opencode-configs](../opencode-configs/SKILL.md)**
