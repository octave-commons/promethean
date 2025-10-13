---
uuid: "6866f097-f4c8-485a-8c1d-78de260459d2"
title: "Implement LLM-powered kanban explain command"
slug: "Implement LLM-powered kanban explain command"
status: "incoming"
priority: "P1"
labels: ["llm", "explain", "command", "kanban"]
created_at: "2025-10-13T08:29:44.485Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---
















## Task: Implement LLM-powered kanban explain command\n\n### Description\nCreate a kanban explain command that uses an LLM to answer natural language questions about the board process, explain errors, transition failures, and provide remediation guidance.\n\n### Requirements\n1. Create new CLI command explain that accepts natural language queries\n2. Integrate with @promethean/llm package for LLM functionality\n3. Context gathering for board state:\n   - Current task status and position\n   - FSM transition rules and constraints\n   - Recent operations and errors\n   - Process documentation and rules\n   - Task history and audit trail\n\n4. Query types to support:\n   - Why can't I move task X to status Y?\n   - What does this error mean?\n   - How do I fix this transition failure?\n   - Explain the current process rules\n   - Why is task blocked?\n   - What are the next valid steps?\n\n5. LLM integration features:\n   - Context-aware responses based on current board state\n   - Access to process documentation and FSM rules\n   - Error explanation with remediation steps\n   - Natural language interface for complex rules\n   - Citation of specific rules or documentation\n\n6. Implementation details:\n   - Command: pnpm kanban explain natural language query\n   - Optional task UUID: --task <uuid> for task-specific questions\n   - Include recent errors: --errors flag\n   - Verbose mode: --verbose for detailed explanations\n\n### Acceptance Criteria\n- kanban explain command implemented and working\n- Integration with @promethean/llm package\n- Context gathering from board state and process rules\n- Natural language query processing\n- Error explanation and remediation guidance\n- Integration tests with mock LLM responses\n- Documentation with example queries\n\n### Dependencies\n- Replace mock LLM integration with real @promethean/llm package\n- Kanban FSM rules and process documentation\n\n### Priority\nP1 - Important for user experience and debugging

## ⛓️ Blocked By

Nothing



## ⛓️ Blocks

Nothing















