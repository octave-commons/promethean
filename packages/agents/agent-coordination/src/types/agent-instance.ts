/**
 * Agent Instance Management Types
 *
 * Core types for managing agent instances as first-class OS citizens.
 */

import { randomUUID } from 'node:crypto';

// Basic Agent Instance
export interface AgentInstance {
  // Identification
  id: string;
  agentType: string;
  version: string;

  // Status & State
  status: AgentStatus;
  health: AgentHealth;
  lastActive: Date;
  createdAt: Date;

  // Capabilities & Permissions
  capabilities: AgentCapability[];
  permissions: AgentPermissions;
  toolAccess: ToolAccess[];

  // Workload Management
  currentTasks: AssignedTask[];
  workloadCapacity: WorkloadCapacity;
  wipLimit: number;

  // Resource Allocation
  resourceAllocation: ResourceAllocation;
  homeDirectory: string;
  sandbox: SandboxConfig;

  // Communication
  communicationChannels: CommunicationChannel[];
  ensoRoomIds: string[];

  // Learning & Performance
  learningProfile: LearningProfile;
  performanceMetrics: PerformanceMetrics;

  // Ownership & Governance
  owner: string;
  team: string;
  governance: GovernanceInfo;

  // Metadata
  metadata: AgentMetadata;
}

export type AgentStatus =
  | 'initializing'
  | 'idle'
  | 'available'
  | 'busy'
  | 'overloaded'
  | 'offline'
  | 'maintenance'
  | 'error'
  | 'terminated';

export interface AgentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
  checks: HealthCheck[];
  lastHealthCheck: Date;
  uptime: number; // percentage
  errorRate: number; // 0-1
  responseTime: number; // milliseconds
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  timestamp: Date;
  duration: number;
}

export interface AgentCapability {
  id: string;
  name: string;
  category: string;
  level: ProficiencyLevel;
  experience: number; // hours
  successRate: number; // 0-1
  lastUsed: Date;
  learningRate: number; // 0-1
  endorsements: Endorsement[];
  certifications: Certification[];
}

export interface Endorsement {
  endorserId: string;
  capabilityId: string;
  level: ProficiencyLevel;
  timestamp: Date;
  context: string;
  verified: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuedAt: Date;
  expiresAt?: Date;
  verified: boolean;
  credentials: Record<string, any>;
}

export type ProficiencyLevel = 1 | 2 | 3 | 4 | 5;

export interface AgentPermissions {
  // System Permissions
  maxConcurrentTasks: number;
  maxResourceUsage: ResourceLimits;
  securityLevel: SecurityLevel;

  // Access Permissions
  allowedTools: string[];
  allowedDataSources: string[];
  allowedEndpoints: string[];

  // Restrictions
  restrictedOperations: string[];
  dataAccessRestrictions: DataAccessRestriction[];
  timeRestrictions: TimeRestriction[];

  // Escalation
  escalationRights: EscalationRight[];
  approvalRequired: ApprovalRequirement[];
}

export interface ResourceLimits {
  maxCpuUnits: number;
  maxMemoryGB: number;
  maxDiskGB: number;
  maxNetworkBandwidth: number; // Mbps
}

export type SecurityLevel = 'public' | 'internal' | 'confidential' | 'secret' | 'top_secret';

export interface DataAccessRestriction {
  type: 'file' | 'database' | 'api' | 'network';
  pattern: string;
  reason: string;
  exceptions: string[];
}

export interface TimeRestriction {
  type: 'window' | 'duration' | 'schedule';
  restriction: string;
  timezone: string;
  reason: string;
}

export interface EscalationRight {
  right: string;
  conditions: string[];
  approvers: string[];
  maxEscalations: number;
}

export interface ApprovalRequirement {
  operation: string;
  threshold: number; // cost, risk, etc.
  requiredApprovers: string[];
  autoApproveConditions: string[];
}

export interface ToolAccess {
  toolId: string;
  toolName: string;
  accessLevel: 'read' | 'write' | 'admin';
  permissions: string[];
  lastUsed: Date;
  usageCount: number;
}

export interface AssignedTask {
  taskId: string;
  taskTitle: string;
  assignedAt: Date;
  startedAt?: Date;
  estimatedCompletion: Date;
  actualCompletion?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number; // 0-1
  estimatedEffort: number; // hours
  actualEffort?: number; // hours
  kanbanColumn: string;
}

export type TaskPriority =
  | 'P0'
  | 'P1'
  | 'P2'
  | 'P3'
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | 'urgent';
export type TaskStatus =
  | 'assigned'
  | 'accepted'
  | 'started'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'rejected'
  | 'paused';

export interface WorkloadCapacity {
  totalCapacity: number; // hours per day/week
  usedCapacity: number; // hours
  availableCapacity: number; // hours
  stressLevel: number; // 0-1
  efficiency: number; // 0-1
  utilizationRate: number; // 0-1
}

export interface ResourceAllocation {
  // Compute Resources
  cpu: {
    allocated: number;
    used: number;
    limit: number;
    units: string;
  };

  memory: {
    allocated: number;
    used: number;
    limit: number;
    units: 'GB';
  };

  storage: {
    allocated: number;
    used: number;
    limit: number;
    units: 'GB';
  };

  network: {
    bandwidth: number;
    used: number;
    limit: number;
    units: 'Mbps';
  };

  // Time Quotas
  timeQuota: {
    period: 'hourly' | 'daily' | 'weekly' | 'monthly';
    allocated: number; // hours
    used: number;
    resetAt: Date;
  };
}

export interface SandboxConfig {
  enabled: boolean;
  isolationLevel: 'process' | 'container' | 'vm';
  allowedPaths: string[];
  blockedPaths: string[];
  networkAccess: boolean;
  resourceLimits: ResourceLimits;
  environmentVariables: Record<string, string>;
}

export interface CommunicationChannel {
  id: string;
  type: 'enso' | 'mcp' | 'websocket' | 'http' | 'message_queue';
  endpoint: string;
  protocol: string;
  status: 'active' | 'inactive' | 'error';
  lastUsed: Date;
  metadata: Record<string, any>;
}

export interface LearningProfile {
  learningStyle: LearningStyle;
  preferredDifficulty: DifficultyLevel;
  improvementAreas: string[];
  masteryGoals: MasteryGoal[];
  recentLearning: LearningEntry[];
  learningRate: number; // 0-1
  adaptationSpeed: number; // 0-1
}

export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'adaptive';

export interface MasteryGoal {
  capabilityId: string;
  targetLevel: ProficiencyLevel;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
  progress: number; // 0-1
}

export interface LearningEntry {
  id: string;
  capabilityId: string;
  improvement: number; // 0-1
  context: string;
  taskId?: string;
  timestamp: Date;
  retentionScore: number; // 0-1
  feedback?: string;
}

export interface PerformanceMetrics {
  // Overall Performance
  overallScore: number; // 0-1
  reliabilityScore: number; // 0-1
  qualityScore: number; // 0-1
  efficiencyScore: number; // 0-1

  // Task Metrics
  taskCompletionRate: number; // 0-1
  averageTaskDuration: number; // minutes
  onTimeCompletionRate: number; // 0-1
  retryRate: number; // 0-1

  // Resource Metrics
  resourceEfficiency: number; // 0-1
  costEffectiveness: number; // 0-1
  utilizationRate: number; // 0-1

  // Collaboration Metrics
  collaborationScore: number; // 0-1
  communicationEfficiency: number; // 0-1
  teamContribution: number; // 0-1

  // Learning Metrics
  learningVelocity: number; // capabilities per month
  adaptationRate: number; // 0-1
  knowledgeRetention: number; // 0-1

  // Recent Performance
  recentPerformance: PerformanceEntry[];
  trends: PerformanceTrend[];
}

export interface PerformanceEntry {
  taskId: string;
  score: number; // 0-1
  duration: number; // minutes
  quality: number; // 0-1
  efficiency: number; // 0-1
  timestamp: Date;
  feedback?: string;
  lessons?: string[];
}

export interface PerformanceTrend {
  metric: string;
  direction: 'improving' | 'stable' | 'declining';
  changeRate: number; // 0-1
  period: string; // '7d', '30d', '90d'
  confidence: number; // 0-1
}

export interface GovernanceInfo {
  complianceFrameworks: ComplianceFramework[];
  auditSettings: AuditSettings;
  policyCompliance: PolicyCompliance[];
  riskAssessment: RiskAssessment;
}

export interface ComplianceFramework {
  name: string;
  version: string;
  requirements: ComplianceRequirement[];
  status: 'compliant' | 'partial' | 'non_compliant';
  lastAssessed: Date;
}

export interface ComplianceRequirement {
  id: string;
  description: string;
  category: string;
  mandatory: boolean;
  satisfied: boolean;
  evidence?: string;
}

export interface AuditSettings {
  level: 'minimal' | 'standard' | 'comprehensive';
  retentionPeriod: number; // days
  auditTrails: AuditTrail[];
  alertThresholds: AlertThreshold[];
}

export interface AuditTrail {
  eventType: string;
  timestamp: Date;
  actor: string;
  action: string;
  resource: string;
  outcome: 'success' | 'failure' | 'error';
  details: Record<string, any>;
}

export interface AlertThreshold {
  metric: string;
  threshold: number;
  operator: '>' | '<' | '=' | '>=' | '<=';
  severity: 'info' | 'warning' | 'error' | 'critical';
  enabled: boolean;
}

export interface PolicyCompliance {
  policyId: string;
  policyName: string;
  compliance: number; // 0-1
  violations: PolicyViolation[];
  lastChecked: Date;
}

export interface PolicyViolation {
  rule: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  resolved: boolean;
}

export interface RiskAssessment {
  overallRisk: number; // 0-1
  riskFactors: RiskFactor[];
  mitigationStrategies: MitigationStrategy[];
  lastAssessed: Date;
}

export interface RiskFactor {
  type: 'security' | 'performance' | 'compliance' | 'operational' | 'financial';
  level: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-1
  impact: string;
  description: string;
}

export interface MitigationStrategy {
  riskFactor: string;
  strategy: string;
  effectiveness: number; // 0-1
  implementation: string;
  status: 'planned' | 'in_progress' | 'completed';
}

export interface AgentMetadata {
  // Basic Info
  name: string;
  description: string;
  version: string;

  // Classification
  category: string;
  subcategory: string;
  tags: string[];

  // Provenance
  createdBy: string;
  createdAt: Date;
  lastUpdated: Date;
  repository?: string;
  documentation?: string;

  // Deployment
  deploymentEnvironment: string;
  infrastructure: string;
  dependencies: Dependency[];

  // Configuration
  configuration: Record<string, any>;
  environmentVariables: Record<string, string>;

  // Monitoring
  healthChecks: string[];
  metrics: MetricDefinition[];
  alerts: AlertDefinition[];
}

export interface Dependency {
  name: string;
  version: string;
  type: 'package' | 'service' | 'agent' | 'system';
  required: boolean;
  alternatives?: string[];
}

export interface MetricDefinition {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'timer';
  description: string;
  units?: string;
  labels?: Record<string, string>;
}

export interface AlertDefinition {
  name: string;
  condition: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  channels: string[];
  cooldown: number; // seconds
}

// Registry Types
export interface AgentRegistry {
  registerAgent(instance: AgentInstance): Promise<void>;
  unregisterAgent(agentId: string): Promise<void>;
  getAgent(agentId: string): Promise<AgentInstance | null>;
  listAgents(filter?: AgentFilter): Promise<AgentInstance[]>;
  updateAgent(agentId: string, updates: Partial<AgentInstance>): Promise<void>;
  findAgents(query: AgentDiscoveryQuery): Promise<AgentInstance[]>;
}

export interface AgentFilter {
  status?: AgentStatus[];
  agentType?: string[];
  team?: string[];
  capability?: string[];
  minProficiency?: ProficiencyLevel;
  availability?: 'available' | 'all';
  limit?: number;
  offset?: number;
}

export interface AgentDiscoveryQuery {
  requiredCapabilities: string[];
  minimumProficiency?: ProficiencyLevel;
  excludedCapabilities?: string[];
  teamFilter?: string[];
  statusFilter?: AgentStatus[];
  availabilityWindow?: {
    start: Date;
    end: Date;
  };
  maxWorkload?: number;
  locationConstraint?: string;
  costBudget?: number;
  securityLevel?: SecurityLevel;
  limit?: number;
}

// Lifecycle Management
export interface AgentLifecycleManager {
  createAgent(config: AgentCreationConfig): Promise<AgentInstance>;
  startAgent(agentId: string): Promise<void>;
  stopAgent(agentId: string): Promise<void>;
  restartAgent(agentId: string): Promise<void>;
  terminateAgent(agentId: string): Promise<void>;
  updateAgent(agentId: string, updates: Partial<AgentInstance>): Promise<void>;
  migrateAgent(agentId: string, targetEnvironment: string): Promise<void>;
}

export interface AgentCreationConfig {
  agentType: string;
  version: string;
  owner: string;
  team: string;
  capabilities: string[];
  permissions?: Partial<AgentPermissions>;
  resourceAllocation?: Partial<ResourceAllocation>;
  sandbox?: Partial<SandboxConfig>;
  environment?: Record<string, string>;
  configuration?: Record<string, any>;
}

// Event Types
export interface AgentEvent {
  id: string;
  type: AgentEventType;
  agentId: string;
  timestamp: Date;
  data: Record<string, any>;
  source: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export type AgentEventType =
  | 'agent_created'
  | 'agent_started'
  | 'agent_stopped'
  | 'agent_updated'
  | 'agent_terminated'
  | 'status_changed'
  | 'health_check'
  | 'task_assigned'
  | 'task_completed'
  | 'task_failed'
  | 'capability_updated'
  | 'permission_changed'
  | 'resource_allocated'
  | 'error_occurred'
  | 'security_violation'
  | 'performance_alert';
