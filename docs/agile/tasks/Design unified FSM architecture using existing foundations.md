---
uuid: "8b1add71-be76-4a34-8f24-b3f0eaac69d5"
title: "Design unified FSM architecture using existing foundations"
slug: "Design unified FSM architecture using existing foundations"
status: "document"
priority: "P0"
labels: ["fsm", "packages", "design", "architecture", "tool:analysis", "env:no-egress"]
created_at: "2025-10-13T16:26:36.572Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
lastCommitSha: "deec21fe4553bb49020b6aa2bdfee1b89110f15d"
commitHistory: 
  - sha: "deec21fe4553bb49020b6aa2bdfee1b89110f15d"
    timestamp: "2025-10-19T16:27:40.277Z"
    action: "Bulk commit tracking initialization"
---

Based on the comprehensive FSM codebase analysis, design a unified architecture that leverages @packages/ds/graph.ts as the foundation and extends @packages/fsm for generic transition condition enforcement across multiple systems (agents-workflow, piper, kanban).\n\n## Key Requirements:\n1. **Foundation**: Use existing @packages/ds/src/graph.ts (367 lines, comprehensive but unused)\n2. **Core Engine**: Extend @packages/fsm rather than replace - maintain backward compatibility\n3. **Integration**: Create adapters for agents-workflow, piper, and kanban systems\n4. **Generic Design**: Template method pattern for FSM engine with pluggable components\n5. **Performance**: Lazy loading, condition caching, efficient graph traversal\n\n## Architecture Layers:\n\n\n## Analysis Findings:\n- 4 different graph approaches for the same problem\n- Each system has domain-specific optimizations worth preserving\n- Need unified transition condition enforcement\n- Visual design capabilities via Mermaid-to-FSM generator\n\n## Implementation Plan:\n### Phase 1: Core Foundation\n- FSMGraph class extending Graph with state/transition interfaces\n- TransitionCondition system with schema validation\n- GenericFSM engine with middleware support\n\n### Phase 2: Integration\n- Agents-workflow adapter for agent execution pipelines\n- Piper adapter for step-based execution with dependencies\n- Backward compatibility layer for existing FSM implementations\n\n### Phase 3: Advanced Features\n- Hierarchical state support\n- Performance optimizations (caching, lazy loading)\n- Visual design tools and Mermaid integration\n\n## Deliverables:\n- Enhanced @packages/ds/graph.ts with FSM-specific operations\n- Extended @packages/fsm with generic engine capabilities\n- Integration adapters for existing systems\n- Comprehensive test suite and documentation
