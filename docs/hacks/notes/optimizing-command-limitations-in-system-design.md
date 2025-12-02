---
```
uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
```
```
created_at: 2025.08.22.12.08.59.md
```
filename: Optimizing Command Limitations in System Design
```
description: >-
```
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
```
related_to_title:
```
  - Promethean-Copilot-Intent-Engine
  - Obsidian Templating Plugins Integration Guide
  - mystery-lisp-search-session
  - Promethean State Format
  - AI-Centric OS with MCP Layer
  - AI-First-OS-Model-Context-Protocol
  - balanced-bst
```
related_to_uuid:
```
  - ae24a280-678e-4c0b-8cc4-56667fa04172
  - b39dc9d4-63e2-42d4-bbcd-041ef3167bca
  - 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
  - 23df6ddb-05cf-4639-8201-f8291f8a6026
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 618198f4-cfad-4677-9df6-0640d8a97bae
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
references:
  - uuid: 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
    line: 120
    col: 1
    score: 1
  - uuid: 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
    line: 120
    col: 3
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 91
    col: 1
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 91
    col: 3
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 84
    col: 1
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 84
    col: 3
    score: 1
  - uuid: 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
    line: 125
    col: 1
    score: 0.93
  - uuid: 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
    line: 125
    col: 3
    score: 0.93
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 406
    col: 1
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 406
    col: 3
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 1
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 3
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 14
    col: 1
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 14
    col: 3
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 297
    col: 1
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 297
    col: 3
    score: 1
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
Document Object Model.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [promethean-copilot-intent-engine]
- [obsidian-templating-plugins-integration-guide|Obsidian Templating Plugins Integration Guide]
- [mystery-lisp-search-session]
- [docs/unique/promethean-state-format|Promethean State Format]
- [ai-centric-os-with-mcp-layer|AI-Centric OS with MCP Layer]
- [ai-first-os-model-context-protocol]
- [balanced-bst]

## Sources
- [mystery-lisp-search-session#L120|mystery-lisp-search-session — L120] (line 120, col 1, score 1)
- [mystery-lisp-search-session#L120|mystery-lisp-search-session — L120] (line 120, col 3, score 1)
- [obsidian-templating-plugins-integration-guide#L91|Obsidian Templating Plugins Integration Guide — L91] (line 91, col 1, score 1)
- [obsidian-templating-plugins-integration-guide#L91|Obsidian Templating Plugins Integration Guide — L91] (line 91, col 3, score 1)
- [docs/unique/promethean-state-format#L84|Promethean State Format — L84] (line 84, col 1, score 1)
- [docs/unique/promethean-state-format#L84|Promethean State Format — L84] (line 84, col 3, score 1)
- [mystery-lisp-search-session#L125|mystery-lisp-search-session — L125] (line 125, col 1, score 0.93)
- [mystery-lisp-search-session#L125|mystery-lisp-search-session — L125] (line 125, col 3, score 0.93)
- [ai-centric-os-with-mcp-layer#L406|AI-Centric OS with MCP Layer — L406] (line 406, col 1, score 1)
- [ai-centric-os-with-mcp-layer#L406|AI-Centric OS with MCP Layer — L406] (line 406, col 3, score 1)
- [ai-first-os-model-context-protocol#L11|AI-First-OS-Model-Context-Protocol — L11] (line 11, col 1, score 1)
- [ai-first-os-model-context-protocol#L11|AI-First-OS-Model-Context-Protocol — L11] (line 11, col 3, score 1)
- [ai-first-os-model-context-protocol#L14|AI-First-OS-Model-Context-Protocol — L14] (line 14, col 1, score 1)
- [ai-first-os-model-context-protocol#L14|AI-First-OS-Model-Context-Protocol — L14] (line 14, col 3, score 1)
- [balanced-bst#L297|balanced-bst — L297] (line 297, col 1, score 1)
- [balanced-bst#L297|balanced-bst — L297] (line 297, col 3, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
