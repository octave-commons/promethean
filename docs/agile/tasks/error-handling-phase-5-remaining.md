---
uuid: 'error-handling-pantheon-001-phase-5'
title: 'Phase 5: Standardize Error Handling in Remaining Pantheon Packages'
slug: 'error-handling-phase-5-remaining'
status: 'ready'
priority: 'P1'
storyPoints: 5
lastCommitSha: 'pending'
labels: ['pantheon', 'error-handling', 'phase-5', 'integration']
created_at: '2025-10-26T18:50:00Z'
estimates:
  complexity: 'medium'
---

# Phase 5: Standardize Error Handling in Remaining Pantheon Packages

## Description

Complete error handling standardization across remaining pantheon packages including ECS, protocol, orchestrator, coordination, and LLM adapters. Ensure comprehensive error handling integration across the entire pantheon ecosystem.

## Current State Analysis

From code analysis:

- ❌ Remaining packages need error handling review and updates
- ❌ ECS system needs structured error handling for component and system failures
- ❌ Protocol package needs transport and messaging error standardization
- ❌ Orchestrator needs coordination and agent management error handling
- ❌ LLM adapters need consistent error patterns

## Acceptance Criteria

### ECS Error Standardization

- [ ] Update ECS components and systems with structured errors
- [ ] Add proper error handling for world and bus operations
- [ ] Implement error context for system failures
- [ ] Add error recovery for component operations

### Protocol Error Enhancement

- [ ] Standardize transport layer errors (AMQP, WebSocket)
- [ ] Add structured errors for message handling
- [ ] Implement error context for protocol violations
- [ ] Add connection error recovery patterns

### Orchestrator Error Handling

- [ ] Update agent orchestrator with structured errors
- [ ] Add proper error handling for CLI operations
- [ ] Implement error context for coordination failures
- [ ] Add error recovery for agent lifecycle

### LLM Adapter Standardization

- [ ] Ensure consistent error handling across all LLM adapters
- [ ] Add structured errors for provider-specific failures
- [ ] Implement error context for model operations
- [ ] Add error recovery for transient failures

### Coordination Error Enhancement

- [ ] Update coordination types with structured errors
- [ ] Add proper error handling for task assignment
- [ ] Implement error context for integration failures
- [ ] Add error recovery for coordination operations

## Implementation Details

### ECS Error Patterns

```typescript
// Before
throw new Error('Component system failed');

// After
throw new ECSError(
  'Component system operation failed',
  'COMPONENT_SYSTEM_ERROR',
  ErrorCategory.INTERNAL,
  {
    operation: 'addComponent',
    componentType: component.type,
    entityId: entity.id,
    worldId: world.id,
  },
  error,
);
```

### Protocol Error Patterns

```typescript
// Before
throw new Error('WebSocket connection failed');

// After
throw new TransportError(
  'WebSocket transport connection failed',
  'WEBSOCKET_CONNECTION_FAILED',
  ErrorCategory.NETWORK,
  {
    operation: 'connect',
    url: this.url,
    protocol: this.protocol,
    connectionId: this.connectionId,
  },
  error,
);
```

### Orchestrator Error Patterns

```typescript
// Before
throw new Error('Agent orchestration failed');

// After
throw new OrchestrationError(
  'Agent orchestration operation failed',
  'AGENT_ORCHESTRATION_FAILED',
  ErrorCategory.INTERNAL,
  {
    operation: 'startAgent',
    agentId: agent.id,
    agentType: agent.type,
    orchestrationId: this.orchestrationId,
  },
  error,
);
```

## Files to Update

### ECS Package

- `packages/pantheon-ecs/src/world.ts`
- `packages/pantheon-ecs/src/bus.ts`
- `packages/pantheon-ecs/src/components.ts`
- `packages/pantheon-ecs/src/systems/*.ts`

### Protocol Package

- `packages/pantheon-protocol/src/amqp-transport.ts`
- `packages/pantheon-protocol/src/websocket-transport.ts`
- `packages/pantheon-protocol/src/envelope.ts`
- `packages/pantheon-protocol/src/adapters/protocol-adapter.ts`

### Orchestrator Package

- `packages/pantheon-orchestrator/src/agent-orchestrator.ts`
- `packages/pantheon-orchestrator/src/cli.ts`
- `packages/pantheon-orchestrator/src/types.ts`

### Coordination Package

- `packages/pantheon-coordination/src/types/*.ts`

### LLM Adapter Packages

- `packages/pantheon-llm-openai/src/index.ts`
- `packages/pantheon-llm-claude/src/index.ts`
- `packages/pantheon-llm-opencode/src/index.ts`

## Success Metrics

- All remaining pantheon packages use standardized error handling
- ECS system errors include component and system context
- Protocol errors include transport and messaging context
- Orchestrator errors include agent and coordination context
- LLM adapters have consistent error patterns across providers

## Dependencies

- Phase 1: Enhanced Core Error Framework completion
- Previous phases completion (persistence, workflow, state)
- Enhanced error types from `pantheon-core`

## Notes

This phase completes the error handling standardization across the entire pantheon ecosystem. Focus on ensuring consistency between packages and proper error propagation across package boundaries. Test integration scenarios thoroughly.
