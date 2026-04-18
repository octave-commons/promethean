---
name: opencode-plugins
description: "Build or modify OpenCode plugins with correct packaging and runtime behavior"
---

# Skill: OpenCode Plugins

## Goal
Build or modify OpenCode plugins with correct packaging and runtime behavior.

## Use This Skill When
- You change code under `orgs/sst/opencode/packages/plugin`.
- You are asked to create or update a plugin.

## Do Not Use This Skill When
- The change is purely in core OpenCode server or UI.

## Inputs
- Plugin source and expected tool surface.
- OpenCode plugin documentation.

## Steps
1. Confirm the plugin scope and runtime contract from docs.
2. Update `packages/plugin` implementation and tests as needed.
3. Cross-check behavior against the published plugin docs.

## Output
- Updated plugin code and any required documentation.

## References
- OpenCode plugins docs: https://opencode.ai/docs/plugins/
- OpenCode custom tools docs: https://opencode.ai/docs/custom-tools/
- @opencode-ai/plugin package: https://www.npmjs.com/package/@opencode-ai/plugin
