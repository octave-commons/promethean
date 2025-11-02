# Pantheon Migration Plan

## Package Migration Mapping

| Agent Package                      | Target Pantheon Package              | Priority | Dependencies               |
| ---------------------------------- | ------------------------------------ | -------- | -------------------------- |
| @promethean-os/agent-ecs           | @promethean-os/pantheon-ecs          | HIGH     | MongoDB, ChromaDB, Express |
| @promethean-os/agent-state         | @promethean-os/pantheon-state        | HIGH     | LevelDB, JWT libraries     |
| @promethean-os/agent-protocol      | @promethean-os/pantheon-protocol     | HIGH     | agent-state, amqplib, ws   |
| @promethean-os/agents-workflow     | @promethean-os/pantheon-workflow     | MEDIUM   | OpenAI agents, ollama      |
| @promethean-os/agent-coordination  | @promethean-os/pantheon-coordination | LOW      | Type definitions only      |
| @promethean-os/agent-generator     | @promethean-os/pantheon-generator    | MEDIUM   | ClojureScript, Shadow-CLJS |
| @promethean-os/agent-orchestrator  | @promethean-os/pantheon-orchestrator | MEDIUM   | Core orchestration logic   |
| @promethean-os/agent-management-ui | @promethean-os/pantheon-ui           | LOW      | UI components              |
| @promethean-os/agent-os-protocol   | @promethean-os/pantheon-protocol     | LOW      | Merge with agent-protocol  |
| @promethean-os/agent               | DEPRECATED                           | -        | Minimal functionality      |

## Migration Phases

### Phase 1: High Priority (Core Infrastructure)

- pantheon-ecs
- pantheon-state
- pantheon-protocol

### Phase 2: Medium Priority (Workflow & Tools)

- pantheon-workflow
- pantheon-generator
- pantheon-orchestrator

### Phase 3: Low Priority (Coordination & UI)

- pantheon-coordination
- pantheon-ui

## Implementation Steps

1. **Create new package directories**
2. **Copy source code with updated imports**
3. **Update package.json files**
4. **Create compatibility layers**
5. **Update dependent packages**
6. **Update documentation**
7. **Run comprehensive tests**
8. **Deprecate old packages**

## Backward Compatibility Strategy

During transition period:

- Keep old packages as compatibility shims
- Export new Pantheon packages from old package locations
- Add deprecation warnings
- Provide migration guide

## Files to Update

### Root Dependencies

- `/home/err/devel/promethean/package.json`

### Dependent Packages

- `/home/err/devel/promethean/packages/kanban/package.json`
- `/home/err/devel/promethean/packages/cephalon/package.json`
- `/home/err/devel/promethean/packages/discord/package.json`
- `/home/err/devel/promethean/packages/ai/nl-parser/package.json`
- `/home/err/devel/promethean/packages/mcp-kanban-bridge/package.json`
- `/home/err/devel/promethean/packages/enso/enso-agent-communication/package.json`
- `/home/err/devel/promethean/packages/docs-system/package.json`

### Source Code Imports

- `/home/err/devel/promethean/packages/cephalon/src/bot.ts`
- `/home/err/devel/promethean/packages/cephalon/src/actions/*.ts`
- `/home/err/devel/promethean/packages/kanban/src/lib/testing-transition/ai-analyzer.ts`

### Documentation

- `/home/err/devel/promethean/packages/agents/README.md`
- All package README files
- API documentation
- Integration guides
