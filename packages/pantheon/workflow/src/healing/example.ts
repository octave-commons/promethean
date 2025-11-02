/**
 * Example usage of the Agent Workflow Healing System
 *
 * This example demonstrates how to set up and use the healing integration
 * to monitor, detect issues, and automatically heal agent workflows.
 */

import type { AgentWorkflowGraph } from '../workflow/types.js';
import { DefaultWorkflowHealingIntegration, type HealingIntegrationConfig } from './integration.js';

// Example workflow definition
const exampleWorkflow: AgentWorkflowGraph = {
  id: 'example-workflow-1',
  nodes: new Map([
    [
      'agent-1',
      {
        id: 'agent-1',
        definition: {
          name: 'Data Processor',
          instructions: 'Process incoming data and transform it',
          model: 'gpt-4',
          tools: [],
        },
        config: {
          name: 'Data Processor',
          instructions: 'Process incoming data and transform it',
          handoffDescription: 'Hands off processed data to validator',
          model: 'gpt-4',
          tools: [],
        },
      },
    ],
    [
      'agent-2',
      {
        id: 'agent-2',
        definition: {
          name: 'Data Validator',
          instructions: 'Validate processed data for quality and consistency',
          model: 'gpt-4',
          tools: [],
        },
        config: {
          name: 'Data Validator',
          instructions: 'Validate processed data for quality and consistency',
          handoffDescription: 'Hands off validated data to output handler',
          model: 'gpt-4',
          tools: [],
        },
      },
    ],
  ]),
  edges: [{ from: 'agent-1', to: 'agent-2', label: 'processed_data' }],
  metadata: {
    name: 'Data Processing Pipeline',
    description: 'Processes and validates incoming data',
    version: '1.0.0',
  },
};

// Example configuration
const healingConfig: HealingIntegrationConfig = {
  // Basic settings from HealingConfig
  enabled: true,
  automationLevel: 'automated',
  detectionInterval: 30000, // 30 seconds
  issueRetentionPeriod: 86400000, // 24 hours
  maxConcurrentHealings: 3,
  healingTimeout: 300000, // 5 minutes
  autoHealThreshold: 0.8,
  requireApprovalFor: ['critical'],
  blacklistStrategies: [],
  rollbackOnError: true,
  enablePredictiveAnalysis: true,
  healthCheckInterval: 60000, // 1 minute
  metricsRetentionPeriod: 604800000, // 7 days

  // Integration configs (from HealingConfig)
  monitoringIntegration: {
    enabled: true,
    metricsEndpoint: 'http://localhost:3000/metrics',
    alertEndpoint: 'http://localhost:3000/alerts',
    healthCheckEndpoint: 'http://localhost:3000/health',
  },
  kanbanIntegration: {
    enabled: true,
    boardId: 'main-board',
    createHealingTasks: true,
    updateTaskStatus: true,
    taskPriority: 'P1',
    customFields: {},
  },
  alertingIntegration: {
    enabled: true,
    channels: [],
    severityThresholds: {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    },
    cooldownPeriod: 300000, // 5 minutes
    escalationPolicy: {
      enabled: true,
      levels: [],
      timeout: 600000, // 10 minutes
    },
  },

  // Additional integration settings (from HealingIntegrationConfig)
  enableKanbanIntegration: true,
  enableMonitoringIntegration: true,
  enableAlertingIntegration: true,
  kanbanBoardId: 'main-board',
  kanbanApiEndpoint: 'http://localhost:3000/kanban',
  createHealingTasks: true,
  healingTaskPriority: 'P1',
  metricsCollectionInterval: 30000, // 30 seconds
  anomalyDetectionSensitivity: 0.7,
  autoHealingEnabled: true,
  autoHealingThreshold: 0.8,

  // Alerting settings
  alertChannels: [
    {
      id: 'slack-alerts',
      type: 'slack',
      config: {
        webhookUrl: 'https://hooks.slack.com/services/...',
        channel: '#alerts',
      },
      enabled: true,
    },
    {
      id: 'email-alerts',
      type: 'email',
      config: {
        smtp: {
          host: 'smtp.example.com',
          port: 587,
          secure: false,
        },
        from: 'alerts@example.com',
        to: ['admin@example.com'],
      },
      enabled: true,
    },
  ],
  alertCooldownPeriod: 300000, // 5 minutes

  // Escalation policy
  escalationPolicy: {
    enabled: true,
    levels: [
      {
        level: 1,
        channels: ['slack-alerts'],
        conditions: [
          {
            field: 'severity',
            operator: 'gte',
            value: 'high',
          },
        ],
      },
      {
        level: 2,
        channels: ['slack-alerts', 'email-alerts'],
        conditions: [
          {
            field: 'severity',
            operator: 'gte',
            value: 'critical',
          },
        ],
      },
    ],
    timeout: 600000, // 10 minutes per level
  },
};

/**
 * Example function demonstrating the healing system setup and usage
 */
export async function runHealingExample(): Promise<void> {
  console.log('🚀 Starting Agent Workflow Healing Example');

  try {
    // 1. Initialize the healing integration
    const healingIntegration = new DefaultWorkflowHealingIntegration();

    console.log('📋 Initializing healing integration...');
    await healingIntegration.initialize(healingConfig);

    // 2. Register the workflow for monitoring and healing
    console.log('📊 Registering workflow for monitoring...');
    await healingIntegration.registerWorkflow(exampleWorkflow);

    // 3. Monitor workflow health
    console.log('🏥 Checking workflow health...');
    const health = await healingIntegration.getWorkflowHealth(exampleWorkflow.id);
    console.log('Workflow Health:', {
      status: health.status,
      overallScore: health.overallScore,
      activeIssues: health.activeIssues.length,
    });

    // 4. Simulate some time passing to allow monitoring to detect issues
    console.log('⏳ Waiting for monitoring to detect issues...');
    await new Promise((resolve) => setTimeout(resolve, 35000)); // 35 seconds

    // 5. Check health again (may show detected issues)
    console.log('🔍 Checking health after monitoring period...');
    const updatedHealth = await healingIntegration.getWorkflowHealth(exampleWorkflow.id);
    console.log('Updated Workflow Health:', {
      status: updatedHealth.status,
      overallScore: updatedHealth.overallScore,
      activeIssues: updatedHealth.activeIssues.length,
      criticalIssues: updatedHealth.criticalIssues.length,
    });

    // 6. If issues detected, attempt healing
    if (updatedHealth.activeIssues.length > 0) {
      console.log('🔧 Issues detected, attempting healing...');
      const healingResults = await healingIntegration.healWorkflow(exampleWorkflow.id);

      console.log(
        'Healing Results:',
        healingResults.map((result) => ({
          success: result.success,
          strategy: result.strategy,
          executionTime: result.executionTime,
          resolvedIssues: result.resolvedIssues.length,
          summary: result.summary,
        })),
      );
    }

    // 7. Get final health status
    console.log('📈 Final health check...');
    const finalHealth = await healingIntegration.getWorkflowHealth(exampleWorkflow.id);
    console.log('Final Workflow Health:', {
      status: finalHealth.status,
      overallScore: finalHealth.overallScore,
      activeIssues: finalHealth.activeIssues.length,
    });

    // 8. Get all workflow health (for multiple workflows)
    console.log('📊 All workflow health status...');
    const allHealth = await healingIntegration.getAllWorkflowHealth();
    console.log(
      'All Workflows Health:',
      Object.keys(allHealth).map((workflowId) => {
        const health = allHealth[workflowId];
        return {
          workflowId,
          status: health?.status || 'unknown',
          score: health?.overallScore || 0,
        };
      }),
    );

    // 9. Update configuration (example)
    console.log('⚙️ Updating configuration...');
    await healingIntegration.updateConfiguration({
      autoHealingThreshold: 0.9, // Increase threshold for more selective healing
      alertCooldownPeriod: 600000, // Increase cooldown to 10 minutes
    });

    // 10. Clean shutdown
    console.log('🛑 Shutting down healing integration...');
    await healingIntegration.unregisterWorkflow(exampleWorkflow.id);
    await healingIntegration.shutdown();

    console.log('✅ Healing example completed successfully!');
  } catch (error) {
    console.error('❌ Healing example failed:', error);
    throw error;
  }
}

/**
 * Example of manual healing for specific issues
 */
export async function manualHealingExample(): Promise<void> {
  console.log('🔧 Starting Manual Healing Example');

  const healingIntegration = new DefaultWorkflowHealingIntegration();
  await healingIntegration.initialize(healingConfig);
  await healingIntegration.registerWorkflow(exampleWorkflow);

  try {
    // Get detailed analysis
    const health = await healingIntegration.analyzeWorkflow(exampleWorkflow.id);
    console.log('Detailed Analysis:', {
      overallHealth: health.overallHealth,
      issueCount: health.issues.length,
      recommendations: health.recommendations.length,
    });

    // Show detected issues
    if (health.issues.length > 0) {
      console.log('Detected Issues:');
      health.issues.forEach((issue: any, index: number) => {
        console.log(`  ${index + 1}. ${issue.title} (${issue.severity})`);
        console.log(`     Type: ${issue.type}`);
        console.log(`     Confidence: ${(issue.confidence * 100).toFixed(1)}%`);
        console.log(`     Description: ${issue.description}`);
      });

      // Manually heal the first issue
      const firstIssue = health.issues[0];
      if (firstIssue) {
        console.log(`🔧 Attempting to heal issue: ${firstIssue.title}`);
        const results = await healingIntegration.healWorkflow(exampleWorkflow.id, firstIssue.id);
        console.log('Manual Healing Results:', results);
      }
    } else {
      console.log('No issues detected for manual healing demonstration');
    }
  } finally {
    await healingIntegration.unregisterWorkflow(exampleWorkflow.id);
    await healingIntegration.shutdown();
  }
}

/**
 * Example of configuration management
 */
export async function configurationExample(): Promise<void> {
  console.log('⚙️ Starting Configuration Example');

  const healingIntegration = new DefaultWorkflowHealingIntegration();

  try {
    // Initialize with basic config
    await healingIntegration.initialize({
      // Basic settings from HealingConfig
      enabled: true,
      automationLevel: 'assisted', // Require manual approval
      detectionInterval: 60000, // 1 minute
      issueRetentionPeriod: 86400000, // 24 hours
      maxConcurrentHealings: 1,
      healingTimeout: 300000, // 5 minutes
      autoHealThreshold: 0.8,
      requireApprovalFor: ['high', 'critical'],
      blacklistStrategies: [],
      rollbackOnError: true,
      enablePredictiveAnalysis: false,
      healthCheckInterval: 120000, // 2 minutes
      metricsRetentionPeriod: 604800000, // 7 days

      // Integration configs (from HealingConfig)
      monitoringIntegration: {
        enabled: false,
        metricsEndpoint: '',
        alertEndpoint: '',
        healthCheckEndpoint: '',
      },
      kanbanIntegration: {
        enabled: false,
        boardId: '',
        createHealingTasks: false,
        updateTaskStatus: false,
        taskPriority: 'P2',
        customFields: {},
      },
      alertingIntegration: {
        enabled: true,
        channels: [],
        severityThresholds: {
          low: 1,
          medium: 2,
          high: 3,
          critical: 4,
        },
        cooldownPeriod: 300000, // 5 minutes
        escalationPolicy: {
          enabled: false,
          levels: [],
          timeout: 600000,
        },
      },

      // Additional integration settings (from HealingIntegrationConfig)
      enableKanbanIntegration: false, // Disable kanban for now
      enableMonitoringIntegration: false,
      enableAlertingIntegration: true,
      kanbanBoardId: '',
      kanbanApiEndpoint: '',
      createHealingTasks: false,
      healingTaskPriority: 'P2',
      metricsCollectionInterval: 60000, // 1 minute
      anomalyDetectionSensitivity: 0.5,
      autoHealingEnabled: false, // Disable auto-healing
      autoHealingThreshold: 0.8,
      alertChannels: [],
      alertCooldownPeriod: 300000, // 5 minutes
      escalationPolicy: {
        enabled: false,
        levels: [],
        timeout: 600000,
      },
    });

    // Get current configuration
    const currentConfig = await healingIntegration.getConfiguration();
    console.log('Current Configuration:', {
      automationLevel: currentConfig.automationLevel,
      autoHealingEnabled: currentConfig.autoHealingEnabled,
      kanbanIntegration: currentConfig.enableKanbanIntegration,
      alertingIntegration: currentConfig.enableAlertingIntegration,
    });

    // Update configuration
    console.log('Updating configuration...');
    await healingIntegration.updateConfiguration({
      automationLevel: 'automated',
      autoHealingEnabled: true,
      autoHealingThreshold: 0.7, // Lower threshold
      enableKanbanIntegration: true,
      kanbanBoardId: 'workflow-healing-board',
    });

    // Verify updated configuration
    const updatedConfig = await healingIntegration.getConfiguration();
    console.log('Updated Configuration:', {
      automationLevel: updatedConfig.automationLevel,
      autoHealingEnabled: updatedConfig.autoHealingEnabled,
      autoHealingThreshold: updatedConfig.autoHealingThreshold,
      kanbanIntegration: updatedConfig.enableKanbanIntegration,
      kanbanBoardId: updatedConfig.kanbanBoardId,
    });
  } finally {
    await healingIntegration.shutdown();
  }
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runHealingExample()
    .then(() => console.log('Example completed successfully'))
    .catch((error) => {
      console.error('Example failed:', error);
      process.exit(1);
    });
}
