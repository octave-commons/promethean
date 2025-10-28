/**
 * Agent Task Assignment System Types
 *
 * This module defines the core types for the agent task assignment system,
 * which integrates agent instances with the kanban board for intelligent workload distribution.
 */
export interface TaskAnalysis {
    taskId: string;
    complexity: TaskComplexity;
    estimatedDuration: number;
    requiredSkills: string[];
    toolRequirements: string[];
    securityLevel: SecurityLevel;
    resourceNeeds: ResourceRequirement[];
    environmentConstraints: EnvironmentConstraint[];
    agentPreferences: AgentPreference[];
    deadlinePriority: DeadlinePriority;
    learningValue: LearningValue;
    dependencies: string[];
    collaborationNeeds: CollaborationRequirement[];
}
export interface TaskComplexity {
    score: number;
    factors: ComplexityFactor[];
    reasoning: string;
}
export interface ComplexityFactor {
    type: 'technical' | 'coordination' | 'scope' | 'uncertainty' | 'dependencies';
    weight: number;
    score: number;
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
    preferenceLevel: number;
    reason: string;
}
export interface CollaborationRequirement {
    type: 'coordination' | 'communication' | 'shared_resources' | 'sequential_work';
    requiredAgents?: string[];
    description: string;
}
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
    level: ProficiencyLevel;
    experience: number;
    successRate: number;
    lastUsed: Date;
    learningRate: number;
    endorsements: string[];
}
export interface CurrentWorkload {
    assignedTasks: AssignedTask[];
    totalCapacity: number;
    usedCapacity: number;
    stressLevel: number;
    urgentTaskCount: number;
}
export interface AssignedTask {
    taskId: string;
    assignedAt: Date;
    estimatedCompletion: Date;
    priority: TaskPriority;
    status: 'active' | 'paused' | 'completed' | 'failed';
    progress: number;
}
export interface PerformanceMetrics {
    overallScore: number;
    taskCompletionRate: number;
    averageTaskDuration: number;
    qualityScore: number;
    reliabilityScore: number;
    resourceMetrics: ResourceMetrics;
    recentPerformance: PerformanceEntry[];
}
export interface ResourceMetrics {
    utilization: number;
    efficiency: number;
    costEffectiveness: number;
}
export interface PerformanceEntry {
    taskId: string;
    score: number;
    duration: number;
    quality: number;
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
    improvement: number;
    timestamp: Date;
    context: string;
}
export interface AvailabilityInfo {
    currentStatus: 'available' | 'busy' | 'offline' | 'maintenance';
    schedule: TimeWindow[];
    timezone: string;
    responseTime: number;
    uptime: number;
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
    discount: number;
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
    matchScore: number;
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
    confidence: number;
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
    probability: number;
    impact: string;
    mitigation?: string;
}
export interface AssignmentDecision {
    taskId: string;
    selectedAgent: string;
    confidence: number;
    reasoning: AssignmentReasoning[];
    alternatives: AlternativeAssignment[];
    riskAssessment: RiskAssessment;
    expectedOutcome: ExpectedOutcome;
    assignmentMetadata: AssignmentMetadata;
}
export interface AssignmentReasoning {
    factor: string;
    weight: number;
    score: number;
    explanation: string;
}
export interface AlternativeAssignment {
    agentId: string;
    score: number;
    reason: string;
    tradeoffs: string[];
}
export interface RiskAssessment {
    overallRisk: number;
    riskFactors: RiskFactor[];
    mitigationStrategies: string[];
    contingencyPlans: string[];
}
export interface ExpectedOutcome {
    successProbability: number;
    estimatedDuration: number;
    qualityScore: number;
    learningValue: number;
    costEstimate: number;
}
export interface AssignmentMetadata {
    assignedAt: Date;
    assignedBy: string;
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
export interface CapabilityMatchScore {
    overallScore: number;
    capabilityScores: CapabilityScore[];
    missingCapabilities: string[];
    improvementOpportunities: string[];
}
export interface CapabilityScore {
    capability: string;
    score: number;
    level: ProficiencyLevel;
    experience: number;
    successRate: number;
    recencyBonus: number;
}
export interface WorkloadBalanceScore {
    overallScore: number;
    wipScore: number;
    capacityScore: number;
    stressFactor: number;
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
    score: number;
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
export interface AssignmentPerformance {
    assignmentId: string;
    taskId: string;
    agentInstanceId: string;
    predictedDuration: number;
    actualDuration: number;
    predictedQuality: number;
    actualQuality: number;
    resourceUtilization: number;
    costEfficiency: number;
    timeEfficiency: number;
    capabilityImprovements: CapabilityImprovement[];
    newSkillsAcquired: string[];
    agentSatisfaction: number;
    requestorSatisfaction: number;
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
export type ProficiencyLevel = 1 | 2 | 3 | 4 | 5;
export type SecurityLevel = 'public' | 'internal' | 'confidential' | 'secret' | 'top_secret';
export type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3' | 'low' | 'medium' | 'high' | 'critical' | 'urgent';
export type DeadlinePriority = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type LearningValue = number;
export type AgentStatus = 'idle' | 'busy' | 'offline' | 'maintenance' | 'error';
export type LocationConstraint = 'any' | 'same_region' | 'same_timezone' | 'specific';
export declare class AssignmentError extends Error {
    code: string;
    details?: any | undefined;
    constructor(message: string, code: string, details?: any | undefined);
}
export declare class CapabilityError extends AssignmentError {
    constructor(message: string, details?: any);
}
export declare class WorkloadError extends AssignmentError {
    constructor(message: string, details?: any);
}
export declare class ConstraintError extends AssignmentError {
    constructor(message: string, details?: any);
}
//# sourceMappingURL=types.d.ts.map