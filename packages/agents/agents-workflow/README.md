# @promethean-os/agents-workflow

> _Automated workflow orchestration and self-healing for AI agent systems_

A comprehensive workflow management system that provides automated detection, analysis, and recovery from issues in AI agent workflows. Integrates monitoring, alerting, and recovery mechanisms to ensure robust and reliable agent execution.

## 🚀 Features

### 🔄 Workflow Orchestration

- Define complex agent workflows as directed graphs
- Support for conditional branching and parallel execution
- Dynamic workflow modification at runtime
- Provider-agnostic agent execution

### 🛡️ Self-Healing System

- **Automated Issue Detection**: Agent failures, resource exhaustion, performance degradation
- **Intelligent Recovery**: Agent restarts, resource scaling, configuration updates, workflow rerouting
- **Rollback Support**: Safe recovery with automatic rollback on failure
- **Confidence Scoring**: ML-based confidence assessment for healing actions

### 📊 Real-time Monitoring

- Comprehensive health monitoring with 0-100 scoring
- Performance metrics tracking (execution time, throughput, error rates)
- Resource utilization monitoring (CPU, memory, network)
- Anomaly detection and trend analysis

### 🔌 Provider Integration

- **OpenAI**: GPT models with advanced configuration
- **Ollama**: Local model execution with full control
- **Extensible Architecture**: Easy addition of new providers
- **Unified Interface**: Consistent API across all providers

### 📋 Kanban Integration

- Automatic task creation for healing actions
- Status updates and progress tracking
- Priority-based task management
- Custom field mapping and workflow integration

## 📦 Installation

```bash
pnpm add @promethean-os/agents-workflow
```

## 🏃‍♂️ Quick Start

```typescript
import {
  DefaultWorkflowHealingIntegration,
  AgentWorkflowGraph,
  OllamaProvider,
} from '@promethean-os/agents-workflow';

// Initialize providers
const ollamaProvider = new OllamaProvider({
  baseUrl: 'http://localhost:11434',
  defaultModel: 'llama2',
});

// Define workflow
const workflow: AgentWorkflowGraph = {
  id: 'data-processing-pipeline',
  name: 'Data Processing Pipeline',
  agents: [
    {
      id: 'extractor',
      name: 'Data Extractor',
      type: 'data-extraction',
      provider: ollamaProvider,
      config: {
        model: 'llama2',
        maxTokens: 1000,
        temperature: 0.1,
      },
    },
    {
      id: 'processor',
      name: 'Data Processor',
      type: 'data-processing',
      provider: ollamaProvider,
      config: {
        model: 'llama2',
        maxTokens: 2000,
        temperature: 0.3,
      },
    },
    {
      id: 'loader',
      name: 'Data Loader',
      type: 'data-loading',
      provider: ollamaProvider,
      config: {
        model: 'llama2',
        maxTokens: 500,
        temperature: 0.1,
      },
    },
  ],
  connections: [
    { from: 'extractor', to: 'processor' },
    { from: 'processor', to: 'loader' },
  ],
};

// Initialize healing system
const healing = new DefaultWorkflowHealingIntegration();

// Configure healing settings
const config = {
  enabled: true,
  automationLevel: 'automated' as const,
  autoHealingEnabled: true,
  autoHealingThreshold: 0.8,
  enableKanbanIntegration: true,
  enableAlertingIntegration: true,
  healthCheckInterval: 30000, // 30 seconds
  detectionInterval: 10000, // 10 seconds
  maxConcurrentHealings: 3,
};

// Start the system
await healing.initialize(config);
await healing.registerWorkflow(workflow);

// Monitor health
const health = await healing.getWorkflowHealth(workflow.id);
console.log(`Workflow health: ${health.status} (${health.overallScore}/100)`);

// Auto-healing will run automatically based on configuration
```

## 🔧 Configuration

### Basic Configuration

```typescript
interface HealingIntegrationConfig {
  // Core settings
  enabled: boolean;
  automationLevel: 'manual' | 'assisted' | 'automated';
  autoHealingEnabled: boolean;
  autoHealingThreshold: number; // 0-1

  // Timing
  detectionInterval: number; // milliseconds
  healthCheckInterval: number; // milliseconds
  healingTimeout: number; // milliseconds

  // Limits
  maxConcurrentHealings: number;
  requireApprovalFor: IssueSeverity[];
}
```

### Provider Configuration

#### Ollama Provider

```typescript
const ollamaProvider = new OllamaProvider({
  baseUrl: 'http://localhost:11434',
  defaultModel: 'llama2',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
});
```

#### OpenAI Provider

```typescript
import { OpenAIProvider } from '@promethean-os/agents-workflow/providers';

const openaiProvider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  defaultModel: 'gpt-4',
  organization: 'org-id',
  maxRetries: 3,
  timeout: 60000,
});
```

## 🩺 Healing Strategies

### 1. Agent Restart

- **Use Case**: Failed or unresponsive agents
- **Risk Level**: Medium
- **Success Rate**: ~80%
- **Rollback**: Supported

### 2. Resource Scaling

- **Use Case**: Resource exhaustion or performance degradation
- **Risk Level**: Low
- **Success Rate**: ~90%
- **Rollback**: Supported

### 3. Configuration Update

- **Use Case**: Configuration errors or optimization needs
- **Risk Level**: Low-Medium
- **Success Rate**: ~85%
- **Rollback**: Supported

### 4. Workflow Reroute

- **Use Case**: Communication failures or dependency issues
- **Risk Level**: Medium
- **Success Rate**: ~75%
- **Rollback**: Supported

## 📈 Issue Types

| Issue Type                | Description                | Severity | Auto-Healable |
| ------------------------- | -------------------------- | -------- | ------------- |
| `agent_failure`           | Agent stopped responding   | High     | ✅            |
| `workflow_deadlock`       | Circular dependencies      | Critical | ⚠️            |
| `resource_exhaustion`     | High CPU/memory usage      | High     | ✅            |
| `communication_failure`   | Agent communication issues | Medium   | ✅            |
| `performance_degradation` | Slow execution             | Medium   | ✅            |
| `timeout_exceeded`        | Operations timing out      | High     | ✅            |
| `dependency_failure`      | External service failures  | High     | ⚠️            |
| `configuration_error`     | Invalid configuration      | Medium   | ✅            |
| `security_violation`      | Security policy breaches   | Critical | ❌            |
| `memory_leak`             | Continuous memory growth   | Medium   | ✅            |
| `cascade_failure`         | Multiple related failures  | Critical | ⚠️            |

## 🔍 Health Monitoring

### Health Scores

The system provides comprehensive health monitoring with component-specific scoring:

```typescript
interface WorkflowHealth {
  workflowId: string;
  status: 'healthy' | 'degraded' | 'critical' | 'failed';
  overallScore: number; // 0-100

  componentScores: {
    agents: number; // Agent health
    communication: number; // Communication health
    resources: number; // Resource health
    dependencies: number; // Dependency health
    configuration: number; // Configuration health
    security: number; // Security health
  };

  activeIssues: string[];
  criticalIssues: string[];

  performance: {
    averageExecutionTime: number;
    throughput: number;
    errorRate: number;
    resourceUtilization: number;
  };
}
```

## 📚 API Reference

### Main Integration Class

```typescript
class DefaultWorkflowHealingIntegration {
  // Lifecycle
  async initialize(config: HealingIntegrationConfig): Promise<void>;
  async shutdown(): Promise<void>;

  // Workflow management
  async registerWorkflow(workflow: AgentWorkflowGraph): Promise<void>;
  async unregisterWorkflow(workflowId: string): Promise<void>;

  // Healing operations
  async analyzeWorkflow(workflowId: string): Promise<WorkflowHealth>;
  async healWorkflow(workflowId: string, issueId?: string): Promise<HealingResult[]>;

  // Monitoring
  async getWorkflowHealth(workflowId: string): Promise<WorkflowHealth>;
  async getAllWorkflowHealth(): Promise<Record<string, WorkflowHealth>>;

  // Configuration
  async updateConfiguration(config: Partial<HealingIntegrationConfig>): Promise<void>;
  async getConfiguration(): Promise<HealingIntegrationConfig>;
}
```

## 🎯 Best Practices

### 1. Configuration

- Start with `automationLevel: 'assisted'` to review healing actions
- Set appropriate `autoHealingThreshold` (0.7-0.9 recommended)
- Configure alert channels for critical issues
- Enable rollback for high-risk strategies

### 2. Monitoring

- Set reasonable health check intervals (30-60 seconds)
- Configure anomaly detection sensitivity based on workload
- Monitor healing success rates and adjust strategies
- Track false positive rates

### 3. Security

- Require approval for critical severity issues
- Implement proper authentication for external integrations
- Regularly review and update security policies
- Audit healing actions and rollbacks

### 4. Performance

- Limit concurrent healing operations
- Set appropriate timeouts for healing strategies
- Monitor resource usage during healing
- Optimize alerting to reduce noise

## 🧪 Testing

```bash
# Run tests
pnpm --filter @promethean-os/agents-workflow test

# Run with coverage
pnpm --filter @promethean-os/agents-workflow coverage

# Type checking
pnpm --filter @promethean-os/agents-workflow typecheck

# Linting
pnpm --filter @promethean-os/agents-workflow lint
```

## 🔧 Development

```bash
# Build the package
pnpm --filter @promethean-os/agents-workflow build

# Watch mode for development
pnpm --filter @promethean-os/agents-workflow build --watch

# Clean build artifacts
pnpm --filter @promethean-os/agents-workflow clean
```

## 📖 Examples

See the `src/healing/example.ts` file for comprehensive usage examples including:

- Basic setup and configuration
- Manual healing operations
- Configuration management
- Multi-workflow scenarios
- Custom healing strategies

## 🤝 Contributing

When contributing to the agents-workflow package:

1. **Add comprehensive tests** for new features
2. **Update documentation** for new functionality
3. **Follow existing code patterns** and naming conventions
4. **Include error handling** and rollback mechanisms
5. **Add appropriate logging** and metrics
6. **Ensure type safety** - avoid `any` types
7. **Test security implications** of changes

## 📄 License

This project is licensed under the GPL-3.0 License.

## 🔗 Related Packages

- `@promethean-os/kanban` - Task management integration
- `@promethean-os/agents-core` - Core agent functionality
- `@promethean-os/monitoring` - System monitoring capabilities

## 🆘 Support

For issues and questions:

1. Check the [healing system documentation](./src/healing/README.md)
2. Review existing [GitHub issues](https://github.com/promethean-os/promethean/issues)
3. Create new issues with detailed reproduction steps
4. Join our [Discord community](https://discord.gg/promethean)
