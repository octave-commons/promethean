# Spec: Pantheon doc unification and agent-language framing

## Context

- Goal: unify Pantheon docs around the idea of Pantheon as a language/runtime for defining agents (analogous to elisp for editors) and document OpenCode-compatible agent config examples.
- Source docs reviewed:
  - docs/design/pantheon/agent-os-architecture.md (architecture framing of agent OS)
  - docs/design/pantheon/agent-instance-model.md (instance lifecycle and capabilities)
  - docs/packages/pantheon/README.md (hub; quick start & package map; lines ~1-472)
  - docs/packages/pantheon/package-overview.md (ecosystem overview; lines ~1-487)

## Target changes

- docs/packages/pantheon/README.md: top-level framing to explicitly call Pantheon a DSL/runtime for agents; add OpenCode-compatible `(ask ...)` examples showing harness opencode vs openai with :OPENAI_COMPATABLE_API; clarify roles vs capabilities; add minimal runnable example wiring orchestrator with concrete adapters.
- docs/packages/pantheon/package-overview.md: align intro to “agent language/runtime”; note interoperability and point to README section.

## Definition of Done

- README and package-overview both describe Pantheon as a language/runtime for defining agents (elisp analogy) and maintain consistent messaging with existing architecture claims.
- README contains an OpenCode harness example for both `:harness 'opencode` and `:harness 'openai` with :OPENAI_COMPATABLE_API set, matching the desired config shape.
- README provides a succinct runnable snippet wiring the orchestrator with concrete adapters (no TODO placeholders) and clarifies role terminology.
- No broken wikilinks or removed context; overall docs remain traversable.

## Existing issues / PRs

- None reviewed for this work item.

## Risks / Notes

- Keep edits concise to avoid duplicating package-overview content.
- Preserve existing install instructions and tables; add interoperability content without breaking Obsidian wikilinks.
