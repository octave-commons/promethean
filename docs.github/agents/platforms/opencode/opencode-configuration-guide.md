# OpenCode Configuration Guide

## Overview

This guide explains the transformation from the custom Promethean configuration format to the official OpenCode configuration schema, and provides advanced configuration options.

## Configuration Transformation

### Key Changes Made

1. **Provider Structure**: Changed from `provider` to `providers` (official schema)
2. **Agent Configuration**: Converted from custom `model_assignments` to official `agents` format
3. **Model Names**: Mapped to valid OpenCode model IDs from the official schema
4. **Provider Declarations**: Added proper provider configurations with API key handling

### Model Mapping

| Original Model           | OpenCode Model ID                          | Reason                 |
| ------------------------ | ------------------------------------------ | ---------------------- |
| `qwen2.5-coder:7b`       | `openrouter.qwen2.5-coder-7b-instruct`     | Valid OpenRouter model |
| `qwen2.5:7b`             | `openrouter.qwen2.5-7b-instruct`           | Valid OpenRouter model |
| `qwen3:8b`               | `openrouter.qwen3-8b`                      | Valid OpenRouter model |
| `qwen3:14b`              | `openrouter.qwen3-14b`                     | Valid OpenRouter model |
| `gpt-oss:20b`            | `openrouter.deepseek-r1-distill-llama-70b` | Closest equivalent     |
| `gpt-oss:120b-cloud`     | `openrouter.deepseek-r1`                   | High-performance model |
| `qwen3-coder:408b-cloud` | `openrouter.qwen3-coder-408b`              | Valid OpenRouter model |

## Configuration Structure

### Providers

```json
{
  "providers": {
    "openrouter": {
      "provider": "openrouter",
      "apiKey": "{env:OPENROUTER_API_KEY}",
      "disabled": false
    },
    "anthropic": {
      "provider": "anthropic",
      "apiKey": "{env:ANTHROPIC_API_KEY}",
      "disabled": false
    },
    "openai": {
      "provider": "openai",
      "apiKey": "{env:OPENAI_API_KEY}",
      "disabled": false
    }
  }
}
```

### Agents

```json
{
  "agents": {
    "agentName": {
      "model": "openrouter.qwen2.5-coder-7b-instruct",
      "maxTokens": 32768,
      "reasoningEffort": "medium",
      "temperature": 0.2
    }
  }
}
```

#### Agent Properties

- **model**: Required - Must be a valid model ID from the OpenCode schema
- **maxTokens**: Optional - Maximum tokens for responses
- **reasoningEffort**: Optional - "low", "medium", or "high"
- **temperature**: Optional - 0.0 to 1.0, controls creativity

## Advanced Agent Configuration

### Built-in Agent Types

OpenCode supports three built-in agent types:

1. **build**: Full access agents for development tasks
2. **plan**: Read-only agents for analysis and planning
3. **general**: Research agents with broad capabilities

### Custom Agent Configuration

You can create custom agents with specific tool permissions:

```json
{
  "agents": {
    "security-analyzer": {
      "model": "openrouter.claude-3.5-sonnet",
      "maxTokens": 64000,
      "reasoningEffort": "high",
      "temperature": 0.1,
      "tools": {
        "allowed": ["read", "grep", "bash", "serena_find_symbol"],
        "denied": ["write", "edit", "delete"]
      },
      "prompt": "{file:docs/agents/security-prompt.md}"
    }
  }
}
```

### Tool Permissions

Fine-grained control over agent capabilities:

```json
{
  "tools": {
    "allowed": ["read", "write", "bash"],
    "denied": ["process_start", "pm2_startProcess"],
    "default": "allow" // or "deny"
  }
}
```

## Valid Model IDs

### OpenAI Models

- `gpt-4.1`, `gpt-4o`, `gpt-4o-mini`
- `o1`, `o1-mini`, `o3`, `o3-mini`, `o4-mini`

### Anthropic Models

- `claude-3-opus`, `claude-3.5-sonnet`, `claude-3.5-haiku`
- `claude-4-sonnet`, `claude-4-opus`

### OpenRouter Models

- `openrouter.gpt-4o`, `openrouter.claude-3.5-sonnet`
- `openrouter.qwen2.5-coder-7b-instruct`
- `openrouter.deepseek-r1`, `openrouter.qwen3-coder-408b`

### Azure Models

- `azure.gpt-4.1`, `azure.o1`, `azure.claude-3.5-sonnet`

### Copilot Models

- `copilot.gpt-4o`, `copilot.claude-3.5-sonnet`

## Environment Variables

Set these in your environment or `.env` file:

```bash
# OpenRouter for most models
OPENROUTER_API_KEY=your_openrouter_key

# Anthropic for Claude models
ANTHROPIC_API_KEY=your_anthropic_key

# OpenAI for GPT models
OPENAI_API_KEY=your_openai_key

# Z.AI for custom tools
Z_AI_API_KEY=your_z_ai_key

# Context7 for documentation
CONTEXT7_API_KEY=your_context7_key
```

## MCP Server Configuration

The MCP (Model Context Protocol) servers remain the same and are fully compatible:

```json
{
  "mcp": {
    "server-name": {
      "type": "local|remote",
      "command": ["command", "args"],
      "url": "https://api.example.com/mcp",
      "headers": { "Authorization": "Bearer {env:API_KEY}" },
      "environment": { "VAR": "value" },
      "enabled": true
    }
  }
}
```

## Migration Steps

1. **Backup Current Config**: `cp opencode.json opencode.json.backup`
2. **Apply New Config**: `cp opencode-corrected.json opencode.json`
3. **Set Environment Variables**: Configure required API keys
4. **Test Configuration**: Run OpenCode and verify agent functionality
5. **Validate Models**: Ensure all model IDs are valid and accessible

## Troubleshooting

### Common Issues

1. **Invalid Model IDs**: Check against the official schema
2. **Missing API Keys**: Ensure all required environment variables are set
3. **Provider Configuration**: Verify provider names match the schema exactly
4. **Permission Issues**: Check tool permissions if agents can't access certain functions

### Validation

Use the official schema to validate your configuration:

```bash
# Validate against schema
curl -s https://opencode.ai/config.json | jq . > schema.json
ajv validate -s schema.json -d opencode.json
```

## Best Practices

1. **Use Environment Variables**: Never hardcode API keys
2. **Model Selection**: Choose models based on task complexity
3. **Token Limits**: Set appropriate `maxTokens` for your use case
4. **Temperature**: Use lower values (0.1-0.3) for code, higher (0.5-0.7) for creative tasks
5. **Reasoning Effort**: Use "high" for complex analysis, "low" for simple tasks

## Performance Optimization

1. **Model Caching**: OpenCode caches model responses automatically
2. **Concurrent Agents**: Configure multiple agents for parallel processing
3. **Tool Selection**: Enable only necessary tools to reduce overhead
4. **Token Management**: Monitor token usage to control costs

## Security Considerations

1. **API Key Security**: Use environment variables, never commit keys
2. **Tool Permissions**: Restrict dangerous tools for untrusted agents
3. **Network Access**: Be cautious with remote MCP servers
4. **File System Access**: Limit file system permissions where possible

## Next Steps

1. Implement the corrected configuration
2. Test each agent with its assigned model
3. Monitor performance and adjust settings as needed
4. Document any customizations for your team
5. Regularly update model IDs as new ones become available
