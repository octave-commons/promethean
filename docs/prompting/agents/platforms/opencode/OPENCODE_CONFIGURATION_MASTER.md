# OpenCode Configuration Master Guide

## 🎯 Overview

This guide provides comprehensive documentation for configuring OpenCode agents, models, and tools according to the official OpenCode schema. It covers migration from custom formats, advanced configurations, and best practices.

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Configuration Structure](#configuration-structure)
3. [Migration Guide](#migration-guide)
4. [Model Reference](#model-reference)
5. [Agent Configuration](#agent-configuration)
6. [Provider Setup](#provider-setup)
7. [Advanced Features](#advanced-features)
8. [Validation & Testing](#validation--testing)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

## 🚀 Quick Start

### 1. Basic Configuration

Create a minimal `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "providers": {
    "openrouter": {
      "provider": "openrouter",
      "apiKey": "{env:OPENROUTER_API_KEY}"
    }
  },
  "agents": {
    "developer": {
      "model": "openrouter.qwen2.5-coder-7b-instruct",
      "temperature": 0.2
    }
  }
}
```

### 2. Environment Setup

```bash
# Required for most models
export OPENROUTER_API_KEY="your_openrouter_key"

# Optional for specific providers
export ANTHROPIC_API_KEY="your_anthropic_key"
export OPENAI_API_KEY="your_openai_key"
export Z_AI_API_KEY="your_z_ai_key"
```

### 3. Validation

```bash
node scripts/validate-opencode-config.cjs opencode.json
```

## 🏗️ Configuration Structure

### Required Sections

```json
{
  "$schema": "https://opencode.ai/config.json",
  "providers": {
    /* Provider configurations */
  },
  "agents": {
    /* Agent configurations */
  }
}
```

### Optional Sections

```json
{
  "mcp": {
    /* MCP server configurations */
  },
  "lsp": {
    /* Language server configurations */
  },
  "tools": {
    /* Tool permissions */
  },
  "instructions": [
    /* Instruction file paths */
  ]
}
```

## 🔄 Migration Guide

### From Custom Promethean Format

Use the automated migration script:

```bash
node scripts/migrate-opencode-config.cjs opencode.json opencode-new.json
```

### Manual Migration Steps

1. **Transform Providers**:

   ```json
   // Old format
   "provider": { "ollama": { ... } }

   // New format
   "providers": { "openrouter": { "provider": "openrouter", "apiKey": "{env:OPENROUTER_API_KEY}" } }
   ```

2. **Transform Agents**:

   ```json
   // Old format
   "agents": { "model_assignments": { ... } }

   // New format
   "agents": { "agentName": { "model": "openrouter.qwen2.5-coder-7b-instruct" } }
   ```

3. **Update Model Names**: Use the [Model Reference](#model-reference) section

## 🤖 Model Reference

### Valid Model IDs

#### OpenAI Models

- `gpt-4.1` - Latest GPT-4 model
- `gpt-4o` - GPT-4 Omni (multimodal)
- `gpt-4o-mini` - Smaller, faster GPT-4o
- `o1` - OpenAI reasoning model
- `o1-mini` - Smaller reasoning model
- `o3` - Advanced reasoning model
- `o3-mini` - Smaller advanced reasoning
- `o4-mini` - Latest reasoning model

#### Anthropic Models

- `claude-3-opus` - Most capable Claude 3
- `claude-3.5-sonnet` - Balanced Claude 3.5
- `claude-3.5-haiku` - Fast Claude 3.5
- `claude-4-sonnet` - Latest Claude 4
- `claude-4-opus` - Most capable Claude 4

#### OpenRouter Models

- `openrouter.gpt-4o` - GPT-4o via OpenRouter
- `openrouter.claude-3.5-sonnet` - Claude 3.5 Sonnet via OpenRouter
- `openrouter.qwen2.5-coder-7b-instruct` - Qwen coding model
- `openrouter.qwen2.5-7b-instruct` - Qwen 2.5 base model
- `openrouter.qwen3-8b` - Qwen 3 8B model
- `openrouter.qwen3-14b` - Qwen 3 14B model
- `openrouter.deepseek-r1-distill-llama-70b` - DeepSeek reasoning model
- `openrouter.deepseek-r1` - Full DeepSeek R1 model
- `openrouter.qwen3-coder-408b` - Large Qwen coding model

#### Azure Models

- `azure.gpt-4.1` - GPT-4.1 via Azure
- `azure.o1` - O1 reasoning via Azure
- `azure.claude-3.5-sonnet` - Claude via Azure

#### Copilot Models

- `copilot.gpt-4o` - GPT-4o via GitHub Copilot
- `copilot.claude-3.5-sonnet` - Claude via GitHub Copilot

### Model Selection Guide

| Use Case                | Recommended Models                                            | Cost Efficiency |
| ----------------------- | ------------------------------------------------------------- | --------------- |
| **General Development** | `openrouter.qwen2.5-coder-7b-instruct`, `openrouter.qwen3-8b` | High            |
| **Complex Reasoning**   | `claude-4-sonnet`, `o1`, `openrouter.deepseek-r1`             | Medium          |
| **Code Review**         | `claude-3.5-sonnet`, `openrouter.qwen2.5-coder-7b-instruct`   | High            |
| **Documentation**       | `gpt-4o`, `claude-3.5-haiku`                                  | Medium          |
| **Security Analysis**   | `claude-4-opus`, `openrouter.deepseek-r1`                     | Low             |
| **Rapid Prototyping**   | `openrouter.qwen2.5-7b-instruct`, `claude-3.5-haiku`          | High            |

## 👥 Agent Configuration

### Basic Agent Structure

```json
{
  "agents": {
    "agentName": {
      "model": "openrouter.qwen2.5-coder-7b-instruct",
      "maxTokens": 32768,
      "reasoningEffort": "medium",
      "temperature": 0.2,
      "tools": {
        /* Tool permissions */
      },
      "prompt": "{file:path/to/prompt.md}"
    }
  }
}
```

### Agent Properties

| Property          | Type   | Required | Description                                       |
| ----------------- | ------ | -------- | ------------------------------------------------- |
| `model`           | string | ✅       | Valid model ID from the official list             |
| `maxTokens`       | number | ❌       | Maximum response tokens (default: model-specific) |
| `reasoningEffort` | string | ❌       | "low", "medium", or "high" (default: "medium")    |
| `temperature`     | number | ❌       | 0.0-1.0, creativity level (default: 0.2)          |
| `tools`           | object | ❌       | Tool permission configuration                     |
| `prompt`          | string | ❌       | Custom prompt file path                           |

### Tool Permissions

```json
{
  "tools": {
    "allowed": ["read", "write", "bash", "serena_*"],
    "denied": ["process_start", "pm2_startProcess"],
    "default": "allow" // or "deny"
  }
}
```

### Specialized Agent Examples

#### Security Analyst

```json
{
  "security-analyst": {
    "model": "claude-4-opus",
    "reasoningEffort": "high",
    "temperature": 0.0,
    "tools": {
      "allowed": ["read", "grep", "serena_find_symbol", "clj-kondo-mcp_lint_clojure"],
      "default": "deny"
    },
    "prompt": "{file:docs/agents/security-analyst-prompt.md}"
  }
}
```

#### Clojure Specialist

```json
{
  "clojure-expert": {
    "model": "openrouter.qwen3-coder-408b",
    "reasoningEffort": "high",
    "temperature": 0.2,
    "tools": {
      "allowed": ["clojure-mcp_*", "serena_*", "clj-kondo-mcp_lint_clojure"],
      "default": "allow"
    }
  }
}
```

#### Documentation Writer

```json
{
  "documentation-writer": {
    "model": "gpt-4o",
    "reasoningEffort": "low",
    "temperature": 0.4,
    "tools": {
      "allowed": ["read", "write", "edit", "webfetch", "context7_*"],
      "default": "allow"
    }
  }
}
```

## 🔌 Provider Setup

### Supported Providers

| Provider         | Provider ID  | API Key Environment Variable     |
| ---------------- | ------------ | -------------------------------- |
| OpenRouter       | `openrouter` | `OPENROUTER_API_KEY`             |
| Anthropic        | `anthropic`  | `ANTHROPIC_API_KEY`              |
| OpenAI           | `openai`     | `OPENAI_API_KEY`                 |
| Google Gemini    | `gemini`     | `GEMINI_API_KEY`                 |
| Groq             | `groq`       | `GROQ_API_KEY`                   |
| AWS Bedrock      | `bedrock`    | `AWS_ACCESS_KEY_ID`              |
| Azure OpenAI     | `azure`      | `AZURE_OPENAI_API_KEY`           |
| Google Vertex AI | `vertexai`   | `GOOGLE_APPLICATION_CREDENTIALS` |
| GitHub Copilot   | `copilot`    | `GITHUB_TOKEN`                   |

### Provider Configuration Examples

#### OpenRouter (Recommended)

```json
{
  "providers": {
    "openrouter": {
      "provider": "openrouter",
      "apiKey": "{env:OPENROUTER_API_KEY}",
      "disabled": false
    }
  }
}
```

#### Multiple Providers

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
      "disabled": true
    }
  }
}
```

## 🔧 Advanced Features

### Custom Prompts

Create specialized agent prompts:

```markdown
<!-- docs/agents/security-analyst-prompt.md -->

You are a security specialist with expertise in:

- Static code analysis
- Vulnerability assessment
- Security best practices
- OWASP guidelines

Focus on:

1. Identifying security vulnerabilities
2. Suggesting secure coding practices
3. Explaining security implications
4. Providing remediation steps

Always prioritize security over convenience.
```

Reference in configuration:

```json
{
  "prompt": "{file:docs/agents/security-analyst-prompt.md}"
}
```

### MCP Server Configuration

#### Local MCP Servers

```json
{
  "mcp": {
    "clojure-mcp": {
      "type": "local",
      "command": ["clojure", "-X:mcp"],
      "environment": {
        "CLOJURE_MCP_PORT": "7888"
      },
      "enabled": true
    }
  }
}
```

#### Remote MCP Servers

```json
{
  "mcp": {
    "web-search-prime": {
      "type": "remote",
      "url": "https://api.z.ai/api/mcp/web_search_prime/mcp",
      "headers": {
        "Authorization": "Bearer {env:Z_AI_API_KEY}"
      },
      "enabled": true
    }
  }
}
```

### LSP Configuration

```json
{
  "lsp": {
    "clojure-lsp": {
      "command": ["clojure-lsp"],
      "extensions": [".clj", ".cljs", ".cljc", ".bb"],
      "initialization": {
        "settings": {
          "clojure-lsp": {
            "source-paths": ["src", "packages/*/src"],
            "test-paths": ["test", "packages/*/test"]
          }
        }
      }
    }
  }
}
```

## ✅ Validation & Testing

### Configuration Validation

```bash
# Validate single configuration
node scripts/validate-opencode-config.cjs opencode.json

# Validate multiple configurations
node scripts/validate-opencode-config.cjs opencode.json opencode-production.json

# Continuous validation in development
watchdog -n 5 'node scripts/validate-opencode-config.cjs opencode.json'
```

### Testing Agent Functionality

```bash
# Test specific agent
opencode --agent security-analyst --test

# Test model connectivity
opencode --test-models

# Validate MCP servers
opencode --test-mcp
```

### Performance Benchmarking

```bash
# Benchmark agent responses
opencode --benchmark --agent clojure-expert --iterations 10

# Compare model performance
opencode --compare-models --task "code-review" --models "claude-4-sonnet,openrouter.qwen3-coder-408b"
```

## 🔧 Troubleshooting

### Common Issues

#### Invalid Model IDs

**Error**: `Invalid model for agent X: model-name`

**Solution**: Check the [Model Reference](#model-reference) section for valid model IDs.

#### Missing API Keys

**Error**: `Provider X missing apiKey configuration`

**Solution**: Set the required environment variables:

```bash
export OPENROUTER_API_KEY="your_key"
export ANTHROPIC_API_KEY="your_key"
```

#### Tool Permission Issues

**Error**: `Agent X cannot access tool Y`

**Solution**: Check tool permissions in agent configuration:

```json
{
  "tools": {
    "allowed": ["tool_name"],
    "default": "allow"
  }
}
```

#### MCP Server Connection Issues

**Error**: `Failed to connect to MCP server X`

**Solution**: Verify MCP server configuration:

```bash
# Test local MCP server
clojure -X:mcp

# Test remote MCP server
curl -H "Authorization: Bearer $API_KEY" https://api.example.com/mcp
```

### Debug Mode

Enable debug logging:

```bash
export OPENCODE_DEBUG=1
opencode --agent developer --debug
```

### Configuration Reset

Reset to default configuration:

```bash
cp config/defaults/opencode.json opencode.json
```

## 📋 Best Practices

### Configuration Management

1. **Version Control**: Commit configuration files but exclude API keys
2. **Environment Separation**: Use different configs for dev/staging/prod
3. **Validation**: Always validate configurations before deployment
4. **Documentation**: Document custom prompts and tool permissions

### Security

1. **API Key Management**: Use environment variables, never hardcode keys
2. **Tool Permissions**: Restrict dangerous tools for untrusted agents
3. **Network Security**: Validate remote MCP server URLs
4. **Access Control**: Implement proper authentication for MCP servers

### Performance

1. **Model Selection**: Choose appropriate models for task complexity
2. **Token Management**: Set reasonable `maxTokens` limits
3. **Caching**: Leverage OpenCode's built-in response caching
4. **Parallel Processing**: Configure multiple agents for concurrent tasks

### Cost Optimization

1. **Model Tiering**: Use cheaper models for simple tasks
2. **Token Limits**: Implement appropriate token limits
3. **Caching Strategy**: Maximize cache hit rates
4. **Monitoring**: Track token usage and costs

## 📁 File Structure

```
project/
├── opencode.json                 # Main configuration
├── opencode-production.json      # Production configuration
├── opencode-development.json     # Development configuration
├── scripts/
│   ├── validate-opencode-config.cjs
│   └── migrate-opencode-config.cjs
├── docs/
│   └── agents/
│       ├── opencode.md
│       ├── security-analyst-prompt.md
│       └── clojure-expert-prompt.md
└── .env.example                  # Environment variables template
```

## 🔄 Continuous Updates

### Model Updates

New models are regularly added to OpenCode. To stay current:

1. **Check Schema Updates**: Regularly fetch the latest schema
2. **Model Testing**: Test new models before production use
3. **Configuration Updates**: Update configurations with new models
4. **Documentation**: Keep model documentation current

### Schema Validation

```bash
# Fetch latest schema
curl -s https://opencode.ai/config.json > latest-schema.json

# Compare with current
diff latest-schema.json schema.json
```

## 📞 Support

### Resources

- **Official Documentation**: https://opencode.ai/docs
- **Schema Reference**: https://opencode.ai/config.json
- **Community**: https://github.com/opencode-ai/opencode
- **Issues**: https://github.com/opencode-ai/opencode/issues

### Getting Help

1. **Check Validation**: Run the validation script first
2. **Review Logs**: Enable debug mode for detailed logs
3. **Search Issues**: Check GitHub for similar problems
4. **Community**: Ask questions in community forums

---

This master guide provides comprehensive coverage of OpenCode configuration. For specific implementation details, refer to the example configurations and validation scripts included in this repository.
