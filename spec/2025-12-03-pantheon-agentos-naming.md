# Pantheon naming unification (Pantheon == Agent OS)

## Context

Pantheon documentation still refers to "Agent OS" as if distinct. We need to clarify that Pantheon is the only name and remove the split terminology.

## Relevant files (with line anchors)

- docs/design/pantheon/agent-os-architecture.md:1-3 (title/overview)
- docs/design/pantheon/agent-instance-model.md:1-6,51-66 (model framing and status note)
- docs/design/pantheon/agent-os-security.md:1-4,1474 (title/closing copy)
- docs/design/pantheon/agent-os-api-specs.md:1-3 (title/intro)
- docs/design/pantheon/agent-os-monitoring.md:1-4, metrics sections (title/intro)
- docs/dev/packages/pantheon/README.md:1-40 (hub overview and disclaimers)

## Existing issues / PRs

- None noted in repo; no linked issues/PRs referenced in the touched docs.

## Requirements

- Present Pantheon as the single product name; explicitly note it was previously called Agent OS.
- Remove/replace copy that implies a distinct Agent OS vs Pantheon split.
- Keep links and structure intact; avoid breaking doc references.

## Definition of Done

- Targeted docs use Pantheon as the canonical name and include a one-time clarification that Agent OS was the prior name.
- No remaining sentences in the touched sections imply Pantheon and Agent OS are different.
- Docs render without broken Markdown structure.
