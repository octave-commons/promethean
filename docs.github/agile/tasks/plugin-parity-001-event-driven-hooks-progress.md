---
uuid: 'progress-plugin-hooks-001'
title: 'Progress Update: Event-Driven Plugin Hooks'
slug: 'progress-plugin-hooks-001'
status: 'in_progress'
priority: 'P0'
labels: ['progress', 'kanban', 'plugin-hooks']
created_at: '2025-10-25T13:15:00Z'
---

Progress update: Event-Driven Plugin Hooks.

What’s done:

- Drafted hook system requirements and file names from the design doc
- Identified hooks: before/after, registration, and context passing

Next steps:

- Implement EventHooks and ToolExecuteHookManager scaffolds (ts files)
- Implement helper types and plugin-hooks.ts (interfaces)
- Wire in tests and patch opencode-client index.ts exports
- Add basic unit tests and a minimal example hook
