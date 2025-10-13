---
uuid: "ecee2a47-d4dc-42da-95db-eb1359d00425"
title: "Create Mermaid-to-FSM config generator for kanban workflows"
slug: "Create Mermaid-to-FSM config generator for kanban workflows"
status: "incoming"
priority: "P1"
labels: ["mermaid", "fsm", "kanban", "create"]
created_at: "2025-10-13T08:43:22.410Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## Task: Create Mermaid-to-FSM config generator for kanban workflows\n\n### Description\nBuild a tool that converts Mermaid state diagram definitions into finite state machine configuration files for kanban workflow rules, enabling visual workflow design.\n\n### Requirements\n1. Create CLI command for Mermaid-to-FSM conversion:\n   - Command: pnpm kanban generate-fsm --input diagram.mmd --output fsm-config.json\n   - Support both file input and direct Mermaid string input\n   - Validate Mermaid syntax before conversion\n\n2. Mermaid state diagram parsing:\n   - Parse Mermaid stateDiagram syntax\n   - Extract states, transitions, and conditions\n   - Handle state descriptions and metadata\n   - Support nested states and parallel states\n   - Parse transition labels and conditions\n\n3. FSM configuration generation:\n   - Generate kanban-compatible FSM configuration\n   - Map Mermaid states to kanban columns\n   - Convert transitions to kanban rules\n   - Include transition conditions and validations\n   - Generate proper JSON schema for FSM config\n\n4. Advanced features:\n   - Support for Mermaid state descriptions as column descriptions\n   - Transition conditions as FSM guards\n   - State styling as kanban column properties\n   - Comments and documentation preservation\n   - Validation of generated FSM against kanban schema\n\n5. Integration with kanban system:\n   - Auto-load generated FSM into kanban config\n   - Support for hot-reloading of FSM changes\n   - Validation against existing kanban setup\n   - Migration tools for existing workflows\n\n### Implementation Details\n- Parser: Use mermaid-parser or build custom parser\n- Output: JSON format matching kanban FSM schema\n- Validation: Schema validation for generated configs\n- Error handling: Clear error messages for invalid Mermaid\n\n### Acceptance Criteria\n- CLI command successfully converts Mermaid to FSM config\n- Generated configs work with kanban system\n- Support for common Mermaid state diagram features\n- Proper error handling and validation\n- Integration tests with sample Mermaid diagrams\n- Documentation with examples and best practices\n\n### Dependencies\n- Kanban FSM configuration system\n- Mermaid diagram parsing library\n\n### Priority\nP1 - Important for workflow design and usability

## ⛓️ Blocked By

Nothing



## ⛓️ Blocks

Nothing




