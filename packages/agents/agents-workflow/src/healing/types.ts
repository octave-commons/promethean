/**
 * Types for Agent Workflow Healing System
 */

import type { AgentWorkflowGraph } from '../workflow/types.js';

// Basic monitoring types (will be expanded when integration is complete)
export interface AgentPerformanceMetrics {
  readonly agentId: string;
  readonly agentType: string;
  readonly executionTime: number;
  readonly memoryUsage: number;
  readonly cpuUsage: number;
  readonly status: 'success' | 'error' | 'timeout';
  readonly errorType?: string;
  readonly timestamp: number;
}

export interface AlertEvent {
  readonly id: string;
  readonly ruleId: string;
  readonly metricName: string;
  readonly currentValue: number;
  readonly threshold: number;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly message: string;
  readonly timestamp: number;
  readonly resolved: boolean;
  readonly resolvedAt?: number;
}

export interface HealthCheck {
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly timestamp: number;
  readonly checks: ReadonlyArray<{
    readonly name: string;
    readonly status: 'pass' | 'fail' | 'warn';
    readonly message?: string;
    readonly duration: number;
  }>;
  readonly uptime: number;
}

// Healing System Core Types
export interface WorkflowHealer {
  // Core healing operations
  analyzeWorkflow(workflow: AgentWorkflowGraph): Promise<HealingAnalysis>;
  detectIssues(workflow: AgentWorkflowGraph): Promise<WorkflowIssue[]>;
  applyHealing(workflowId: string, issue: WorkflowIssue): Promise<HealingResult>;

  // Monitoring integration
  startMonitoring(workflowId: string): Promise<void>;
  stopMonitoring(workflowId: string): Promise<void>;
  getHealthStatus(workflowId: string): Promise<WorkflowHealth>;

  // Configuration
  configureHealing(config: HealingConfig): Promise<void>;
  getHealingStrategies(): Promise<HealingStrategy[]>;
}

export interface HealingAnalysis {
  workflowId: string;
  timestamp: Date;
  overallHealth: 'healthy' | 'degraded' | 'critical' | 'failed';
  issues: WorkflowIssue[];
  recommendations: HealingRecommendation[];
  metrics: WorkflowHealingMetrics;
  nextCheckTime: Date;
}

export interface WorkflowIssue {
  id: string;
  workflowId: string;
  type: IssueType;
  severity: IssueSeverity;
  title: string;
  description: string;

  // Detection info
  detectedAt: Date;
  detectionMethod: DetectionMethod;
  confidence: number; // 0-1

  // Impact assessment
  affectedNodes: string[];
  affectedAgents: string[];
  impactAssessment: ImpactAssessment;

  // Context
  context: IssueContext;
  metadata: Record<string, unknown>;

  // Status
  status: IssueStatus;
  healingAttempts: HealingAttempt[];
  resolvedAt?: Date;
}

export type IssueType =
  | 'agent_failure'
  | 'workflow_deadlock'
  | 'resource_exhaustion'
  | 'communication_failure'
  | 'performance_degradation'
  | 'timeout_exceeded'
  | 'dependency_failure'
  | 'configuration_error'
  | 'security_violation'
  | 'data_corruption'
  | 'memory_leak'
  | 'cascade_failure';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus =
  | 'detected'
  | 'analyzing'
  | 'healing'
  | 'resolved'
  | 'failed'
  | 'escalated';

export interface ImpactAssessment {
  businessImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  userImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  systemImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  estimatedDowntime: number; // minutes
  affectedUsers: number;
  financialImpact?: number;
}

export interface IssueContext {
  workflowState: Record<string, unknown>;
  environmentVariables: Record<string, string>;
  systemMetrics: Partial<AgentPerformanceMetrics>;
  recentEvents: WorkflowEvent[];
  dependencies: DependencyStatus[];
  configuration: Record<string, unknown>;
}

export interface WorkflowEvent {
  id: string;
  type: string;
  timestamp: Date;
  source: string;
  data: Record<string, unknown>;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface DependencyStatus {
  name: string;
  type: 'agent' | 'service' | 'resource' | 'external';
  status: 'healthy' | 'degraded' | 'failed';
  lastCheck: Date;
  responseTime?: number;
  errorRate?: number;
}

export interface HealingAttempt {
  id: string;
  strategy: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: HealingResult;
  error?: string;
  metadata: Record<string, unknown>;
}

export interface HealingResult {
  success: boolean;
  strategy: string;
  executionTime: number; // milliseconds
  changes: WorkflowChange[];
  sideEffects: SideEffect[];
  newIssues: string[]; // IDs of new issues created
  resolvedIssues: string[]; // IDs of issues resolved
  metrics: HealingMetrics;
  summary: string;
}

export interface WorkflowChange {
  type:
    | 'agent_restart'
    | 'configuration_update'
    | 'resource_reallocation'
    | 'workflow_restructure'
    | 'dependency_update';
  target: string;
  previousValue: unknown;
  newValue: unknown;
  timestamp: Date;
  rollbackPossible: boolean;
}

export interface SideEffect {
  type: 'performance_impact' | 'resource_change' | 'state_change' | 'communication_change';
  description: string;
  severity: 'positive' | 'negative' | 'neutral';
  impact: string;
  temporary: boolean;
}

export interface HealingMetrics {
  executionTime: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    network: number;
  };
  successProbability: number;
  confidence: number;
  riskScore: number;
}

export interface HealingRecommendation {
  id: string;
  type: RecommendationType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  prerequisites: string[];
  steps: RecommendationStep[];
  estimatedTime: number; // minutes
  confidence: number; // 0-1
}

export type RecommendationType =
  | 'preventive'
  | 'corrective'
  | 'adaptive'
  | 'optimization'
  | 'security'
  | 'performance';

export interface RecommendationStep {
  order: number;
  action: string;
  description: string;
  expectedResult: string;
  rollbackAction?: string;
  estimatedTime: number; // minutes
}

// Healing Strategies
export interface HealingStrategy {
  id: string;
  name: string;
  description: string;
  type: StrategyType;
  supportedIssues: IssueType[];

  // Strategy configuration
  config: StrategyConfig;
  parameters: StrategyParameter[];

  // Execution
  executor: string; // Function name or reference
  timeout: number; // milliseconds
  retryPolicy: RetryPolicy;

  // Safety
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  prerequisites: string[];
  sideEffects: SideEffect[];
  rollbackSupported: boolean;

  // Performance
  successRate: number;
  averageExecutionTime: number;
  lastUsed?: Date;
}

export type StrategyType =
  | 'restart'
  | 'reconfigure'
  | 'scale'
  | 'reroute'
  | 'degrade'
  | 'isolate'
  | 'repair'
  | 'rebuild'
  | 'escalate';

export interface StrategyConfig {
  automated: boolean;
  requiresApproval: boolean;
  maxConcurrentExecutions: number;
  cooldownPeriod: number; // milliseconds
  successThreshold: number; // 0-1
}

export interface StrategyParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  defaultValue: unknown;
  description: string;
  validation?: ParameterValidation;
}

export interface ParameterValidation {
  min?: number;
  max?: number;
  pattern?: RegExp;
  allowedValues?: unknown[];
  custom?: string; // Validation function name
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  multiplier?: number; // For exponential backoff
}

// Workflow Health
export interface WorkflowHealth {
  workflowId: string;
  timestamp: Date;
  status: 'healthy' | 'degraded' | 'critical' | 'failed';

  // Health scores
  overallScore: number; // 0-100
  componentScores: ComponentHealthScores;

  // Active issues
  activeIssues: string[]; // Issue IDs
  criticalIssues: string[];

  // Metrics
  performance: WorkflowPerformanceMetrics;
  availability: AvailabilityMetrics;
  reliability: ReliabilityMetrics;

  // Trends
  trends: HealthTrends;
  predictions: HealthPredictions;
}

export interface ComponentHealthScores {
  agents: number;
  communication: number;
  resources: number;
  dependencies: number;
  configuration: number;
  security: number;
}

export interface WorkflowPerformanceMetrics {
  averageExecutionTime: number;
  throughput: number;
  errorRate: number;
  resourceUtilization: number;
  responseTime: number;
}

export interface AvailabilityMetrics {
  uptime: number; // percentage
  downtime: number; // minutes in last period
  mtbf: number; // mean time between failures
  mttr: number; // mean time to repair
}

export interface ReliabilityMetrics {
  successRate: number;
  failureRate: number;
  cascadeFailureRate: number;
  recoveryRate: number;
}

export interface HealthTrends {
  performance: 'improving' | 'stable' | 'degrading';
  availability: 'improving' | 'stable' | 'degrading';
  reliability: 'improving' | 'stable' | 'degrading';
  issueFrequency: 'decreasing' | 'stable' | 'increasing';
}

export interface HealthPredictions {
  nextFailureProbability: number; // 0-1
  estimatedTimeToFailure: number; // minutes
  recommendedActions: string[];
  riskFactors: RiskFactor[];
}

export interface RiskFactor {
  factor: string;
  impact: number; // 0-1
  probability: number; // 0-1
  mitigation: string;
}

// Healing Configuration
export interface HealingConfig {
  enabled: boolean;
  automationLevel: 'manual' | 'assisted' | 'automated';

  // Detection
  detectionInterval: number; // milliseconds
  issueRetentionPeriod: number; // milliseconds

  // Healing
  maxConcurrentHealings: number;
  healingTimeout: number; // milliseconds
  autoHealThreshold: number; // 0-1, confidence threshold for auto-healing

  // Safety
  requireApprovalFor: IssueSeverity[];
  blacklistStrategies: string[];
  rollbackOnError: boolean;

  // Monitoring
  enablePredictiveAnalysis: boolean;
  healthCheckInterval: number; // milliseconds
  metricsRetentionPeriod: number; // milliseconds

  // Integration
  monitoringIntegration: MonitoringIntegrationConfig;
  kanbanIntegration: KanbanIntegrationConfig;
  alertingIntegration: AlertingIntegrationConfig;
}

export interface MonitoringIntegrationConfig {
  enabled: boolean;
  metricsEndpoint: string;
  alertEndpoint: string;
  healthCheckEndpoint: string;
  authentication?: {
    type: 'bearer' | 'basic';
    token?: string;
    username?: string;
    password?: string;
  };
}

export interface KanbanIntegrationConfig {
  enabled: boolean;
  boardId: string;
  createHealingTasks: boolean;
  updateTaskStatus: boolean;
  taskPriority: 'P0' | 'P1' | 'P2' | 'P3';
  assignToAgent?: string;
  customFields: Record<string, string>;
}

export interface AlertingIntegrationConfig {
  enabled: boolean;
  channels: AlertChannel[];
  severityThresholds: Record<IssueSeverity, number>;
  cooldownPeriod: number; // milliseconds
  escalationPolicy: EscalationPolicy;
}

export interface AlertChannel {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'sms';
  config: Record<string, unknown>;
  enabled: boolean;
}

export interface EscalationPolicy {
  enabled: boolean;
  levels: EscalationLevel[];
  timeout: number; // milliseconds per level
}

export interface EscalationLevel {
  level: number;
  channels: string[]; // Channel IDs
  conditions: EscalationCondition[];
}

export interface EscalationCondition {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: unknown;
}

// Detection Methods
export type DetectionMethod =
  | 'metric_threshold'
  | 'pattern_matching'
  | 'anomaly_detection'
  | 'health_check'
  | 'dependency_check'
  | 'log_analysis'
  | 'user_report'
  | 'external_alert';

// Workflow Healing Metrics
export interface WorkflowHealingMetrics {
  // Issue metrics
  totalIssues: number;
  criticalIssues: number;
  resolvedIssues: number;
  averageResolutionTime: number;

  // Healing metrics
  healingAttempts: number;
  successfulHealings: number;
  healingSuccessRate: number;
  averageHealingTime: number;

  // Performance metrics
  workflowUptime: number;
  averageExecutionTime: number;
  errorRate: number;

  // System metrics
  resourceUtilization: number;
  alertFrequency: number;
  falsePositiveRate: number;
}

// Utility Types
export type DetectionMethodConfig = Record<
  DetectionMethod,
  {
    enabled: boolean;
    sensitivity: number; // 0-1
    threshold?: number;
    parameters: Record<string, unknown>;
  }
>;
