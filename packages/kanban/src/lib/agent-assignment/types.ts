/**
 * Agent Task Assignment System Types
 * 
 * This module defines the core types for the agent task assignment system,
 * which integrates agent instances with the kanban board for intelligent workload distribution.
 */

// Core Task Analysis Types
export interface TaskAnalysis {
  taskId: string;
  
  // Task Characteristics
  complexity: TaskComplexity;          // 1-10 scale
  estimatedDuration: number;          // minutes
  requiredSkills: string[];            // capability IDs
  toolRequirements: string[];          // tool access needed
  
  // Requirements
  securityLevel: SecurityLevel;       // access clearance needed
  resourceNeeds: ResourceRequirement[];
  environmentConstraints: EnvironmentConstraint[];
  
  // Preferences
  agentPreferences: AgentPreference[];
  deadlinePriority: DeadlinePriority;
  learningValue: LearningValue;        // 0-1 educational value
  
  // Context
  dependencies: string[];             // other task IDs
  collaborationNeeds: CollaborationRequirement[];
}

export interface TaskComplexity {
  score: number;                      // 1-10
  factors: ComplexityFactor[];
  reasoning: string;
}

export interface ComplexityFactor {
  type: 'technical' | 'coordination' | 'scope' | 'uncertainty' | 'dependencies';
  weight: number;                     // 0-1
  score: number;                      // 1-10
  description: string;
}

export interface ResourceRequirement {
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'specialized_hardware';
  amount: number;
  unit: string;
  optional: boolean;
}

export interface EnvironmentConstraint {
  type: 'os' | 'runtime' | 'network' | 'security' | 'location';
  requirement: string;
  strictness: 'required' | 'preferred' | 'optional';
}

export interface AgentPreference {
  agentType: string;
  preferenceLevel: number;            // 0-1
  reason: string;
}

export interface CollaborationRequirement {
  type: 'coordination' | 'communication' | 'shared_resources' | 'sequential_work';
  requiredAgents?: string[];
  description: string;
}

// Agent Registry Types
export interface AgentInstance {
  instanceId: string;
  agentType: string;
  capabilities: AgentCapability[];
  status: AgentStatus;
  workload: CurrentWorkload;
  performanceMetrics: PerformanceMetrics;
  permissions: AgentPermissions;
  resourceAllocation: ResourceAllocation;
  learningProfile: LearningProfile;
  availability: AvailabilityInfo;
  costProfile: CostProfile;
  metadata: AgentMetadata;
}

export interface AgentCapability {
  id: string;
  name: string;
  level: ProficiencyLevel;            // 1-5
  experience: number;                 // hours of experience
  successRate: number;                // 0-1
  lastUsed: Date;
  learningRate: number;               // 0-1
  endorsements: string[];             // other agents who endorse this capability
}

export interface CurrentWorkload {
  assignedTasks: AssignedTask[];
  totalCapacity: number;              // hours
  usedCapacity: number;               // hours
  stressLevel: number;                // 0-1
  urgentTaskCount: number;
}

export interface AssignedTask {
  taskId: string;
  assignedAt: Date;
  estimatedCompletion: Date;
  priority: TaskPriority;
  status: 'active' | 'paused' | 'completed' | 'failed';
  progress: number;                   // 0-1
}

export interface PerformanceMetrics {
  overallScore: number;               // 0-1
  taskCompletionRate: number;         // 0-1
  averageTaskDuration: number;        // minutes
  qualityScore: number;               // 0-1
  reliabilityScore: number;           // 0-1
  resourceMetrics: ResourceMetrics;
  recentPerformance: PerformanceEntry[];
}

export interface ResourceMetrics {
  utilization: number;                // 0-1
  efficiency: number;                 // 0-1
  costEffectiveness: number;          // 0-1
}

export interface PerformanceEntry {
  taskId: string;
  score: number;                      // 0-1
  duration: number;                   // minutes
  quality: number;                    // 0-1
  timestamp: Date;
  feedback?: string;
}

export interface AgentPermissions {
  maxConcurrentTasks: number;
  securityLevel: SecurityLevel;
  allowedTools: string[];
  restrictedOperations: string[];
  escalationRights: string[];
}

export interface ResourceAllocation {
  timeQuota: {
    maxHours: number;
    usedHours: number;
    resetPeriod: 'daily' | 'weekly' | 'monthly';
  };
  computeQuota: {
    maxCpuUnits: number;
    maxMemoryGB: number;
    usedCpuUnits: number;
    usedMemoryGB: number;
  };
}

export interface LearningProfile {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  preferredDifficulty: 'easy' | 'medium' | 'hard';
  improvementAreas: string[];
  masteryGoals: string[];
  recentLearning: LearningEntry[];
}

export interface LearningEntry {
  capabilityId: string;
  improvement: number;                // 0-1
  timestamp: Date;
  context: string;
}

export interface AvailabilityInfo {
  currentStatus: 'available' | 'busy' | 'offline' | 'maintenance';
  schedule: TimeWindow[];
  timezone: string;
  responseTime: number;               // average minutes
  uptime: number;                     // 0-1
}

export interface TimeWindow {
  start: Date;
  end: Date;
  type: 'available' | 'unavailable' | 'preferred';
}

export interface CostProfile {
  hourlyRate: number;
  costPerTask: number;
  costModel: 'fixed' | 'hourly' | 'performance_based';
  discounts: CostDiscount[];
}

export interface CostDiscount {
  condition: string;
  discount: number;                   // 0-1
  description: string;
}

export interface AgentMetadata {
  version: string;
  createdAt: Date;
  lastUpdated: Date;
  owner: string;
  team: string;
  location: string;
  tags: string[];
}

// Assignment Types
export interface AgentDiscoveryQuery {
  requiredCapabilities: string[];
  minimumProficiency: ProficiencyLevel;
  availabilityWindow: TimeWindow;
  maxWorkload: number;
  teamFilter?: string[];
  locationConstraint?: LocationConstraint;
  costBudget?: number;
}

export interface AgentCandidate {
  instanceId: string;
  matchScore: number;                 // 0-1 compatibility score
  availability: AvailabilityInfo;
  workload: CurrentWorkload;
  historicalPerformance: PerformanceMetrics;
  learningOpportunity: LearningValue;
  costEstimate: CostEstimate;
  riskFactors: RiskFactor[];
}

export interface CostEstimate {
  estimatedCost: number;
  costBreakdown: CostBreakdown[];
  confidence: number;                 // 0-1
  currency: string;
}

export interface CostBreakdown {
  category: string;
  amount: number;
  calculation: string;
}

export interface RiskFactor {
  type: 'capability_gap' | 'workload_overload' | 'availability_risk' | 'cost_overrun' | 'quality_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;                // 0-1
  impact: string;
  mitigation?: string;
}

export interface AssignmentDecision {
  taskId: string;
  selectedAgent: string;
  confidence: number;                 // 0-1 confidence in success
  reasoning: AssignmentReasoning[];
  alternatives: AlternativeAssignment[];
  riskAssessment: RiskAssessment;
  expectedOutcome: ExpectedOutcome;
  assignmentMetadata: AssignmentMetadata;
}

export interface AssignmentReasoning {
  factor: string;
  weight: number;                     // 0-1
  score: number;                      // 0-1
  explanation: string;
}

export interface AlternativeAssignment {
  agentId: string;
  score: number;
  reason: string;
  tradeoffs: string[];
}

export interface RiskAssessment {
  overallRisk: number;                // 0-1
  riskFactors: RiskFactor[];
  mitigationStrategies: string[];
  contingencyPlans: string[];
}

export interface ExpectedOutcome {
  successProbability: number;         // 0-1
  estimatedDuration: number;          // minutes
  qualityScore: number;               // 0-1
  learningValue: number;              // 0-1
  costEstimate: number;
}

export interface AssignmentMetadata {
  assignedAt: Date;
  assignedBy: string;                 // system or user ID
  algorithmVersion: string;
  assignmentStrategy: AssignmentStrategy;
  auditLog: AuditEntry[];
}

export interface AuditEntry {
  timestamp: Date;
  action: string;
  details: string;
  actor: string;
}

// Scoring Types
export interface CapabilityMatchScore {
  overallScore: number;
  capabilityScores: CapabilityScore[];
  missingCapabilities: string[];
  improvementOpportunities: string[];
}

export interface CapabilityScore {
  capability: string;
  score: number;                      // 0-1
  level: ProficiencyLevel;
  experience: number;
  successRate: number;
  recencyBonus: number;
}

export interface WorkloadBalanceScore {
  overallScore: number;
  wipScore: number;                   // 0-1
  capacityScore: number;              // 0-1
  stressFactor: number;               // 0-1
  currentLoad: number;
  availableCapacity: number;
}

export interface LearningOpportunityScore {
  overallScore: number;
  learningScores: LearningScore[];
  primaryLearningType: 'new_capability' | 'improvement' | 'mastery' | 'none';
}

export interface LearningScore {
  capability: string;
  score: number;                      // 0-1
  type: 'new_capability' | 'improvement' | 'mastery';
  currentLevel?: ProficiencyLevel;
  potentialLevel?: ProficiencyLevel;
}

export interface AssignmentScore {
  overallScore: number;
  breakdown: ScoreBreakdown;
  confidence: number;
  riskFactors: RiskFactor[];
}

export interface ScoreBreakdown {
  capability: CapabilityMatchScore;
  workload: WorkloadBalanceScore;
  learning: LearningOpportunityScore;
  historical: number;
  collaboration: number;
  availability: number;
}

// Assignment Strategy Types
export interface AssignmentWeights {
  capability: number;
  workload: number;
  learning: number;
  historical: number;
  collaboration: number;
  availability: number;
}

export interface AssignmentStrategy {
  name: string;
  description: string;
  weights: AssignmentWeights;
  constraints: ConstraintConfig[];
  optimizationGoal: OptimizationGoal;
}

export interface ConstraintConfig {
  type: 'hard' | 'soft';
  name: string;
  weight?: number;
  parameters: Record<string, any>;
}

export interface OptimizationGoal {
  primary: 'efficiency' | 'quality' | 'learning' | 'cost' | 'balance';
  secondary?: OptimizationGoal['primary'];
  customObjective?: string;
}

// Performance Tracking Types
export interface AssignmentPerformance {
  assignmentId: string;
  taskId: string;
  agentInstanceId: string;
  
  // Predicted vs Actual
  predictedDuration: number;
  actualDuration: number;
  predictedQuality: number;
  actualQuality: number;
  
  // Efficiency Metrics
  resourceUtilization: number;
  costEfficiency: number;
  timeEfficiency: number;
  
  // Learning Metrics
  capabilityImprovements: CapabilityImprovement[];
  newSkillsAcquired: string[];
  
  // Satisfaction
  agentSatisfaction: number;
  requestorSatisfaction: number;
  
  // Timestamps
  assignedAt: Date;
  startedAt: Date;
  completedAt: Date;
}

export interface CapabilityImprovement {
  capabilityId: string;
  beforeLevel: ProficiencyLevel;
  afterLevel: ProficiencyLevel;
  improvementAmount: number;
  context: string;
}

// Assignment Learning Types
export interface AssignmentLearningModel {
  updateModel(performance: AssignmentPerformance): void;
  predictScore(agent: AgentInstance, task: TaskAnalysis): number;
  identifyPatterns(): AssignmentPattern[];
  suggestWeights(): AssignmentWeights;
}

export interface AssignmentPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  confidence: number;
  recommendation: string;
}

// Integration Types
export interface KanbanTaskAssignment {
  taskId: string;
  agentInstanceId: string;
  assignedAt: Date;
  estimatedCompletion: Date;
  confidence: number;
  assignmentReasoning: string;
  status: 'assigned' | 'accepted' | 'started' | 'completed' | 'failed' | 'rejected';
  kanbanStatus: string;
}

export interface AgentWIPLimit {
  agentInstanceId: string;
  limit: number;
  currentLoad: number;
  flexibleLimit: boolean;
  overrideReason?: string;
}

// Enum Types
export type ProficiencyLevel = 1 | 2 | 3 | 4 | 5;
export type SecurityLevel = 'public' | 'internal' | 'confidential' | 'secret' | 'top_secret';
export type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3' | 'low' | 'medium' | 'high' | 'critical' | 'urgent';
export type DeadlinePriority = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type LearningValue = number; // 0-1
export type AgentStatus = 'idle' | 'busy' | 'offline' | 'maintenance' | 'error';
export type LocationConstraint = 'any' | 'same_region' | 'same_timezone' | 'specific';

// Error Types
export class AssignmentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AssignmentError';
  }
}

export class CapabilityError extends AssignmentError {
  constructor(message: string, details?: any) {
    super(message, 'CAPABILITY_ERROR', details);
  }
}

export class WorkloadError extends AssignmentError {
  constructor(message: string, details?: any) {
    super(message, 'WORKLOAD_ERROR', details);
  }
}

export class ConstraintError extends AssignmentError {
  constructor(message: string, details?: any) {
    super(message, 'CONSTRAINT_ERROR', details);
  }
}