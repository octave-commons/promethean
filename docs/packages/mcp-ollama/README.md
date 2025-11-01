# MCP Ollama Package

Model Context Protocol (MCP) server for Ollama integration.

## Overview

The `@promethean-os/mcp-ollama` package provides MCP server functionality:

- Ollama model management
- MCP protocol implementation
- Model inference via MCP
- Resource management

## Features

- **MCP Server**: Full MCP protocol compliance
- **Ollama Integration**: Direct Ollama model access
- **Resource Management**: Model lifecycle management
- **Tool Support**: MCP tool integration

## Usage

```typescript
import { createMCPOllamaServer } from '@promethean-os/mcp-ollama';

const server = createMCPOllamaServer({
  ollamaUrl: 'http://localhost:11434',
  defaultModel: 'llama2',
  maxTokens: 4096,
  temperature: 0.7,
});

// Start MCP server
await server.start({
  port: 3000,
  transport: 'stdio', // or 'http'
});

// Use with MCP client
const response = await server.invokeTool('llm_complete', {
  prompt: 'Hello, world!',
  model: 'llama2',
});
```

## Configuration

```typescript
interface MCPOllamaConfig {
  ollamaUrl: string;
  defaultModel: string;
  maxTokens: number;
  temperature: number;
  transport: 'stdio' | 'http';
  port?: number;
}
```

## MCP Tools

- `llm_complete` - Text completion
- `llm_chat` - Chat completion
- `model_list` - List available models
- `model_pull` - Pull new models
- `model_delete` - Remove models

## Development Status

✅ **Active** - Core MCP server implemented and tested.

## Dependencies

- `@promethean-os/mcp` - MCP protocol base
- `@promethean-os/llm` - LLM integration
- Ollama - Local model server

## Related Packages

- [[mcp]] - MCP protocol implementation
- [[llm]] - LLM utilities
- [[mcp-kanban-bridge]] - Kanban MCP integration
