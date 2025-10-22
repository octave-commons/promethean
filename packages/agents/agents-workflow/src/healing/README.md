# Agent Workflow Healing System

The Agent Workflow Healing System provides automated detection, analysis, and recovery from issues in agent workflows. It integrates monitoring, alerting, and recovery mechanisms to ensure robust and reliable workflow execution.

## Overview

The healing system consists of several key components:

- **WorkflowHealer**: Core healing logic and issue detection
- **WorkflowMonitor**: Metrics collection and anomaly detection
- **RecoveryManager**: Automated recovery execution and rollback
- **WorkflowHealingIntegration**: Main integration layer

## Features

### 🔍 Issue Detection

- Agent failure detection
- Performance degradation monitoring
- Resource exhaustion detection
- Memory leak detection
- Dependency failure analysis
- Timeout detection

### 🔧 Automated Healing

- Agent restart strategies
- Resource scaling
- Configuration updates
- Workflow rerouting
- Isolation and repair mechanisms

### 📊 Monitoring & Alerting

- Real-time metrics collection
- Health status monitoring
- Anomaly detection
- Multi-channel alerting (Slack, Email, Webhooks)
- Escalation policies

### 🎯 Kanban Integration

- Automatic task creation for healing actions
- Status updates and progress tracking
- Custom field mapping
- Priority-based task management

## Quick Start

```typescript
import { DefaultWorkflowHealingIntegration } from '@promethean/agents-workflow/healing';

// Initialize the healing system
const healing = new DefaultWorkflowHealingIntegration();

// Configure healing settings
const config = {
  enabled: true,
  automationLevel: 'automated',
  autoHealingEnabled: true,
  autoHealingThreshold: 0.8,
  enableKanbanIntegration: true,
  enableAlertingIntegration: true,
  kanbanBoardId: 'main-board',
  alertChannels: [
    {
      id: 'slack',
      type: 'slack',
      config: { webhookUrl: 'https://hooks.slack.com/...' },
      enabled: true,
      severityFilter: ['high', 'critical'],
    },
  ],
};

// Initialize and register workflow
await healing.initialize(config);
await healing.registerWorkflow(myWorkflow);

// Monitor health
const health = await healing.getWorkflowHealth(myWorkflow.id);
console.log('Workflow health:', health.status, health.overallScore);

// Auto-healing will run automatically based on configuration
```

## Configuration

### Basic Settings

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

### Alerting Configuration

```typescript
const alertConfig = {
  alertChannels: [
    {
      id: 'slack-alerts',
      type: 'slack',
      config: {
        webhookUrl: 'https://hooks.slack.com/services/...',
        channel: '#alerts',
        username: 'Healing Bot',
      },
      enabled: true,
      severityFilter: ['high', 'critical'],
    },
    {
      id: 'email-alerts',
      type: 'email',
      config: {
        smtp: { host: 'smtp.example.com', port: 587 },
        from: 'alerts@example.com',
        to: ['admin@example.com'],
      },
      enabled: true,
      severityFilter: ['critical'],
    },
  ],
  escalationPolicy: {
    enabled: true,
    levels: [
      {
        level: 1,
        channels: ['slack-alerts'],
        conditions: [{ severity: 'high', duration: 600000, unresolvedIssues: 1 }],
      },
      {
        level: 2,
        channels: ['slack-alerts', 'email-alerts'],
        conditions: [{ severity: 'critical', duration: 300000, unresolvedIssues: 1 }],
      },
    ],
    timeoutPerLevel: 600000,
  },
};
```

### Kanban Integration

```typescript
const kanbanConfig = {
  enableKanbanIntegration: true,
  kanbanBoardId: 'workflow-healing-board',
  createHealingTasks: true,
  healingTaskPriority: 'P1',
  customFields: {
    'workflow-id': '{{workflowId}}',
    'issue-type': '{{issueType}}',
    severity: '{{severity}}',
  },
};
```

## Healing Strategies

The system supports multiple healing strategies:

### 1. Agent Restart

- **Use Case**: Failed or unresponsive agents
- **Risk Level**: Medium
- **Success Rate**: ~80%
- **Rollback**: Supported

```typescript
// Strategy configuration
{
  id: 'agent_restart',
  name: 'Agent Restart',
  type: 'restart',
  supportedIssues: ['agent_failure', 'timeout_exceeded'],
  parameters: [
    {
      name: 'gracefulShutdown',
      type: 'boolean',
      defaultValue: true,
      description: 'Attempt graceful shutdown before force restart',
    },
  ],
}
```

### 2. Resource Scaling

- **Use Case**: Resource exhaustion or performance degradation
- **Risk Level**: Low
- **Success Rate**: ~90%
- **Rollback**: Supported

```typescript
{
  id: 'resource_scaling',
  name: 'Resource Scaling',
  type: 'scale',
  supportedIssues: ['resource_exhaustion', 'performance_degradation'],
  parameters: [
    {
      name: 'scaleFactor',
      type: 'number',
      defaultValue: 1.5,
      description: 'Factor by which to scale resources',
    },
  ],
}
```

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

## Issue Types

The system can detect and heal various issue types:

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

## Health Monitoring

### Health Scores

The system provides comprehensive health monitoring:

```typescript
interface WorkflowHealth {
  workflowId: string;
  status: 'healthy' | 'degraded' | 'critical' | 'failed';
  overallScore: number; // 0-100

  // Component scores
  componentScores: {
    agents: number; // Agent health
    communication: number; // Communication health
    resources: number; // Resource health
    dependencies: number; // Dependency health
    configuration: number; // Configuration health
    security: number; // Security health
  };

  // Active issues
  activeIssues: string[];
  criticalIssues: string[];

  // Metrics
  performance: {
    averageExecutionTime: number;
    throughput: number;
    errorRate: number;
    resourceUtilization: number;
  };

  availability: {
    uptime: number;
    downtime: number;
    mtbf: number; // Mean time between failures
    mttr: number; // Mean time to repair
  };
}
```

### Health Trends

The system tracks health trends over time:

```typescript
interface HealthTrends {
  performance: 'improving' | 'stable' | 'degrading';
  availability: 'improving' | 'stable' | 'degrading';
  reliability: 'improving' | 'stable' | 'degrading';
  issueFrequency: 'decreasing' | 'stable' | 'increasing';
}
```

## API Reference

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

### Healing Result

```typescript
interface HealingResult {
  success: boolean;
  strategy: string;
  executionTime: number;
  changes: WorkflowChange[];
  sideEffects: SideEffect[];
  newIssues: string[];
  resolvedIssues: string[];
  metrics: {
    executionTime: number;
    resourceUsage: { cpu: number; memory: number; network: number };
    successProbability: number;
    confidence: number;
    riskScore: number;
  };
  summary: string;
}
```

## Best Practices

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

## Troubleshooting

### Common Issues

1. **Healing not triggering**

   - Check `autoHealingEnabled` and `autoHealingThreshold`
   - Verify monitoring is active
   - Check issue confidence levels

2. **High false positive rate**

   - Adjust anomaly detection sensitivity
   - Review detection thresholds
   - Increase minimum confidence requirements

3. **Healing failures**

   - Check strategy configuration
   - Verify resource availability
   - Review rollback mechanisms

4. **Alert fatigue**
   - Adjust severity filters
   - Implement cooldown periods
   - Fine-tune escalation policies

### Debug Mode

Enable debug logging:

```typescript
const config = {
  ...otherConfig,
  debug: true,
  logLevel: 'debug',
};
```

### Metrics and Monitoring

Monitor key metrics:

- Healing success rate
- Average healing time
- False positive rate
- Resource usage during healing
- Alert frequency

## Examples

See `example.ts` for comprehensive usage examples including:

- Basic setup and configuration
- Manual healing operations
- Configuration management
- Multi-workflow scenarios

## Contributing

When contributing to the healing system:

1. Add comprehensive tests for new strategies
2. Update documentation for new features
3. Follow existing code patterns and naming conventions
4. Include error handling and rollback mechanisms
5. Add appropriate logging and metrics

## License

This project is licensed under the GPL-3.0 License.
