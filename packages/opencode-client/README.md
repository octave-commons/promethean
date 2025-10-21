# @promethean/opencode-client

A comprehensive CLI client and unified agent management system for the Promethean Framework, providing seamless integration with OpenCode plugins, tools, and services through a powerful command-line interface and programmatic API.

## 🎯 Overview

The `@promethean/opencode-client` package serves as the primary interface for interacting with the Promethean cognitive architecture, offering:

- **Unified Agent Management**: High-level abstractions for complete agent lifecycle management
- **CLI Interface**: Comprehensive command-line tools for all Promethean operations
- **Ollama Integration**: Advanced LLM queue management with intelligent caching
- **Session Management**: Semantic search and activity tracking for agent sessions
- **Process Monitoring**: PM2 integration for robust process management
- **Plugin Architecture**: Extensible system for custom tools and integrations

## 🚀 Quick Start

### Installation

```bash
# Install from npm (when published)
npm install -g @promethean/opencode-client

# Or build from source within the Promethean monorepo
cd promethean/packages/opencode-client
pnpm install
pnpm build
pnpm link --global
```

### Basic Usage

#### CLI Interface

```bash
# Get help and available commands
opencode-client --help

# List available Ollama models
opencode-client ollama models

# Submit a generation job
opencode-client ollama submit \
  --model llama2 \
  --prompt "Explain quantum computing" \
  --priority high

# List active sessions
opencode-client sessions list

# Create a new agent session
opencode-client sessions create \
  --title "Code Review Session" \
  --files ["src/main.ts"]
```

#### Programmatic API

```typescript
import { 
  unifiedAgentManager, 
  createAgentSession,
  sendMessageToAgent 
} from '@promethean/opencode-client';

// Create a new agent session with task
const session = await createAgentSession(
  "Review this TypeScript code for security issues",
  "Please analyze the attached code for potential security vulnerabilities.",
  {
    title: "Security Review",
    files: ["src/auth.ts"],
    priority: "high"
  }
);

// Send messages to the agent
await sendMessageToAgent(
  session.sessionId,
  "Focus specifically on authentication mechanisms"
);

// Monitor session status
console.log(`Session status: ${session.status}`);
```

## 🏗️ Architecture

### Core Components

```
@promethean/opencode-client/
├── UnifiedAgentManager     # High-level agent lifecycle management
├── AgentTaskManager        # Task creation and tracking
├── MessageProcessor       # Inter-agent communication
├── SessionUtils          # Session management utilities
├── EventProcessor        # Event handling and processing
├── InterAgentMessenger   # Cross-agent messaging
└── CLI Interface         # Command-line interface
```

### Data Flow

1. **Session Creation**: `UnifiedAgentManager` creates sessions with associated tasks
2. **Task Management**: `AgentTaskManager` handles task lifecycle and status tracking
3. **Message Processing**: `MessageProcessor` routes messages between agents
4. **Event Handling**: `EventProcessor` manages system-wide events
5. **Storage**: Dual-store persistence for sessions and tasks via `@promethean/persistence`

### Integration with Promethean Ecosystem

The opencode-client integrates seamlessly with other Promethean packages:

- **`@promethean/persistence`**: Dual-store management for session and task persistence
- **`@promethean/ollama-queue`**: Advanced LLM job queue with intelligent caching
- **`@promethean/kanban`**: Task management and workflow integration
- **MCP Server**: Model Context Protocol integration for enhanced tool access

## 📋 Features

### 🤖 Unified Agent Management

**High-Level Session Management**
```typescript
import { unifiedAgentManager } from '@promethean/opencode-client';

// Create session with automatic task assignment
const session = await unifiedAgentManager.createAgentSession(
  "Analyze system performance",
  "Review the performance metrics and identify bottlenecks",
  {
    title: "Performance Analysis",
    priority: "high",
    metadata: { category: "performance" }
  },
  {
    autoStart: true,
    onStatusChange: (sessionId, oldStatus, newStatus) => {
      console.log(`Session ${sessionId}: ${oldStatus} → ${newStatus}`);
    }
  }
);

// Monitor session lifecycle
const stats = unifiedAgentManager.getSessionStats();
console.log(`Active sessions: ${stats.total}`);
```

**Event-Driven Architecture**
```typescript
// Set up event listeners for real-time updates
unifiedAgentManager.addEventListener(
  session.sessionId, 
  'message', 
  (sessionId, message) => {
    console.log(`New message in ${sessionId}:`, message);
  }
);
```

### 🔄 Ollama Integration

**Advanced Job Management**
```bash
# Submit multiple job types
opencode-client ollama submit \
  --model llama2 \
  --job-type chat \
  --messages '[{"role": "user", "content": "Hello"}]' \
  --priority high

# Monitor queue performance
opencode-client ollama info

# Intelligent cache management
opencode-client ollama cache stats
opencode-client ollama cache clear-expired
```

**Programmatic Job Control**
```typescript
import { submitJob, getJobStatus, getJobResult } from '@promethean/opencode-client';

// Submit a job with advanced options
const jobResult = await submitJob.execute({
  modelName: 'codellama',
  jobType: 'generate',
  prompt: 'Write a TypeScript function for data validation',
  priority: 'high',
  options: {
    temperature: 0.7,
    num_ctx: 4096,
    format: 'json'
  }
}, { agent: 'agent-123', sessionID: 'session-456' });

const { jobId } = JSON.parse(jobResult);

// Monitor job progress
let status = 'pending';
while (status !== 'completed') {
  const statusResult = await getJobStatus.execute({ jobId });
  status = JSON.parse(statusResult).status;
  await new Promise(resolve => setTimeout(resolve, 1000));
}

// Get final result
const result = await getJobResult.execute({ jobId });
console.log('Job result:', JSON.parse(result));
```

### 📊 Session Management

**Semantic Search and Analytics**
```bash
# Search sessions by content similarity
opencode-client sessions search \
  --query "bug fix authentication" \
  --k 5

# Get detailed session analytics
opencode-client sessions get <session-id> --detailed

# Batch session operations
opencode-client sessions list --status completed --limit 50
```

**Programmatic Session Control**
```typescript
import { SessionUtils } from '@promethean/opencode-client';

// Create session with advanced options
const session = await SessionUtils.createSession({
  title: "Code Review",
  files: ["src/auth.ts", "src/database.ts"],
  delegates: ["security-expert", "code-reviewer"],
  metadata: {
    priority: "high",
    category: "security",
    estimatedDuration: "2h"
  }
});

// Search for similar sessions
const similarSessions = await SessionUtils.searchSessions({
  query: "security authentication review",
  k: 3,
  filters: { status: "completed" }
});

// Close session with summary
await SessionUtils.closeSession(session.id, {
  summary: "Completed security review with 3 findings",
  recommendations: ["Implement 2FA", "Add input validation"]
});
```

### ⚙️ Process Management

**PM2 Integration**
```bash
# Monitor all Promethean processes
opencode-client pm2 list

# Get detailed process metrics
opencode-client pm2 describe cephalon

# Real-time log monitoring
opencode-client pm2 logs cephalon --lines 100 --type error

# Process health checks
opencode-client pm2 health --all
```

## 🛠️ Command Structure

### Global Options

```bash
opencode-client [global-options] <command> [subcommand] [options]

# Global options
-v, --verbose          # Enable verbose output
--no-color            # Disable colored output
--version             # Show version information
--help                # Display help information
```

### Command Groups

#### Ollama Commands
```bash
# Job Management
opencode-client ollama submit     # Submit new LLM job
opencode-client ollama list       # List jobs with filtering
opencode-client ollama status     # Get job status
opencode-client ollama result     # Get job result
opencode-client ollama cancel     # Cancel pending job

# Model & Queue Management
opencode-client ollama models     # List available models
opencode-client ollama info       # Queue statistics
opencode-client ollama cache      # Cache management
```

#### Session Commands
```bash
# Session Lifecycle
opencode-client sessions create    # Create new session
opencode-client sessions list      # List sessions
opencode-client sessions get       # Get session details
opencode-client sessions close     # Close session
opencode-client sessions search    # Semantic search

# Session Management
opencode-client sessions archive   # Archive old sessions
opencode-client sessions export    # Export session data
opencode-client sessions import    # Import session data
```

#### PM2 Commands
```bash
# Process Management
opencode-client pm2 list         # List processes
opencode-client pm2 describe     # Process details
opencode-client pm2 logs         # Log management
opencode-client pm2 restart      # Restart process
opencode-client pm2 stop         # Stop process

# Monitoring
opencode-client pm2 health       # Health checks
opencode-client pm2 metrics       # Performance metrics
opencode-client pm2 events       # Event monitoring
```

#### Event Commands
```bash
# Event Management
opencode-client events list       # List events
opencode-client events emit        # Emit custom event
opencode-client events subscribe  # Subscribe to events
opencode-client events history     # Event history
```

## 🔧 Configuration

### Environment Variables

```bash
# Core Configuration
export OPENCODE_SERVER_URL="http://localhost:3000"
export OPENCODE_AUTH_TOKEN="your-auth-token"
export OPENCODE_ENV="development"

# Ollama Configuration
export OLLAMA_URL="http://localhost:11434"
export OPENCODE_DEFAULT_MODEL="llama2"
export OPENCODE_TIMEOUT=30000

# Storage Configuration
export OPENCODE_SESSION_STORE_PATH="./data/sessions"
export OPENCODE_TASK_STORE_PATH="./data/tasks"

# Debug & Logging
export OPENCODE_DEBUG="true"
export OPENCODE_LOG_LEVEL="debug"
export OPENCODE_VERBOSE="true"
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
    "token": "your-auth-token",
    "refreshToken": "your-refresh-token"
  },
  "ollama": {
    "url": "http://localhost:11434",
    "defaultModel": "llama2",
    "cache": {
      "enabled": true,
      "ttl": 300000,
      "maxSize": 1000
    }
  },
  "sessions": {
    "autoArchive": true,
    "archiveAfter": 86400000,
    "maxSessions": 100
  },
  "logging": {
    "level": "info",
    "format": "text",
    "file": "./logs/opencode.log"
  }
}
```

## 🏗️ Development

### Project Structure

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
├── cli.ts                 # Main CLI entry point
└── index.ts              # Main library entry point
```

### Building from Source

```bash
# Clone the repository
git clone <repository-url>
cd promethean/packages/opencode-client

# Install dependencies
pnpm install

# Build the project
pnpm build

# Run in development mode
pnpm dev

# Test the CLI
pnpm start -- --help
```

### Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test src/tests/unified-agent-manager.test.ts

# Watch mode for development
pnpm test:watch
```

## 🧪 Examples

### Workflow Example: Complete Agent Session

```bash
# 1. Create a comprehensive session
opencode-client sessions create \
  --title "Security Audit" \
  --files ["src/auth.ts", "src/database.ts"] \
  --delegates ["security-expert", "penetration-tester"] \
  --priority high

# 2. Submit multiple analysis jobs
opencode-client ollama submit \
  --model codellama \
  --prompt "Analyze authentication security" \
  --name "auth-analysis" \
  --priority high

opencode-client ollama submit \
  --model codellama \
  --prompt "Review database security" \
  --name "db-analysis" \
  --priority high

# 3. Monitor progress
opencode-client ollama list --status running

# 4. Get results and generate report
opencode-client ollama result <auth-job-id>
opencode-client ollama result <db-job-id>

# 5. Close session with findings
opencode-client sessions close <session-id>
```

### Programmatic Example: Multi-Agent Collaboration

```typescript
import { unifiedAgentManager } from '@promethean/opencode-client';

// Create multiple specialized sessions
const securitySession = await unifiedAgentManager.createAgentSession(
  "Conduct security audit",
  "Perform comprehensive security analysis of the authentication system",
  {
    title: "Security Audit",
    delegates: ["security-expert"],
    priority: "urgent"
  }
);

const codeReviewSession = await unifiedAgentManager.createAgentSession(
  "Review code quality",
  "Analyze code structure and identify improvement opportunities",
  {
    title: "Code Quality Review",
    delegates: ["code-reviewer"],
    priority: "high"
  }
);

// Set up inter-agent communication
unifiedAgentManager.addEventListener(
  securitySession.sessionId,
  'message',
  async (sessionId, message) => {
    if (message.type === 'security-finding') {
      // Forward security findings to code reviewer
      await sendMessageToAgent(
        codeReviewSession.sessionId,
        `Security finding: ${message.content}`
      );
    }
  }
);

// Monitor both sessions
const stats = unifiedAgentManager.getSessionStats();
console.log('Session statistics:', stats);
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Store Initialization Issues
```bash
# Check store paths
ls -la data/
ls -la ~/.opencode/

# Reset stores (warning: deletes data)
rm -rf data/sessions data/tasks
```

#### 2. Ollama Connection Issues
```bash
# Check Ollama service
curl http://localhost:11434/api/tags

# Verify Ollama configuration
opencode-client --verbose ollama info

# Restart Ollama service
sudo systemctl restart ollama
```

#### 3. Authentication Issues
```bash
# Verify token
echo $OPENCODE_AUTH_TOKEN

# Test authentication
curl -H "Authorization: Bearer $OPENCODE_AUTH_TOKEN" \
     http://localhost:3000/api/auth/me

# Refresh token
opencode-client auth refresh
```

### Debug Mode

Enable comprehensive debugging:
```bash
# Enable debug logging
export OPENCODE_DEBUG=true
export OPENCODE_VERBOSE=true

# Run with debug output
opencode-client --verbose <command>

# Check logs
tail -f ~/.opencode/logs/opencode.log
```

## 🤝 Contributing

### Development Guidelines

1. **Follow Promethean Standards**: Adhere to the framework's coding conventions
2. **TypeScript Best Practices**: Use strict TypeScript with proper type definitions
3. **Testing**: Write comprehensive tests for all new functionality
4. **Documentation**: Update documentation for all changes
5. **Error Handling**: Implement robust error handling and logging

### Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Run the test suite: `pnpm test`
5. Submit a pull request with detailed description

### Commit Message Format

Follow conventional commits:
```
feat: add unified agent management api
fix: resolve session initialization race condition
docs: update api documentation
refactor: improve message processing performance
test: add integration tests for agent sessions
```

## 📚 Documentation

### Comprehensive Documentation

- **[API Reference](./docs/api.md)** - Complete API documentation
- **[Development Guide](./docs/development.md)** - Development workflows and guidelines
- **[Integration Guide](./docs/integration.md)** - Integration with Promethean ecosystem
- **[Architecture Overview](./docs/architecture.md)** - System architecture and design
- **[Troubleshooting Guide](./docs/troubleshooting.md)** - Common issues and solutions

### Related Project Documentation

- [Promethean Framework Documentation](../../docs/)
- [MCP Integration Guide](../../docs/agile/mcp-reference.md)
- [Kanban Task Management](../../docs/agile/kanban-cli-reference.md)

## 📄 License

GPL-3.0-only - see LICENSE file for details.

## 🔗 Related Packages

- **`@promethean/persistence`**: Dual-store persistence layer
- **`@promethean/ollama-queue`**: Advanced LLM queue management
- **`@promethean/kanban`**: Task management and workflow
- **`@promethean/mcp`**: Model Context Protocol integration

## 📞 Support

- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation
- Join community discussions

---

**Built with ❤️ for the Promethean Cognitive Architecture**