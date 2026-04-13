---
name: opencode-sdk
description: "Implement or regenerate OpenCode SDKs safely after server or API changes"
---

# Skill: OpenCode SDK Workflows

## Goal
Implement or regenerate OpenCode SDKs safely after server or API changes.

## Use This Skill When
- You touch API endpoints or server contracts in OpenCode.
- You need to modify SDKs under `packages/sdk/*`.

## Do Not Use This Skill When
- The change is unrelated to API surface or SDK generation.

## Inputs
- OpenCode server changes and affected endpoints.
- Existing SDK folders under `orgs/sst/opencode/packages/sdk/*`.

## Steps
1. Identify whether changes touch `packages/opencode/src/server/server.ts`.
2. If server contracts changed, regenerate SDKs per `orgs/sst/opencode/CONTRIBUTING.md`.
3. Validate SDK docs/examples against the OpenCode SDK docs.

## Output
- Updated SDK artifacts and any necessary documentation adjustments.

## References
- OpenCode SDK docs: https://opencode.ai/docs/sdk/
- OpenCode server docs: https://opencode.ai/docs/server/
- OpenCode contributing notes: https://github.com/sst/opencode/blob/dev/CONTRIBUTING.md
- Go SDK reference: https://pkg.go.dev/github.com/sst/opencode-sdk-go
