/**
 * Kanban Integration Types
 *
 * Types for integrating agent coordination with the kanban system for
 * task tracking, status management, and workflow automation.
 */

import { AgentInstance } from './agent-instance.js';
import { TaskAnalysis, AssignmentDecision } from './task-assignment.js';

// Kanban Integration Core
export interface KanbanIntegrationManager {
  // Task Synchronization
  syncTaskToKanban(taskId: string, agentId: string, assignment: AssignmentDecision): Promise<void>;
  syncAgentStatusToKanban(agentId: string, status: AgentKanbanStatus): Promise<void>;
  syncTaskProgress(taskId: string, progress: TaskProgress): Promise<void>;

  // Board Management
  createAgentBoard(agentId: string, config: AgentBoardConfig): Promise<AgentBoard>;
  updateAgentBoard(agentId: string, updates: Partial<AgentBoard>): Promise<void>;
  getAgentBoard(agentId: string): Promise<AgentBoard>;

  // WIP Management
  setAgentWIPLimit(agentId: string, limit: WIPLimit): Promise<void>;
  getAgentWIPLimit(agentId: string): Promise<WIPLimit>;
  checkWIPLimit(agentId: string): Promise<WIPStatus>;

  // Automation
  setupTaskAutomation(config: TaskAutomationConfig): Promise<TaskAutomation>;
  updateTaskAutomation(automationId: string, updates: Partial<TaskAutomationConfig>): Promise<void>;
  removeTaskAutomation(automationId: string): Promise<void>;

  // Analytics
  getAgentAnalytics(agentId: string, period: AnalyticsPeriod): Promise<AgentAnalytics>;
  getTeamAnalytics(teamId: string, period: AnalyticsPeriod): Promise<TeamAnalytics>;
  getSystemAnalytics(period: AnalyticsPeriod): Promise<SystemAnalytics>;
}

// Agent Kanban Status
export interface AgentKanbanStatus {
  agentId: string;
  status: AgentStatus;
  currentTasks: AgentTask[];
  workload: AgentWorkload;
  wipStatus: WIPStatus;
  availability: AgentAvailability;
  lastUpdated: Date;
}

export interface AgentTask {
  taskId: string;
  title: string;
  status: TaskStatus;
  column: string;
  priority: TaskPriority;
  assignedAt: Date;
  startedAt?: Date;
  estimatedCompletion: Date;
  progress: number; // 0-1
  blocked: boolean;
  blockers: TaskBlocker[];
  dependencies: string[];
  assignee: string;
}

export interface AgentWorkload {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  blockedTasks: number;
  totalCapacity: number; // hours
  usedCapacity: number; // hours
  availableCapacity: number; // hours
  stressLevel: number; // 0-1
  efficiency: number; // 0-1
}

export interface WIPStatus {
  currentLoad: number;
  limit: number;
  status: WIPStatusType;
  overloadReason?: string;
  recommendations: string[];
}

export type WIPStatusType = 'under_limit' | 'at_limit' | 'over_limit' | 'critical';

export interface AgentAvailability {
  available: boolean;
  nextAvailable?: Date;
  capacity: number; // hours
  flexibility: number; // 0-1
  preferredTasks: string[];
  avoidedTasks: string[];
}

// Agent Board
export interface AgentBoard {
  agentId: string;
  boardId: string;
  name: string;

  // Configuration
  columns: BoardColumn[];
  wipLimits: ColumnWIPLimit[];
  automation: TaskAutomation[];

  // Tasks
  tasks: BoardTask[];
  backlog: BacklogTask[];

  // Settings
  settings: BoardSettings;
  filters: TaskFilter[];

  // Status
  status: BoardStatus;
  lastSync: Date;

  // Metrics
  metrics: BoardMetrics;
}

export interface BoardColumn {
  id: string;
  name: string;
  type: ColumnType;
  position: number;
  wipLimit?: number;
  autoAssign?: boolean;
  color?: string;
  description?: string;
}

export type ColumnType =
  | 'backlog'
  | 'ready'
  | 'in_progress'
  | 'review'
  | 'testing'
  | 'done'
  | 'blocked'
  | 'custom';

export interface ColumnWIPLimit {
  columnId: string;
  limit: number;
  current: number;
  status: WIPStatusType;
  flexible: boolean;
  overrideReason?: string;
}

export interface BoardTask {
  id: string;
  title: string;
  description: string;
  columnId: string;
  position: number;

  // Assignment
  assigneeId?: string;
  assigneeName?: string;

  // Status
  status: TaskStatus;
  priority: TaskPriority;
  progress: number; // 0-1

  // Timing
  createdAt: Date;
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  dueDate?: Date;

  // Dependencies
  dependencies: string[];
  blockers: string[];

  // Metadata
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;

  // Kanban Specific
  cycleTime?: number; // minutes
  leadTime?: number; // minutes
  blockedTime?: number; // minutes
}

export interface BacklogTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  estimatedHours?: number;
  tags: string[];
  createdAt: Date;
  rank: number;
  ready: boolean;
}

export interface BoardSettings {
  autoArchive: boolean;
  archiveAfterDays: number;
  showBlockedTasks: boolean;
  enableSwimlanes: boolean;
  swimlaneBy?: string;
  colorCoding: boolean;
  timeTracking: boolean;
  progressTracking: boolean;
}

export interface TaskFilter {
  id: string;
  name: string;
  field: string;
  operator: FilterOperator;
  value: any;
  active: boolean;
}

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'in'
  | 'not_in'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty';

export type BoardStatus = 'active' | 'archived' | 'suspended';

export interface BoardMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;

  // Flow Metrics
  averageCycleTime: number; // minutes
  averageLeadTime: number; // minutes
  throughput: number; // tasks per period

  // Quality Metrics
  completionRate: number; // 0-1
  onTimeDeliveryRate: number; // 0-1
  blockageRate: number; // 0-1

  // Efficiency Metrics
  wipEfficiency: number; // 0-1
  flowEfficiency: number; // 0-1
  resourceUtilization: number; // 0-1
}

export interface AgentBoardConfig {
  name: string;
  columns: BoardColumnConfig[];
  wipLimits?: ColumnWIPLimitConfig[];
  settings?: Partial<BoardSettings>;
  initialTasks?: BoardTask[];
}

export interface BoardColumnConfig {
  name: string;
  type: ColumnType;
  position: number;
  wipLimit?: number;
  autoAssign?: boolean;
  color?: string;
  description?: string;
}

export interface ColumnWIPLimitConfig {
  columnName: string;
  limit: number;
  flexible: boolean;
}

// Task Automation
export interface TaskAutomation {
  id: string;
  name: string;
  description: string;

  // Trigger
  trigger: AutomationTrigger;

  // Conditions
  conditions: AutomationCondition[];

  // Actions
  actions: AutomationAction[];

  // Status
  enabled: boolean;
  status: AutomationStatus;

  // Execution
  executionHistory: AutomationExecution[];
  lastExecuted?: Date;

  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
}

export interface AutomationTrigger {
  type: TriggerType;
  configuration: Record<string, any>;
}

export type TriggerType =
  | 'task_created'
  | 'task_updated'
  | 'task_moved'
  | 'task_assigned'
  | 'task_completed'
  | 'task_blocked'
  | 'agent_available'
  | 'agent_overloaded'
  | 'time_based'
  | 'manual';

export interface AutomationCondition {
  type: ConditionType;
  field: string;
  operator: ConditionOperator;
  value: any;
  weight?: number;
}

export type ConditionType =
  | 'field_comparison'
  | 'task_property'
  | 'agent_property'
  | 'time_condition'
  | 'custom_function';

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'in'
  | 'not_in'
  | 'matches';

export interface AutomationAction {
  type: ActionType;
  configuration: Record<string, any>;
  order: number;
}

export type ActionType =
  | 'assign_task'
  | 'move_task'
  | 'update_task'
  | 'create_task'
  | 'send_notification'
  | 'update_agent_status'
  | 'adjust_wip_limit'
  | 'escalate_task'
  | 'create_subtask'
  | 'add_dependency'
  | 'remove_dependency'
  | 'custom_webhook';

export type AutomationStatus = 'active' | 'paused' | 'error' | 'disabled';

export interface AutomationExecution {
  id: string;
  timestamp: Date;
  trigger: string;
  conditions: ConditionEvaluation[];
  actions: ActionResult[];
  status: ExecutionStatus;
  duration: number; // milliseconds
  error?: string;
}

export interface ConditionEvaluation {
  condition: string;
  result: boolean;
  value: any;
  duration: number; // milliseconds
}

export interface ActionResult {
  action: string;
  status: ActionStatus;
  result?: any;
  error?: string;
  duration: number; // milliseconds;
}

export type ActionStatus = 'success' | 'failed' | 'skipped' | 'pending';

export type ExecutionStatus = 'success' | 'failed' | 'partial' | 'skipped';

export interface TaskAutomationConfig {
  name: string;
  description: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  enabled?: boolean;
}

// Task Progress
export interface TaskProgress {
  taskId: string;
  agentId: string;

  // Progress
  percentage: number; // 0-1
  status: TaskStatus;
  column: string;

  // Timing
  startedAt?: Date;
  currentPhase: TaskPhase;
  phaseProgress: PhaseProgress[];

  // Work
  completedWork: WorkItem[];
  remainingWork: WorkItem[];
  blockedWork: WorkItem[];

  // Quality
  qualityChecks: QualityCheck[];
  issues: TaskIssue[];

  // Dependencies
  dependenciesCompleted: string[];
  dependenciesRemaining: string[];

  // Updates
  lastUpdate: Date;
  updateHistory: ProgressUpdate[];
}

export interface TaskPhase {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number; // minutes
  actualDuration?: number; // minutes
  status: PhaseStatus;
  startedAt?: Date;
  completedAt?: Date;
}

export type PhaseStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'skipped';

export interface PhaseProgress {
  phaseId: string;
  percentage: number; // 0-1
  completedItems: string[];
  remainingItems: string[];
  blockedItems: string[];
}

export interface WorkItem {
  id: string;
  title: string;
  description: string;
  type: WorkItemType;
  status: WorkItemStatus;
  estimatedEffort: number; // hours
  actualEffort?: number; // hours
  assignee?: string;
  completedAt?: Date;
}

export type WorkItemType =
  | 'development'
  | 'testing'
  | 'documentation'
  | 'review'
  | 'deployment'
  | 'communication'
  | 'research'
  | 'planning';

export type WorkItemStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'skipped';

export interface QualityCheck {
  id: string;
  name: string;
  type: QualityCheckType;
  status: QualityCheckStatus;
  result?: QualityCheckResult;
  performedBy?: string;
  performedAt?: Date;
}

export type QualityCheckType =
  | 'automated_test'
  | 'code_review'
  | 'security_scan'
  | 'performance_test'
  | 'documentation_check'
  | 'compliance_check';

export type QualityCheckStatus = 'pending' | 'passed' | 'failed' | 'skipped';

export interface QualityCheckResult {
  score: number; // 0-1
  issues: QualityIssue[];
  metrics: QualityMetric[];
  recommendations: string[];
}

export interface QualityIssue {
  type: QualityIssueType;
  severity: QualityIssueSeverity;
  description: string;
  location?: string;
  suggestion?: string;
}

export type QualityIssueType =
  | 'bug'
  | 'vulnerability'
  | 'performance'
  | 'maintainability'
  | 'documentation'
  | 'standards'
  | 'security';

export type QualityIssueSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface QualityMetric {
  name: string;
  value: number;
  unit: string;
  threshold?: number;
  status: 'good' | 'warning' | 'critical';
}

export interface TaskIssue {
  id: string;
  type: TaskIssueType;
  severity: TaskIssueSeverity;
  description: string;
  reportedBy: string;
  reportedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolution?: string;
  impact: string;
}

export type TaskIssueType =
  | 'blocker'
  | 'dependency'
  | 'resource'
  | 'technical'
  | 'communication'
  | 'scope'
  | 'quality';

export type TaskIssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ProgressUpdate {
  id: string;
  timestamp: Date;
  updateType: UpdateType;
  message: string;
  data?: Record<string, any>;
  author: string;
}

export type UpdateType =
  | 'status_change'
  | 'progress_update'
  | 'issue_reported'
  | 'issue_resolved'
  | 'phase_completed'
  | 'milestone_reached'
  | 'quality_check'
  | 'general';

// WIP Management
export interface WIPLimit {
  agentId: string;
  limits: ColumnWIPLimit[];
  globalLimit?: number;
  flexibleLimits: boolean;
  autoAdjustment: boolean;
  adjustmentCriteria: WIPAdjustmentCriteria[];
}

export interface WIPAdjustmentCriteria {
  factor: WIPAdjustmentFactor;
  condition: string;
  adjustment: number; // +/- percentage
  maxAdjustment: number; // +/- percentage
}

export type WIPAdjustmentFactor =
  | 'performance'
  | 'workload'
  | 'complexity'
  | 'deadline_pressure'
  | 'team_capacity'
  | 'resource_availability';

// Analytics
export interface AnalyticsPeriod {
  start: Date;
  end: Date;
  type: PeriodType;
}

export type PeriodType = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';

export interface AgentAnalytics {
  agentId: string;
  period: AnalyticsPeriod;

  // Task Metrics
  tasksCompleted: number;
  tasksInProgress: number;
  completionRate: number; // 0-1
  averageTaskDuration: number; // minutes
  onTimeCompletionRate: number; // 0-1

  // Performance Metrics
  productivity: number; // 0-1
  efficiency: number; // 0-1
  qualityScore: number; // 0-1
  reliabilityScore: number; // 0-1

  // Workload Metrics
  averageWorkload: number; // 0-1
  peakWorkload: number; // 0-1
  wipEfficiency: number; // 0-1
  overtimeHours: number;

  // Flow Metrics
  averageCycleTime: number; // minutes
  averageLeadTime: number; // minutes
  flowEfficiency: number; // 0-1
  blockageRate: number; // 0-1

  // Learning Metrics
  capabilitiesImproved: number;
  newSkillsAcquired: number;
  learningVelocity: number;

  // Trends
  trends: AnalyticsTrend[];

  // Insights
  insights: AnalyticsInsight[];
  recommendations: AnalyticsRecommendation[];
}

export interface TeamAnalytics {
  teamId: string;
  period: AnalyticsPeriod;

  // Team Metrics
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;

  // Performance Metrics
  teamProductivity: number; // 0-1
  teamEfficiency: number; // 0-1
  averageQualityScore: number; // 0-1
  collaborationScore: number; // 0-1

  // Workload Distribution
  workloadBalance: number; // 0-1
  utilizationRate: number; // 0-1
  bottlenecks: TeamBottleneck[];

  // Flow Metrics
  teamCycleTime: number; // minutes
  teamLeadTime: number; // minutes
  throughput: number; // tasks per period

  // Agent Breakdown
  agentMetrics: AgentAnalytics[];

  // Trends
  trends: AnalyticsTrend[];

  // Insights
  insights: AnalyticsInsight[];
  recommendations: AnalyticsRecommendation[];
}

export interface SystemAnalytics {
  period: AnalyticsPeriod;

  // System Metrics
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;

  // Performance Metrics
  systemProductivity: number; // 0-1
  systemEfficiency: number; // 0-1
  averageQualityScore: number; // 0-1

  // Resource Metrics
  resourceUtilization: number; // 0-1
  costEfficiency: number; // 0-1
  scalability: number; // 0-1

  // Flow Metrics
  systemCycleTime: number; // minutes
  systemLeadTime: number; // minutes
  systemThroughput: number; // tasks per period

  // Distribution
  agentTypeDistribution: AgentTypeDistribution[];
  taskTypeDistribution: TaskTypeDistribution[];
  statusDistribution: StatusDistribution[];

  // Trends
  trends: AnalyticsTrend[];

  // Insights
  insights: AnalyticsInsight[];
  recommendations: AnalyticsRecommendation[];
}

export interface AnalyticsTrend {
  metric: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  changeRate: number; // 0-1
  period: string;
  confidence: number; // 0-1
  significance: 'low' | 'medium' | 'high';
}

export interface AnalyticsInsight {
  type: InsightType;
  title: string;
  description: string;
  impact: InsightImpact;
  data: Record<string, any>;
  confidence: number; // 0-1
  timestamp: Date;
}

export type InsightType =
  | 'performance'
  | 'efficiency'
  | 'quality'
  | 'workload'
  | 'collaboration'
  | 'learning'
  | 'resource'
  | 'anomaly';

export type InsightImpact = 'low' | 'medium' | 'high' | 'critical';

export interface AnalyticsRecommendation {
  type: RecommendationType;
  title: string;
  description: string;
  priority: RecommendationPriority;
  effort: RecommendationEffort;
  expectedImpact: number; // 0-1
  implementation: string;
  metrics: string[];
}

export type RecommendationType =
  | 'process_improvement'
  | 'resource_allocation'
  | 'skill_development'
  | 'tool_optimization'
  | 'workflow_automation'
  | 'team_restructure'
  | 'capacity_planning';

export type RecommendationPriority = 'low' | 'medium' | 'high' | 'critical';

export type RecommendationEffort = 'low' | 'medium' | 'high';

export interface TeamBottleneck {
  type: BottleneckType;
  description: string;
  impact: number; // 0-1
  affectedAgents: string[];
  affectedTasks: string[];
  suggestedResolution: string;
}

export type BottleneckType =
  | 'skill_gap'
  | 'resource_shortage'
  | 'workload_imbalance'
  | 'communication_delay'
  | 'process_inefficiency'
  | 'tool_limitation';

export interface AgentTypeDistribution {
  agentType: string;
  count: number;
  percentage: number; // 0-1
  avgPerformance: number; // 0-1
  avgWorkload: number; // 0-1
}

export interface TaskTypeDistribution {
  taskType: string;
  count: number;
  percentage: number; // 0-1
  avgDuration: number; // minutes
  completionRate: number; // 0-1
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number; // 0-1
  avgDuration: number; // minutes
}

// Common Types
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

export type TaskStatus =
  | 'backlog'
  | 'ready'
  | 'in_progress'
  | 'review'
  | 'testing'
  | 'done'
  | 'blocked'
  | 'cancelled';

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

export interface TaskBlocker {
  id: string;
  type: BlockerType;
  description: string;
  severity: BlockerSeverity;
  reportedBy: string;
  reportedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolution?: string;
}

export type BlockerType =
  | 'dependency'
  | 'resource'
  | 'technical'
  | 'communication'
  | 'approval'
  | 'external';

export type BlockerSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface TaskDependency {
  taskId: string;
  type: DependencyType;
  description: string;
  critical: boolean;
}

export type DependencyType =
  | 'finish_to_start'
  | 'start_to_start'
  | 'finish_to_finish'
  | 'start_to_finish';
