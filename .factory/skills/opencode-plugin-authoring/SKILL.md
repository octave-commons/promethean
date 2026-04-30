---
name: opencode-plugin-authoring
description: "Create or update OpenCode plugins with correct packaging, runtime behavior, and documentation"
---

# Skill: OpenCode Plugin Authoring

## Goal
Create or update OpenCode plugins with correct packaging, runtime behavior, and docs.

## Use This Skill When
- You are creating a new OpenCode plugin.
- You are modifying `orgs/sst/opencode/packages/plugin`.
- The task mentions plugin packaging, tooling, or plugin runtime.

## Do Not Use This Skill When
- The change is in core OpenCode server or UI only.
- You are not touching plugin code or docs.

## Inputs
- Plugin scope and intended tool surface.
- Existing plugin implementation under `orgs/sst/opencode/packages/plugin`.
- OpenCode plugin documentation.

## Steps
1. Confirm the plugin interface and runtime contract from docs.
2. Update or scaffold plugin code under `packages/plugin`.
3. Ensure tooling and packaging align with existing plugin structure.
4. Add or update tests and examples as needed.
5. Cross-check behavior with plugin docs.

## Output
- Updated plugin code and supporting docs.
- Tests or examples covering the new plugin behavior.

## References
- Plugin guidance: `.opencode/skills/opencode-plugins.md`
- OpenCode plugin docs: https://opencode.ai/docs/plugins/

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[opencode-plugins](../opencode-plugins/SKILL.md)**
