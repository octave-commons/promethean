/**
 * Enso Protocol Integration Types
 *
 * Types for integrating agent coordination with the Enso protocol for
 * real-time communication, collaboration, and context sharing.
 */

import { AgentInstance } from './agent-instance.js';
import { TaskAnalysis, AssignmentDecision } from './task-assignment.js';

// Enso Integration Core
export interface EnsoIntegrationManager {
  // Room Management
  createAgentRoom(config: AgentRoomConfig): Promise<EnsoRoom>;
  joinAgentRoom(agentId: string, roomId: string): Promise<void>;
  leaveAgentRoom(agentId: string, roomId: string): Promise<void>;
  getAgentRooms(agentId: string): Promise<EnsoRoom[]>;

  // Context Management
  shareTaskContext(roomId: string, taskContext: TaskContext): Promise<void>;
  updateTaskContext(roomId: string, updates: Partial<TaskContext>): Promise<void>;
  getTaskContext(roomId: string): Promise<TaskContext>;

  // Capability Sharing
  shareCapabilities(roomId: string, capabilities: AgentCapability[]): Promise<void>;
  discoverCapabilities(roomId: string): Promise<AgentCapability[]>;
  requestCapability(roomId: string, request: CapabilityRequest): Promise<CapabilityResponse>;

  // Tool Sharing
  shareTools(roomId: string, tools: AgentTool[]): Promise<void>;
  discoverTools(roomId: string): Promise<AgentTool[]>;
  requestToolAccess(roomId: string, request: ToolAccessRequest): Promise<ToolAccessResponse>;

  // Communication
  sendCoordinationMessage(roomId: string, message: CoordinationMessage): Promise<void>;
  broadcastToAgents(message: AgentBroadcast): Promise<void>;
  subscribeToEvents(roomId: string, events: string[]): Promise<void>;
}

// Enso Room Types
export interface EnsoRoom {
  id: string;
  name: string;
  type: RoomType;
  purpose: RoomPurpose;

  // Configuration
  settings: RoomSettings;
  permissions: RoomPermissions;

  // Participants
  participants: RoomParticipant[];
  agents: string[];

  // Context
  sharedContext: SharedContext;
  capabilities: SharedCapability[];
  tools: SharedTool[];

  // Status
  status: RoomStatus;
  createdAt: Date;
  lastActivity: Date;

  // Metrics
  messageCount: number;
  collaborationScore: number;
  efficiency: number;
}

export type RoomType =
  | 'task_coordination'
  | 'team_collaboration'
  | 'capability_sharing'
  | 'knowledge_exchange'
  | 'resource_pooling'
  | 'emergency_response'
  | 'learning_community';

export interface RoomPurpose {
  primary: string;
  secondary?: string[];
  objectives: string[];
  successMetrics: string[];
}

export interface RoomSettings {
  isPublic: boolean;
  allowDiscovery: boolean;
  messageRetention: number; // days
  maxParticipants?: number;
  moderationLevel: 'none' | 'basic' | 'strict';
  encryption: boolean;
  persistence: boolean;
}

export interface RoomPermissions {
  read: string[];
  write: string[];
  moderate: string[];
  admin: string[];
  invite: string[];
}

export interface RoomParticipant {
  id: string;
  type: 'agent' | 'user' | 'system';
  role: ParticipantRole;
  joinedAt: Date;
  lastActive: Date;
  permissions: string[];
  status: ParticipantStatus;
}

export type ParticipantRole = 'owner' | 'moderator' | 'contributor' | 'observer' | 'guest';

export type ParticipantStatus = 'active' | 'idle' | 'away' | 'offline';

export type RoomStatus = 'active' | 'inactive' | 'archived' | 'suspended' | 'error';

export interface AgentRoomConfig {
  name: string;
  type: RoomType;
  purpose: RoomPurpose;
  settings?: Partial<RoomSettings>;
  permissions?: Partial<RoomPermissions>;
  initialAgents?: string[];
  taskContext?: TaskContext;
}

// Context Management
export interface TaskContext {
  taskId: string;
  taskTitle: string;
  taskDescription: string;

  // Task Analysis
  analysis: TaskAnalysis;
  assignment: AssignmentDecision;

  // Progress
  currentStatus: TaskStatus;
  progress: number; // 0-1
  milestones: TaskMilestone[];

  // Resources
  allocatedResources: TaskResource[];
  sharedResources: SharedResource[];

  // Dependencies
  dependencies: TaskDependency[];
  blockers: TaskBlocker[];

  // Communication
  communicationHistory: CommunicationEntry[];
  decisions: TaskDecision[];

  // Knowledge
  lessons: TaskLesson[];
  artifacts: TaskArtifact[];

  // Metadata
  lastUpdated: Date;
  version: number;
}

export interface TaskMilestone {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
  dependencies: string[];
}

export interface TaskResource {
  id: string;
  type: ResourceType;
  name: string;
  amount: number;
  unit: string;
  allocatedTo: string;
  status: ResourceStatus;
}

export type ResourceStatus = 'available' | 'allocated' | 'in_use' | 'exhausted';

export interface SharedResource {
  id: string;
  type: ResourceType;
  name: string;
  description: string;
  provider: string;
  accessLevel: AccessLevel;
  usage: ResourceUsage[];
  constraints: ResourceConstraint[];
}

export type AccessLevel = 'read' | 'write' | 'admin' | 'execute';

export interface ResourceUsage {
  userId: string;
  usedAt: Date;
  amount: number;
  purpose: string;
}

export interface ResourceConstraint {
  type: 'quota' | 'time_limit' | 'concurrent_users' | 'geographic';
  value: number | string;
  description: string;
}

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

export interface CommunicationEntry {
  id: string;
  type: CommunicationType;
  from: string;
  to: string | string[];
  subject?: string;
  content: string;
  timestamp: Date;
  threadId?: string;
  attachments?: CommunicationAttachment[];
  metadata?: Record<string, any>;
}

export type CommunicationType =
  | 'status_update'
  | 'question'
  | 'decision'
  | 'request'
  | 'notification'
  | 'alert'
  | 'knowledge_sharing';

export interface CommunicationAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  data?: any;
}

export interface TaskDecision {
  id: string;
  title: string;
  description: string;
  options: DecisionOption[];
  selectedOption?: string;
  decisionMaker: string;
  decidedAt: Date;
  rationale: string;
  impact: string;
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  risk: number; // 0-1
  effort: number; // 0-1
}

export interface TaskLesson {
  id: string;
  title: string;
  description: string;
  category: LessonCategory;
  severity: LessonSeverity;
  learnedBy: string;
  learnedAt: Date;
  applicableTo: string[];
  actionItems: string[];
}

export type LessonCategory =
  | 'technical'
  | 'process'
  | 'communication'
  | 'coordination'
  | 'tools'
  | 'methodology';

export type LessonSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface TaskArtifact {
  id: string;
  name: string;
  type: ArtifactType;
  description: string;
  createdBy: string;
  createdAt: Date;
  url?: string;
  data?: any;
  version: number;
  dependencies: string[];
}

export type ArtifactType =
  | 'code'
  | 'documentation'
  | 'design'
  | 'test'
  | 'configuration'
  | 'data'
  | 'model'
  | 'report';

export interface SharedContext {
  id: string;
  name: string;
  description: string;
  type: ContextType;
  content: any;
  permissions: ContextPermissions;
  version: number;
  lastUpdated: Date;
  updatedBy: string;
}

export type ContextType =
  | 'task_context'
  | 'project_context'
  | 'team_context'
  | 'knowledge_base'
  | 'best_practices'
  | 'templates'
  | 'standards';

export interface ContextPermissions {
  read: string[];
  write: string[];
  admin: string[];
  public: boolean;
}

// Capability Sharing
export interface AgentCapability {
  id: string;
  name: string;
  category: string;
  description: string;
  level: number; // 1-5
  experience: number; // hours
  successRate: number; // 0-1
  lastUsed: Date;
  endorsements: CapabilityEndorsement[];
  certifications: CapabilityCertification[];
  metadata: CapabilityMetadata;
}

export interface CapabilityEndorsement {
  endorserId: string;
  endorserName: string;
  level: number;
  timestamp: Date;
  context: string;
  verified: boolean;
}

export interface CapabilityCertification {
  id: string;
  name: string;
  issuer: string;
  issuedAt: Date;
  expiresAt?: Date;
  verified: boolean;
  credentials: Record<string, any>;
}

export interface CapabilityMetadata {
  version: string;
  tags: string[];
  prerequisites: string[];
  relatedCapabilities: string[];
  learningResources: LearningResource[];
  assessmentCriteria: AssessmentCriteria[];
}

export interface LearningResource {
  type: 'documentation' | 'tutorial' | 'course' | 'example' | 'tool';
  title: string;
  url?: string;
  description: string;
  difficulty: number; // 0-1
  estimatedTime: number; // minutes
}

export interface AssessmentCriteria {
  type: 'practical' | 'theoretical' | 'peer_review' | 'automated';
  description: string;
  passingScore: number; // 0-1
  weight: number; // 0-1
}

export interface SharedCapability {
  capability: AgentCapability;
  provider: string;
  sharingLevel: SharingLevel;
  accessConditions: AccessCondition[];
  usageStats: CapabilityUsage[];
  feedback: CapabilityFeedback[];
}

export type SharingLevel = 'public' | 'team' | 'project' | 'restricted' | 'private';

export interface AccessCondition {
  type: ConditionType;
  requirement: string;
  description: string;
}

export type ConditionType =
  | 'skill_level'
  | 'security_clearance'
  | 'team_membership'
  | 'project_role'
  | 'custom';

export interface CapabilityUsage {
  userId: string;
  usedAt: Date;
  context: string;
  success: boolean;
  feedback?: string;
  duration: number; // minutes
}

export interface CapabilityFeedback {
  userId: string;
  rating: number; // 1-5
  comment: string;
  timestamp: Date;
  helpful: boolean;
}

export interface CapabilityRequest {
  requestId: string;
  requesterId: string;
  capabilityId: string;
  purpose: string;
  context: string;
  urgency: RequestUrgency;
  duration?: number; // minutes
  alternatives?: string[];
}

export type RequestUrgency = 'low' | 'medium' | 'high' | 'critical';

export interface CapabilityResponse {
  requestId: string;
  capabilityId: string;
  providerId: string;
  response: ResponseType;
  reasoning?: string;
  conditions?: AccessCondition[];
  estimatedDuration?: number;
  cost?: number;
  alternatives?: string[];
}

export type ResponseType =
  | 'accepted'
  | 'rejected'
  | 'conditional'
  | 'deferred'
  | 'alternative_offered';

// Tool Sharing
export interface AgentTool {
  id: string;
  name: string;
  description: string;
  category: string;
  type: ToolType;
  version: string;

  // Access
  accessLevel: ToolAccessLevel;
  permissions: ToolPermission[];

  // Configuration
  configuration: ToolConfiguration;
  requirements: ToolRequirement[];

  // Usage
  usageStats: ToolUsage[];
  documentation: ToolDocumentation;

  // Integration
  endpoints: ToolEndpoint[];
  events: ToolEvent[];

  // Metadata
  metadata: ToolMetadata;
}

export type ToolType =
  | 'cli'
  | 'api'
  | 'library'
  | 'service'
  | 'interface'
  | 'workflow'
  | 'automation'
  | 'analysis';

export type ToolAccessLevel = 'read' | 'write' | 'execute' | 'admin';

export interface ToolPermission {
  action: string;
  description: string;
  required: boolean;
  risk: 'low' | 'medium' | 'high';
}

export interface ToolConfiguration {
  parameters: ToolParameter[];
  settings: ToolSetting[];
  defaults: Record<string, any>;
  validation: ValidationRule[];
}

export interface ToolParameter {
  name: string;
  type: ParameterType;
  required: boolean;
  description: string;
  defaultValue?: any;
  validation?: ValidationRule[];
}

export type ParameterType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'file' | 'enum';

export interface ValidationRule {
  type: ValidationType;
  rule: string;
  message: string;
}

export type ValidationType = 'required' | 'format' | 'range' | 'length' | 'pattern' | 'custom';

export interface ToolSetting {
  name: string;
  value: any;
  description: string;
  configurable: boolean;
  category: string;
}

export interface ToolRequirement {
  type: 'software' | 'hardware' | 'service' | 'permission' | 'resource';
  requirement: string;
  version?: string;
  optional: boolean;
}

export interface ToolUsage {
  userId: string;
  usedAt: Date;
  action: string;
  parameters: Record<string, any>;
  duration: number; // milliseconds
  success: boolean;
  error?: string;
  resources: ResourceUsage[];
}

export interface ToolDocumentation {
  overview: string;
  installation?: string;
  configuration?: string;
  examples: ToolExample[];
  api?: ToolAPI;
  troubleshooting?: TroubleshootingEntry[];
}

export interface ToolExample {
  title: string;
  description: string;
  code?: string;
  parameters?: Record<string, any>;
  expectedOutput?: any;
  useCase: string;
}

export interface ToolAPI {
  endpoints: APIEndpoint[];
  authentication: AuthenticationMethod;
  rateLimit?: RateLimit;
  version: string;
}

export interface APIEndpoint {
  path: string;
  method: HTTPMethod;
  description: string;
  parameters: APIParameter[];
  responses: APIResponse[];
  examples?: any[];
}

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface APIParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'body';
  type: ParameterType;
  required: boolean;
  description: string;
}

export interface APIResponse {
  code: number;
  description: string;
  schema?: any;
  examples?: any[];
}

export interface AuthenticationMethod {
  type: 'none' | 'api_key' | 'oauth' | 'basic' | 'bearer' | 'custom';
  configuration: Record<string, any>;
}

export interface RateLimit {
  requests: number;
  window: number; // seconds
  strategy: 'fixed' | 'sliding' | 'token_bucket';
}

export interface TroubleshootingEntry {
  problem: string;
  solution: string;
  causes: string[];
  prevention?: string;
}

export interface ToolEndpoint {
  id: string;
  type: EndpointType;
  url: string;
  method: HTTPMethod;
  authentication?: AuthenticationMethod;
  rateLimit?: RateLimit;
  healthCheck?: HealthCheck;
}

export type EndpointType = 'rest' | 'graphql' | 'websocket' | 'grpc' | 'mcp';

export interface HealthCheck {
  endpoint: string;
  interval: number; // seconds
  timeout: number; // seconds
  expectedStatus: number;
}

export interface ToolEvent {
  name: string;
  description: string;
  payload: EventPayload;
  triggers: EventTrigger[];
}

export interface EventPayload {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  schema?: any;
  examples?: any[];
}

export interface EventTrigger {
  type: 'action' | 'schedule' | 'condition' | 'webhook';
  configuration: Record<string, any>;
}

export interface ToolMetadata {
  author: string;
  license: string;
  repository?: string;
  documentation?: string;
  tags: string[];
  categories: string[];
  dependencies: string[];
  compatibility: CompatibilityInfo[];
  security: SecurityInfo;
}

export interface CompatibilityInfo {
  platform: string;
  version: string;
  status: 'supported' | 'deprecated' | 'unsupported';
}

export interface SecurityInfo {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  vulnerabilities: SecurityVulnerability[];
  permissions: string[];
  dataHandling: DataHandlingPolicy;
}

export interface SecurityVulnerability {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation?: string;
  fixedIn?: string;
}

export interface DataHandlingPolicy {
  dataRetention: string;
  dataEncryption: boolean;
  dataSharing: boolean;
  compliance: string[];
}

export interface SharedTool {
  tool: AgentTool;
  provider: string;
  sharingLevel: SharingLevel;
  accessConditions: AccessCondition[];
  usageStats: ToolUsage[];
  feedback: ToolFeedback[];
  availability: ToolAvailability;
}

export interface ToolFeedback {
  userId: string;
  rating: number; // 1-5
  comment: string;
  timestamp: Date;
  helpful: boolean;
  issues?: string[];
}

export interface ToolAvailability {
  status: 'available' | 'unavailable' | 'degraded' | 'maintenance';
  lastChecked: Date;
  uptime: number; // 0-1
  responseTime: number; // milliseconds
  issues: AvailabilityIssue[];
}

export interface AvailabilityIssue {
  type: 'outage' | 'degradation' | 'maintenance' | 'error';
  description: string;
  start: Date;
  end?: Date;
  impact: string;
}

export interface ToolAccessRequest {
  requestId: string;
  requesterId: string;
  toolId: string;
  purpose: string;
  context: string;
  urgency: RequestUrgency;
  duration?: number; // minutes
  requiredActions: string[];
  alternatives?: string[];
}

export interface ToolAccessResponse {
  requestId: string;
  toolId: string;
  providerId: string;
  response: ResponseType;
  reasoning?: string;
  conditions?: AccessCondition[];
  grantedActions: string[];
  estimatedDuration?: number;
  cost?: number;
  alternatives?: string[];
}

// Communication
export interface CoordinationMessage {
  id: string;
  type: MessageType;
  from: string;
  to: string | string[];
  roomId: string;

  // Content
  subject?: string;
  content: string;
  attachments?: MessageAttachment[];
  metadata?: Record<string, any>;

  // Context
  taskId?: string;
  capabilityId?: string;
  toolId?: string;
  threadId?: string;

  // Timing
  sentAt: Date;
  expiresAt?: Date;
  priority: MessagePriority;

  // Status
  status: MessageStatus;
  deliveryReceipts?: DeliveryReceipt[];
}

export type MessageType =
  | 'task_assignment'
  | 'task_update'
  | 'capability_request'
  | 'capability_offer'
  | 'tool_request'
  | 'tool_offer'
  | 'coordination_request'
  | 'status_update'
  | 'knowledge_sharing'
  | 'decision_notification'
  | 'resource_request'
  | 'emergency_alert';

export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'expired';

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  data?: any;
}

export interface DeliveryReceipt {
  recipientId: string;
  status: 'delivered' | 'read' | 'failed';
  timestamp: Date;
  error?: string;
}

export interface AgentBroadcast {
  id: string;
  type: BroadcastType;
  from: string;

  // Audience
  audience: BroadcastAudience;
  filters?: BroadcastFilter[];

  // Content
  subject?: string;
  content: string;
  attachments?: MessageAttachment[];

  // Context
  context?: Record<string, any>;

  // Timing
  sentAt: Date;
  expiresAt?: Date;
  priority: MessagePriority;

  // Status
  status: BroadcastStatus;
  deliveryStats: DeliveryStats;
}

export type BroadcastType =
  | 'system_announcement'
  | 'capability_sharing'
  | 'tool_availability'
  | 'emergency_alert'
  | 'knowledge_update'
  | 'policy_change'
  | 'maintenance_notice';

export interface BroadcastAudience {
  type: 'all' | 'agents' | 'users' | 'teams' | 'roles' | 'capabilities' | 'custom';
  target: string | string[];
}

export interface BroadcastFilter {
  field: string;
  operator: 'equals' | 'contains' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
}

export type BroadcastStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'expired';

export interface DeliveryStats {
  totalRecipients: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  pendingDeliveries: number;
  deliveryRate: number; // 0-1
  averageDeliveryTime: number; // milliseconds
}

// Common Types
export type TaskStatus =
  | 'assigned'
  | 'accepted'
  | 'started'
  | 'in_progress'
  | 'blocked'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'rejected';

export type ResourceType =
  | 'cpu'
  | 'memory'
  | 'storage'
  | 'network'
  | 'gpu'
  | 'specialized_hardware'
  | 'software_license'
  | 'api_quota';

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
