# OpenCode CLI Client Documentation

Welcome to the comprehensive documentation for the OpenCode CLI client. This powerful command-line interface provides seamless access to OpenCode plugins, tools, and services.

## 📚 Documentation Overview

### Getting Started

- **[Main README](../README.md)** - Installation, quick start, and basic usage
- **[Installation Guide](#installation)** - Detailed setup instructions
- **[Configuration](#configuration)** - Environment setup and configuration options

### Core Documentation

- **[API Documentation](./api.md)** - Complete API reference for all functions
- **[Development Guide](./development.md)** - Contributing and extending the CLI
- **[Integration Guide](./integration.md)** - Connecting to real OpenCode APIs
- **[Usage Examples](./usage-examples.md)** - Comprehensive examples and workflows

### Reference Materials

- **[Command Reference](#command-reference)** - Complete command documentation
- **[Configuration Reference](#configuration-reference)** - All configuration options
- **[Troubleshooting](#troubleshooting)** - Common issues and solutions

## 🚀 Quick Start

### Installation

```bash
# Install from npm (when published)
npm install -g opencode-client

# Or build from source
git clone <repository-url>
cd promethean/packages/opencode-client
npm install
npm run build
npm link
```

### Basic Usage

```bash
# Get help
opencode-client --help

# List available models
opencode-client ollama models

# Submit a generation job
opencode-client ollama submit --model llama2 --prompt "Explain quantum computing"

# List active sessions
opencode-client sessions list
```

## 📋 Features

### 🤖 Ollama Integration

- **Job Management**: Submit, monitor, and retrieve LLM jobs
- **Model Discovery**: List available models with detailed information
- **Queue Monitoring**: Track queue status and performance metrics
- **Cache Management**: Optimize performance with intelligent caching

### 🔄 Session Management

- **Session Lifecycle**: Create, monitor, and close sessions
- **Semantic Search**: Find past sessions using semantic embeddings
- **Activity Tracking**: Monitor session status and agent tasks
- **Batch Operations**: Manage multiple sessions efficiently

### ⚙️ Process Management

- **PM2 Integration**: Monitor and manage Node.js processes
- **Resource Monitoring**: Track CPU, memory, and performance metrics
- **Log Management**: Access and filter process logs

## 🛠️ Command Structure

The CLI follows a hierarchical command structure:

```
opencode-client [global-options] <command> [subcommand] [options]
```

### Global Options

| Option          | Description              |
| --------------- | ------------------------ |
| `-v, --verbose` | Enable verbose output    |
| `--no-color`    | Disable colored output   |
| `--version`     | Show version information |
| `--help`        | Display help information |

## 📖 Command Reference

### Ollama Commands

#### Job Management

```bash
# Submit jobs
opencode-client ollama submit --model <model> --prompt <text> [options]
opencode-client ollama submit --model <model> --job-type chat --messages <json> [options]
opencode-client ollama submit --model <model> --job-type embedding --input <text> [options]

# Monitor jobs
opencode-client ollama list [options]
opencode-client ollama status <job-id>
opencode-client ollama result <job-id>
opencode-client ollama cancel <job-id>
```

#### Model & Queue Management

```bash
# Models
opencode-client ollama models [--detailed]

# Queue
opencode-client ollama info
opencode-client ollama cache <action>
```

### Session Commands

```bash
# Session management
opencode-client sessions list [options]
opencode-client sessions get <session-id>
opencode-client sessions create [options]
opencode-client sessions close <session-id>
opencode-client sessions search --query <text> [options]
```

### PM2 Commands

```bash
# Process management
opencode-client pm2 list
opencode-client pm2 describe <process-name>
opencode-client pm2 logs <process-name> [options]
```

## ⚙️ Configuration

### Environment Variables

```bash
# Server configuration
OPENCODE_SERVER_URL="http://localhost:3000"
OPENCODE_TIMEOUT=30000
OPENCODE_RETRIES=3

# Authentication
OPENCODE_AUTH_TOKEN="your-bearer-token"
OPENCODE_AUTH_TYPE="bearer"

# Defaults
OPENCODE_DEFAULT_MODEL="llama2"
OPENCODE_DEFAULT_PRIORITY="medium"
OPENCODE_DEFAULT_JOB_TYPE="generate"

# Logging
OPENCODE_LOG_LEVEL="info"
OPENCODE_LOG_FORMAT="text"
DEBUG=false
```

### Configuration File

Create `~/.opencode/config.json`:

```json
{
  "environment": "development",
  "server": {
    "url": "http://localhost:3000",
    "timeout": 30000,
    "retries": 3
  },
  "auth": {
    "type": "bearer",
    "token": "your-auth-token"
  },
  "defaults": {
    "model": "llama2",
    "priority": "medium",
    "jobType": "generate"
  },
  "logging": {
    "level": "info",
    "format": "text"
  },
  "cache": {
    "enabled": true,
    "ttl": 300000,
    "maxSize": 1000
  }
}
```

## 🔧 Development

### Project Structure

```
src/
├── cli.ts                 # Main CLI entry point
├── api/                   # API abstraction layers
│   ├── ollama.ts         # Ollama API functions
│   └── sessions.ts       # Sessions API functions
├── commands/              # Command implementations
│   ├── ollama/           # Ollama commands
│   ├── sessions/         # Session commands
│   └── pm2/              # PM2 commands
├── tools/                # Tool implementations
├── plugins/              # Plugin system
└── actions/              # Action handlers
```

### Building from Source

```bash
# Clone and install
git clone <repository-url>
cd promethean/packages/opencode-client
npm install

# Development
npm run dev          # Watch mode
npm run build        # Build
npm run lint         # Lint code
npm run format       # Format code

# Testing
npm test             # Run tests
npm run test:coverage # Test with coverage
```

### Adding New Commands

1. **Create command file** in `src/commands/<category>/`
2. **Export from category index**
3. **Register in main CLI**
4. **Add tests**

See the [Development Guide](./development.md) for detailed instructions.

## 🔌 Integration

### API Integration

The CLI provides clean API abstractions that can be used programmatically:

```typescript
import { listJobs, submitJob } from './api/ollama.js';

// List jobs
const jobs = await listJobs({ status: 'pending', limit: 10 });

// Submit job
const job = await submitJob({
  modelName: 'llama2',
  jobType: 'generate',
  priority: 'high',
  prompt: 'Explain TypeScript',
});
```

### Authentication

Support for multiple authentication methods:

- **Bearer Token**: Standard JWT/OAuth tokens
- **API Key**: Custom API key authentication
- **Custom**: Custom authentication handlers

See the [Integration Guide](./integration.md) for complete integration instructions.

## 🐛 Troubleshooting

### Common Issues

#### Connection Problems

```bash
# Check server status
curl -I $OPENCODE_SERVER_URL/health

# Verify configuration
opencode-client --verbose ollama info
```

#### Authentication Issues

```bash
# Test token
curl -H "Authorization: Bearer $OPENCODE_AUTH_TOKEN" \
     $OPENCODE_SERVER_URL/api/auth/me

# Refresh token
opencode-client auth refresh
```

#### Debug Mode

```bash
# Enable verbose logging
DEBUG=true opencode-client --verbose <command>

# Check configuration
opencode-client config show
```

### Getting Help

- **Documentation**: Browse these docs for detailed information
- **Issues**: Report bugs on the GitHub repository
- **Community**: Join discussions in the community forums
- **Support**: Contact the support team for enterprise assistance

## 📚 Additional Resources

### Examples and Tutorials

- **[Usage Examples](./usage-examples.md)** - Comprehensive examples for all commands
- **[Workflow Examples](./usage-examples.md#advanced-workflows)** - Real-world automation workflows
- **[Scripting Examples](./usage-examples.md#scripting-examples)** - Integration with various programming languages

### API Reference

- **[Ollama API](./api.md#ollama-api)** - Complete Ollama API documentation
- **[Sessions API](./api.md#sessions-api)** - Session management API
- **[Error Handling](./api.md#error-handling)** - Error types and handling

### Development Resources

- **[Development Guide](./development.md)** - Contributing guidelines
- **[Code Style](./development.md#code-style)** - Coding standards
- **[Testing](./development.md#testing)** - Testing practices
- **[Release Process](./development.md#release-process)** - Release guidelines

## 🗺️ Roadmap

### Current Version (1.0.0)

- ✅ Basic CLI structure
- ✅ Ollama commands (mock implementation)
- ✅ Session commands (mock implementation)
- ✅ PM2 integration (placeholder)
- ✅ TypeScript compilation

### Upcoming Features

- 🔄 Real API integration
- 🔄 Configuration file support
- 🔄 Authentication system
- 🔄 Comprehensive error handling
- 🔄 Unit tests
- 🔄 Package distribution

### Future Enhancements

- 📋 Plugin system
- 📋 Interactive mode
- 📋 Web interface
- 📋 Mobile app
- 📋 Enterprise features

## 🤝 Contributing

We welcome contributions! Please see the [Development Guide](./development.md) for:

- Getting started with development
- Coding standards and practices
- Submitting pull requests
- Reporting issues

### Quick Contribution Steps

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Add** tests
5. **Submit** a pull request

## 📄 License

This project is licensed under the GPL-3.0 License. See the [LICENSE](../../LICENSE.txt) file for details.

## 🔗 Links

- **Repository**: [GitHub Repository](../../)
- **Issues**: [Issue Tracker](../../issues)
- **Discussions**: [Community Discussions](../../discussions)
- **Releases**: [Release Notes](../../releases)

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0  
**Maintainers**: OpenCode Team

For the most up-to-date information, visit the [official documentation](https://docs.opencode.com).
