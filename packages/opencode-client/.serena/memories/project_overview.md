# @promethean/opencode-client Project Overview

## Project Purpose
The `@promethean/opencode-client` package serves as the primary CLI client and unified agent management system for the Promethean Framework. It provides seamless integration with OpenCode plugins, tools, and services through a powerful command-line interface and programmatic API.

## Tech Stack
- **Language**: TypeScript with strict type checking
- **Build Tool**: TypeScript compiler (tsc)
- **Testing**: AVA test framework with coverage reporting via c8
- **Package Manager**: pnpm with workspace support
- **Dependencies**:
  - @opencode-ai/plugin: ^0.15.7
  - @opencode-ai/sdk: ^0.15.7
  - @promethean/ollama-queue: workspace:*
  - @promethean/persistence: workspace:*
  - Commander.js for CLI interface
  - Chalk for colored output
  - Inquirer for interactive prompts
  - Ora for spinners and progress indicators

## Code Style and Conventions
- **TypeScript**: Strict mode enabled, no implicit any types
- **ES Modules**: Using ES module syntax (import/export)
- **Functional Programming**: Preferred over object-oriented patterns
- **TDD**: Test-driven development is non-negotiable
- **Documentation**: Document-driven development with comprehensive JSDoc
- **Naming**: camelCase for variables/functions, PascalCase for types/interfaces
- **Type Hints**: Comprehensive type definitions to eliminate 'any' usage
- **Error Handling**: Robust error handling with proper TypeScript error types

## Project Structure
```
src/
├── api/                    # API abstraction layers
│   ├── UnifiedAgentManager.ts    # High-level agent management
│   ├── AgentTaskManager.ts       # Task management
│   ├── SessionUtils.ts          # Session utilities
│   ├── MessageProcessor.ts       # Message handling
│   ├── EventProcessor.ts        # Event processing
│   ├── InterAgentMessenger.ts   # Cross-agent messaging
│   └── sessions.ts             # Session API
├── tools/                  # Tool implementations
│   ├── ollama.ts             # Ollama integration tools
│   ├── Job.ts                # Job type definitions
│   ├── OllamaModel.ts        # Model type definitions
│   └── CacheEntry.ts         # Cache entry types
├── factories/              # Factory functions
│   ├── agent-management-factory.ts
│   ├── cache-factory.ts
│   ├── events-factory.ts
│   └── sessions-factory.ts
├── plugins/               # Plugin definitions
│   ├── agent-management.ts
│   ├── cache.ts
│   ├── events.ts
│   └── sessions.ts
├── types/                 # Comprehensive type definitions
│   └── index.ts           # Central type system
├── tests/                 # Test suites
├── cli.ts                 # Main CLI entry point
└── index.ts              # Main library entry point
```

## Key Commands
- `pnpm build` - Compile TypeScript to dist/
- `pnpm dev` - Watch mode for development
- `pnpm test` - Run all tests after build
- `pnpm test:unit` - Run unit tests
- `pnpm test:coverage` - Run tests with coverage
- `pnpm start` - Run the CLI interface

## Current Issues (Type Safety Crisis)
1. **AgentTaskManager.ts**: Import error - 'SessionClient' not exported from actions module
2. **types/index.ts**: Type 'DualStoreManager' is not generic - needs interface fix
3. **async-sub-agents.ts**: Type 'unknown' not assignable to 'Timestamp'
4. **EventProcessor.ts**: Extensive use of 'any' types (27 linting issues)
5. **ollama.ts**: Interface vs type usage conflicts and 'any' types (11 linting issues)
6. **cli.ts**: Import ordering warnings (4 warnings)

## Integration Points
- **@promethean/persistence**: Dual-store management for session and task persistence
- **@promethean/ollama-queue**: Advanced LLM job queue with intelligent caching
- **@promethean/kanban**: Task management and workflow integration
- **MCP Server**: Model Context Protocol integration for enhanced tool access

## Development Guidelines
1. **No relative imports** outside package root - use workspace:* dependencies
2. **Always run eslint** on edited files
3. **Prefer small, auditable changes** over grand rewrites
4. **Write tests** for new functionality
5. **Add changelog entries** in changelog.d/ directory
6. **Use kanban system** for task tracking and management