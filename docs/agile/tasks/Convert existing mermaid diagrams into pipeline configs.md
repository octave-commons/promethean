---
uuid: "3646ad00-bf96-4744-96ec-ac60066cbedb"
title: "Convert existing Mermaid diagrams into pipeline configs"
slug: "Convert existing mermaid diagrams into pipeline configs"
status: "todo"
priority: "P4"
labels: ["tooling", "documentation"]
created_at: "2025-10-11T01:03:32.222Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


























## 🛠️ Task: Convert existing Mermaid diagrams into pipeline configs

### Context
- Several documents already contain Mermaid diagrams (e.g., orchestration flows in `promethean-pipelines.md`).
- Converting these diagrams into executable Piper configs will validate the proposed DSL/compiler approach.
- Establishing a repeatable conversion flow ensures diagrams and configs stay in sync.

### Definition of Done
- [ ] Inventory current Mermaid diagrams relevant to pipelines and classify their types (flowchart, timeline, etc.).
- [ ] For flowchart-style diagrams, demonstrate conversion into the proposed DSL and resulting `pipelines.json` fragments.
- [ ] Document the tooling/process required for future diagram-to-config conversions, including limitations.

### Suggested Plan
1. Use `rg` to locate Mermaid code blocks related to pipelines.
2. Prioritise diagrams that map directly to pipeline steps (e.g., scan → embed → cluster → plan → docs/tasks).
3. Apply the DSL/compiler prototype to generate config stubs and validate them with Piper.
4. Capture before/after diagrams and configs in documentation for traceability.

### References
- `docs/promethean-pipelines.md`
- README Gantt and flow diagrams
- Proposed Mermaid DSL compiler design
- `pipelines.json`

























