---
name: opencode-model-variant-management
description: "Add new models, providers, or model variants with correct configuration, authentication, and validation"
---

# Skill: OpenCode Model Variant Management

## Goal
Add new models, providers, or model variants with correct configuration, auth, and validation.

## Use This Skill When
- You add a new model provider to OpenCode.
- You introduce new model variants or routing rules.
- The request mentions provider integration or model selection changes.

## Do Not Use This Skill When
- The change is unrelated to model/provider configuration.
- You only need to update usage examples without changing config.

## Inputs
- Provider docs and supported models.
- Required environment variables and auth configuration.
- OpenCode model/provider configuration files.

## Steps
1. Review the provider's official API and model compatibility.
2. Update OpenCode provider configuration and validation rules.
3. Add or update model variants with correct metadata.
4. Verify auth, rate limits, and fallback behavior.
5. Update docs or examples for the new model/provider.

## Output
- Updated provider and model variant configuration.
- Verified model selection and auth behavior.
- Documentation describing the new model/provider.

## References
- Model/provider guidance: `.opencode/skills/opencode-models-providers.md`
- OpenCode models docs: https://opencode.ai/docs/models/
- OpenCode providers docs: https://opencode.ai/docs/providers/

## Suggested Next Skills
Check the [Skill Graph](../skill_graph.json) for the full workflow.

- **[opencode-models-providers](../opencode-models-providers/SKILL.md)**
