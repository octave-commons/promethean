---
uuid: 'plugin-parity-002'
title: 'Multi-Language Type-Checking Plugin'
slug: 'plugin-parity-002-multi-language-type-checker'
status: 'todo'
priority: 'P0'
labels: ['plugin', 'type-checking', 'multi-language', 'typescript', 'clojure', 'critical']
created_at: '2025-10-18T00:00:00.000Z'
estimates:
  complexity: 'high'
  scale: 'medium'
  time_to_completion: '1-2 weeks'
story_points: 6
---

## Context

Port and enhance the type-checker plugin to support TypeScript, Clojure, Babashka, and other languages with configurable checkers and real-time feedback.

## Key Requirements

- Support TypeScript, JavaScript, Clojure, Babashka checking
- Configurable language patterns and checker commands
- Real-time error detection and reporting
- Integration with event hooks for automatic checking
- Support for custom language configurations
- Performance optimization with caching
- Comprehensive error reporting with metadata

## Files to Create/Modify

- `packages/opencode-client/src/plugins/type-checker.ts` (new)
- `packages/opencode-client/src/actions/type-checker/` (new directory)
- `packages/opencode-client/src/factories/type-checker-factory.ts` (new)
- `packages/opencode-client/src/types/language-config.ts` (new)

## Acceptance Criteria

- [ ] All target languages supported with proper error detection
- [ ] Configurable checker commands and patterns
- [ ] Real-time checking triggered by file operations
- [ ] Integration with hook system for automatic execution
- [ ] Custom language configurations supported
- [ ] Performance optimized with result caching
- [ ] Rich error reporting with file context and metadata

## Dependencies

- plugin-parity-001-event-driven-hooks

## Notes

This plugin will automatically run type checking after file write operations using the hook system.
