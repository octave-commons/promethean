# @promethean/agents-workflow Package Overview

## Purpose
The @promethean/agents-workflow package provides a comprehensive workflow management system for AI agents within the Promethean framework. It enables the definition, parsing, and execution of agent workflows through markdown documents with Mermaid diagram definitions and JSON configuration blocks.

## Core Functionality
- **Markdown Workflow Processing**: Parse markdown documents containing Mermaid workflow diagrams and JSON configuration blocks
- **Agent Definition Management**: Define and resolve agent configurations with model providers, tools, and instructions
- **Provider Integration**: Support for OpenAI and Ollama model providers with extensible provider architecture
- **Runtime Execution**: Create executable agent workflow graphs from parsed definitions
- **Mermaid Diagram Generation**: Parse and convert Mermaid flowchart definitions to structured workflow graphs

## Tech Stack
- **TypeScript**: Strict typing with comprehensive type definitions
- **Zod**: Schema validation for agent and tool definitions
- **@openai/agents**: Core agent framework integration
- **ollama**: Ollama provider integration
- **unified/remark-parse**: Markdown parsing and processing
- **AVA**: Test framework with comprehensive test coverage

## Package Structure
```
src/
├── workflow/
│   ├── types.ts          # Core type definitions and schemas
│   ├── markdown.ts       # Markdown parsing logic
│   ├── mermaid.ts        # Mermaid diagram parsing
│   └── loader.ts         # Workflow definition resolution
├── providers/
│   ├── openai.ts         # OpenAI provider integration
│   └── ollama.ts         # Ollama provider implementation
├── tests/
│   ├── markdown.test.ts  # Markdown processing tests
│   └── ollama-provider.test.ts  # Ollama provider tests
├── runtime.ts            # Main runtime orchestration
└── index.ts              # Public API exports
```

## Key Features
- **Multi-provider Support**: Extensible model provider architecture with built-in OpenAI and Ollama support
- **Flexible Configuration**: Support for inline definitions, file references, and JSON configuration blocks
- **Type Safety**: Comprehensive TypeScript types with Zod validation
- **Streaming Support**: Full streaming response support for real-time agent interactions
- **Tool Integration**: Dynamic tool resolution and registration
- **Error Handling**: Robust error handling with detailed error messages

## Integration Points
- Integrates with @openai/agents for core agent functionality
- Uses Promethean's shared configuration patterns
- Follows monorepo conventions with workspace dependencies
- Extensible provider architecture for additional model providers