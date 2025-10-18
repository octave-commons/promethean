# OpenCode CLI Client

A comprehensive command-line interface for interacting with OpenCode plugins, tools, and services. This client provides easy access to Ollama LLM operations, session management, and process monitoring through a unified CLI interface.

## 🎉 Recent Updates

### TypeScript Compilation Fixes (October 2025)

The package has undergone significant TypeScript compilation fixes to resolve build errors and improve type safety:

- ✅ **Fixed `setProcessingInterval(null)` type mismatch** - Now uses proper `clearProcessingInterval()` function
- ✅ **Updated imports and removed unused functions** - Clean, type-safe codebase
- ✅ **Enhanced queue management** - Proper processor lifecycle management
- ✅ **All builds succeed without errors** - Zero TypeScript compilation errors

**Key Changes:**

- Updated `src/tools/ollama.ts` to use proper queue management functions
- Cleaned up `src/actions/ollama/tools.ts` imports and implementations
- Established best practices for queue processor lifecycle management

For detailed technical information, see the [TypeScript Compilation Fixes](./docs/typescript-compilation-fixes.md) documentation.

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

# List available Ollama models
opencode-client ollama models

# Submit a generation job
opencode-client ollama submit --model llama2 --prompt "Explain quantum computing"

# List active sessions
opencode-client sessions list

# Create a new session
opencode-client sessions create --title "Code Review Session"
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

- `-v, --verbose`: Enable verbose output
- `--no-color`: Disable colored output
- `--version`: Show version information
- `--help`: Display help information

## 📚 Command Reference

### Ollama Commands

#### Job Management

```bash
# Submit a generation job
opencode-client ollama submit \
  --model llama2 \
  --prompt "Explain machine learning" \
  --priority high \
  --name "ml-explanation"

# Submit a chat job
opencode-client ollama submit \
  --model llama2 \
  --job-type chat \
  --messages '[{"role": "user", "content": "Hello"}]'

# List jobs
opencode-client ollama list --status pending --limit 10

# Get job status
opencode-client ollama status <job-id>

# Get job result
opencode-client ollama result <job-id>

# Cancel a job
opencode-client ollama cancel <job-id>
```

#### Model & Queue Management

```bash
# List available models
opencode-client ollama models

# Get detailed model information
opencode-client ollama models --detailed

# Get queue information
opencode-client ollama info

# Manage cache
opencode-client ollama cache stats
opencode-client ollama cache clear
opencode-client ollama cache clear-expired
```

### Session Commands

```bash
# List sessions
opencode-client sessions list --limit 20 --offset 0

# Get session details
opencode-client sessions get <session-id>

# Create a new session
opencode-client sessions create \
  --title "Code Review" \
  --files ["src/main.ts"] \
  --delegates ["reviewer"]

# Close a session
opencode-client sessions close <session-id>

# Search sessions
opencode-client sessions search --query "bug fix" --k 5
```

### PM2 Commands

```bash
# List PM2 processes
opencode-client pm2 list

# Get process details
opencode-client pm2 describe <process-name>

# Show logs
opencode-client pm2 logs <process-name> --lines 100 --type error
```

## 🔧 Configuration

### Environment Variables

```bash
# OpenCode server endpoint
export OPENCODE_SERVER_URL="http://localhost:3000"

# Authentication token (if required)
export OPENCODE_AUTH_TOKEN="your-token-here"

# Default model for Ollama operations
export OPENCODE_DEFAULT_MODEL="llama2"

# Request timeout in milliseconds
export OPENCODE_TIMEOUT=30000
```

### Configuration File

Create a configuration file at `~/.opencode/config.json`:

```json
{
  "server": {
    "url": "http://localhost:3000",
    "timeout": 30000,
    "retries": 3
  },
  "auth": {
    "token": "your-auth-token",
    "type": "bearer"
  },
  "defaults": {
    "model": "llama2",
    "priority": "medium",
    "jobType": "generate"
  },
  "display": {
    "color": true,
    "compact": false,
    "timestamp": true
  }
}
```

## 🏗️ Development

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
# Clone the repository
git clone <repository-url>
cd promethean/packages/opencode-client

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Test the CLI
npm start -- --help
```

### Adding New Commands

1. **Create the command file** in `src/commands/<category>/`:

```typescript
// src/commands/example/new-command.ts
import { Command } from 'commander';
import chalk from 'chalk';

export const newCommand = new Command('new-command')
  .description('Description of the new command')
  .option('--option <value>', 'Option description')
  .action(async (options) => {
    console.log(chalk.blue('Executing new command'));
    // Implementation here
  });
```

2. **Export from category index**:

```typescript
// src/commands/example/index.ts
export { newCommand } from './new-command.js';
export const exampleCommands = new Command('example').addCommand(newCommand);
```

3. **Register in main CLI**:

```typescript
// src/cli.ts
import { exampleCommands } from './commands/example/index.js';

program.addCommand(exampleCommands);
```

### API Integration

Replace mock implementations with actual API calls:

```typescript
// src/api/example.ts
export async function apiCall(params: any): Promise<any> {
  const response = await fetch(`${process.env.OPENCODE_SERVER_URL}/api/endpoint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENCODE_AUTH_TOKEN}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage

# Integration tests
npm run test:integration
```

## 📖 Examples

### Workflow Example: Code Review Session

```bash
# 1. Create a session for code review
opencode-client sessions create --title "Code Review" --files ["src/app.ts"]

# 2. Submit a code analysis job
opencode-client ollama submit \
  --model codellama \
  --prompt "Review this code for security issues" \
  --name "security-review" \
  --priority high

# 3. Monitor job progress
opencode-client ollama status <job-id>

# 4. Get results when complete
opencode-client ollama result <job-id>

# 5. Close the session
opencode-client sessions close <session-id>
```

### Batch Processing Example

```bash
# Submit multiple jobs
for file in src/*.ts; do
  opencode-client ollama submit \
    --model llama2 \
    --prompt "Analyze $(basename $file)" \
    --name "analyze-$(basename $file)"
done

# Monitor all pending jobs
opencode-client ollama list --status pending

# Get results for completed jobs
opencode-client ollama list --status completed | jq -r '.[].id' | xargs -I {} opencode-client ollama result {}
```

## 🐛 Troubleshooting

### Common Issues

1. **Connection Refused**

   ```bash
   # Check server status
   curl http://localhost:3000/health

   # Verify configuration
   opencode-client --verbose ollama info
   ```

2. **Authentication Errors**

   ```bash
   # Check token
   echo $OPENCODE_AUTH_TOKEN

   # Refresh token
   opencode-client auth refresh
   ```

3. **Job Timeouts**

   ```bash
   # Increase timeout
   export OPENCODE_TIMEOUT=60000

   # Check queue status
   opencode-client ollama info
   ```

### Debug Mode

Enable verbose logging for debugging:

```bash
opencode-client --verbose <command>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-command`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Add comprehensive error handling
- Include help text for all commands
- Write tests for new functionality

## 📄 License

GPL-3.0-only - see LICENSE file for details.

## 🔗 Related Documentation

### Comprehensive Documentation

- **[Documentation Overview](./docs/README.md)** - Complete documentation index and getting started guide
- **[TypeScript Compilation Fixes](./docs/typescript-compilation-fixes.md)** - Recent fixes and type safety improvements
- **[API Reference](./docs/api-reference.md)** - Complete API documentation for all functions and tools
- **[Ollama Queue Integration](./docs/ollama-queue-integration.md)** - Comprehensive guide to queue management
- **[Development Guide](./docs/development-guide.md)** - Setup, development workflows, and contribution guidelines
- **[Troubleshooting Guide](./docs/troubleshooting.md)** - Common issues and solutions
- **[Code Examples](./docs/code-examples.md)** - Practical examples and usage patterns

### Related Project Documentation

- [OpenCode Server Documentation](../../docs/)
- [Integration Guide](./docs/integration.md)

## 📞 Support

- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation
- Join the community discussions
