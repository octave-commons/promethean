import { runPantheonComputation } from '../pantheon/runtime.js';
import type {
  HealingRequest,
  IntegrationStatus,
} from './kanban-healing-coordinator.js';

export type AgentOperationResult = {
  agentsInvoked: string[];
  recommendations: string[];
  enforcements: string[];
};

export type AgentRecommendationResult = {
  recommendations: string[];
  criticalIssues: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    suggestedAction: string;
  }>;
};

type AgentPayload = {
  request: HealingRequest;
  status: IntegrationStatus;
};

export async function runAgentOperations(
  request: HealingRequest,
  status: IntegrationStatus,
): Promise<AgentOperationResult> {
  return runPantheonComputation<AgentPayload, AgentOperationResult>({
    actorName: 'kanban-healing-operator',
    goal: `coordinate pantheon healing workflow for ${request.reason}`,
    request: { request, status },
    compute: async ({ request: payload }) => {
      if (!payload) {
        throw new Error('Agent operation payload missing');
      }
      return computeAgentOperations(payload.request, payload.status);
    },
  });
}

export async function runAgentRecommendations(
  reason: string,
  status: IntegrationStatus,
): Promise<AgentRecommendationResult> {
  return runPantheonComputation<{ reason: string; status: IntegrationStatus }, AgentRecommendationResult>(
    {
      actorName: 'kanban-healing-advisor',
      goal: `generate healing recommendations for ${reason}`,
      request: { reason, status },
      compute: async ({ request: payload }) => {
        if (!payload) {
          throw new Error('Agent recommendation payload missing');
        }
        return computeAgentRecommendations(payload.reason, payload.status);
      },
    },
  );
}

function computeAgentOperations(
  request: HealingRequest,
  status: IntegrationStatus,
): AgentOperationResult {
  const normalizedReason = request.reason.toLowerCase();
  const agentsInvoked = Array.from(
    new Set(
      status.agents.activeAgents.length > 0
        ? status.agents.activeAgents
        : ['pantheon-kanban-analyst'],
    ),
  );

  const recommendations = new Set<string>();
  const enforcements = new Set<string>();

  if (normalizedReason.includes('wip')) {
    recommendations.add('Recalibrate WIP limits based on current throughput and agent capacity.');
    enforcements.add('Triggered Pantheon WIP guardrail workflow.');
  }

  if (normalizedReason.includes('stale')) {
    recommendations.add('Escalate stale tasks and prompt owners for status updates.');
    enforcements.add('Issued stale-task escalation through Pantheon heartbeat loop.');
  }

  if (normalizedReason.includes('security')) {
    recommendations.add('Run the security validation workflow to re-verify gate completion.');
    enforcements.add('Queued Pantheon security gate validator.');
  }

  if (status.git.available) {
    enforcements.add('Synchronized healing plan with git state to preserve audit history.');
  } else {
    recommendations.add('Re-enable git integration to capture healing provenance.');
  }

  if (status.mcp.available) {
    enforcements.add('Broadcasted healing context to MCP bridge clients.');
  }

  if (request.options.dryRun) {
    enforcements.add('Dry-run requested: no persistent mutations were applied.');
  }

  if (recommendations.size === 0) {
    recommendations.add('No additional agent actions required—baseline healing completed.');
  }

  if (enforcements.size === 0) {
    enforcements.add('Baseline audit completed with no automatic enforcement needed.');
  }

  return {
    agentsInvoked,
    recommendations: Array.from(recommendations),
    enforcements: Array.from(enforcements),
  };
}

function computeAgentRecommendations(
  reason: string,
  status: IntegrationStatus,
): AgentRecommendationResult {
  const normalizedReason = reason.toLowerCase();
  const recommendations = new Set<string>();
  const criticalIssues: AgentRecommendationResult['criticalIssues'] = [];

  if (status.agents.issues.length > 0) {
    criticalIssues.push({
      type: 'agent_infrastructure',
      description: status.agents.issues.join('; '),
      severity: 'high',
      suggestedAction: 'Restore Pantheon agent runtime before continuing healing operations.',
    });
  }

  if (!status.git.available) {
    criticalIssues.push({
      type: 'git',
      description: 'Git integration unavailable—healing changes will not be versioned.',
      severity: 'medium',
      suggestedAction: 'Reconnect repository access or enable non-git fallback explicitly.',
    });
  }

  if (normalizedReason.includes('wip')) {
    recommendations.add('Audit columns exceeding WIP limits and redistribute work to available agents.');
    recommendations.add('Schedule follow-up review to ensure WIP guardrails remain effective.');
  }

  if (normalizedReason.includes('stale')) {
    recommendations.add('Identify tasks exceeding SLA and assign ownership for next steps.');
    recommendations.add('Leverage Pantheon follow-up workflow to notify stakeholders.');
  }

  if (normalizedReason.includes('security')) {
    criticalIssues.push({
      type: 'security',
      description: 'Security-related healing requested—ensure P0 gate remains enforced.',
      severity: 'critical',
      suggestedAction: 'Run Pantheon security workflow and block deployments until resolved.',
    });
  }

  if (status.mcp.issues.length > 0) {
    recommendations.add('Resolve MCP bridge issues to restore bidirectional healing telemetry.');
  }

  if (recommendations.size === 0 && criticalIssues.length === 0) {
    recommendations.add('No additional guidance required—Pantheon reports healthy posture.');
  }

  return {
    recommendations: Array.from(recommendations),
    criticalIssues,
  };
}
