# @promethean/openai-server Project Overview

## Purpose
A Fastify-based web server that exposes an OpenAI-compatible chat completions API with queue-backed processing, observability features, and Ollama integration.

## Tech Stack
- **Framework**: Fastify (Node.js/TypeScript)
- **Language**: TypeScript with strict mode
- **Testing**: AVA test framework
- **Build**: TypeScript compiler with composite project setup
- **Documentation**: OpenAPI/Swagger with auto-generated docs
- **Static Assets**: @fastify/static for web UI

## Code Style & Conventions
- **Type Safety**: Strict TypeScript with deep readonly types
- **Functional**: Immutable data structures, functional patterns
- **Module System**: ESM with explicit .js extensions in imports
- **File Organization**: Modular structure (openai/, queue/, server/)
- **Naming**: camelCase for variables, PascalCase for types/interfaces
- **Documentation**: JSDoc comments, comprehensive type definitions
- **Error Handling**: Proper error types and validation schemas

## Development Commands
- `pnpm run build` - Clean and compile TypeScript to dist/
- `pnpm run test` - Build then run AVA tests
- `pnpm run lint` - Run ESLint on the package
- `pnpm run typecheck` - Type checking without emitting files
- `pnpm run clean` - Remove dist/ and build artifacts

## Codebase Structure
```
src/
├── openai/           # OpenAI API types and handlers
│   ├── types.ts      # Core OpenAI type definitions
│   ├── defaultHandler.ts  # Default chat completion handler
│   └── ollamaHandler.ts   # Ollama integration handler
├── queue/            # Task queue implementation
│   ├── taskQueue.ts  # Core queue logic
│   ├── types.ts      # Queue type definitions
│   └── state.ts      # Queue state management
├── server/           # Fastify server setup and routes
│   ├── createServer.ts    # Main server factory
│   ├── chatCompletionRoute.ts  # OpenAI-compatible endpoint
│   ├── queueRoutes.ts      # Queue monitoring endpoints
│   └── fastifyTypes.ts     # Fastify type extensions
├── types/            # Shared utility types
│   └── deepReadonly.ts     # Deep readonly utility
└── tests/            # Test files
```

## Entry Points
- Main export: `src/index.ts` - Public API surface
- Server factory: `createOpenAICompliantServer()`
- Queue factory: `createTaskQueue()`
- Handler factories: `createDefaultChatCompletionHandler()`, `createOllamaChatCompletionHandler()`

## Security Context
Currently has **CRITICAL SECURITY VULNERABILITIES**:
- No authentication/authorization on API endpoints
- Missing rate limiting (DoS vulnerability)
- Insufficient input validation
- No security headers or CORS configuration

## Testing Strategy
- Unit tests for core functionality (queue, handlers)
- Integration tests for API endpoints
- Test files follow naming pattern: `*.test.ts`
- Tests located in `src/tests/` directory