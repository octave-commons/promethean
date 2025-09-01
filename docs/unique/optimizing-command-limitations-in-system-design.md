---
uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
created_at: 2025.08.22.12.08.59.md
filename: Optimizing Command Limitations in System Design
description: >-
  Addressing command limits by consolidating actions, reducing endpoint counts,
  and strategically splitting services to manage complexity without exceeding 30
  commands. Highlights the need for domain-specific services only when
  consolidation becomes infeasible.
tags:
  - command
  - consolidation
  - endpoint
  - service
  - complexity
  - domain
  - ttl
  - agent
related_to_title:
  - Promethean-Copilot-Intent-Engine
  - Obsidian Templating Plugins Integration Guide
  - mystery-lisp-search-session
  - Promethean State Format
  - AI-Centric OS with MCP Layer
  - AI-First-OS-Model-Context-Protocol
  - balanced-bst
related_to_uuid:
  - ae24a280-678e-4c0b-8cc4-56667fa04172
  - b39dc9d4-63e2-42d4-bbcd-041ef3167bca
  - 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
  - 23df6ddb-05cf-4639-8201-f8291f8a6026
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 618198f4-cfad-4677-9df6-0640d8a97bae
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
references: []
---
If my limit is 30 commands I am gonna need to:
A. Consolodate existing actions into others with additional parameters
B. Limit the number of actions 
C. Split the actions up into multiple services


We can do A and B right now through descriptions to the agents.
C will require us to find multiple domains to put different parts of the system behind.
That is not automatable, and it means *even more services*
Complexity is already very high.

I am confident we can get our current endpoints down below 30. We only start splitting up the actions into multiple services/domains when it becomes impossible or unreasonable to consolidate them.

I think we can get better codex context thinking about it if all searches have a ttl on them...
It's gotta be more complicated than that though...
you need a special agent who's job it is to ...

knowledge graph...


markdown parser...

markdown AST


markdown dom...
markdown is designed to compile to html...
html has the dom... the dom allows a system to be mutated and changed...
Document Object Model.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Promethean State Format](promethean-state-format.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
