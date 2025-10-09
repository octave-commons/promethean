# Agent OS Database Schemas

## 1. Agent Instances Collection

```typescript
interface AgentInstanceDocument {
  _id: ObjectId;
  
  // Identification
  instanceId: string;              // UUID v4
  agentType: string;               // References agent template
  name: string;                    // Human-readable name
  description?: string;
  
  // Status & Health
  status: 'initializing' | 'idle' | 'busy' | 'collaborating' | 
          'maintenance' | 'suspended' | 'error' | 'terminating' | 'terminated';
  health: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
  lastHeartbeat: Date;
  lastActive: Date;
  
  // Ownership & Permissions
  owner: string;                   // System user or orchestrator
  teamId?: string;                 // Team membership
  permissions: string[];           // Permission names
  
  // Capabilities
  capabilities: AgentCapability[];
  
  // Resource Allocation
  resourceAllocation: ResourceAllocation;
  
  // Session & Context
  sessionContext: {
    sessionId: string;
    activeSince: Date;
    contextData: any;
    memorySnapshot?: any;
  };
  
  // Performance Metrics
  performanceMetrics: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageTaskDuration: number;
    successRate: number;
    reputation: number;
    lastUpdated: Date;
  };
  
  // Learning & Adaptation
  learningProfile: {
    learningEnabled: boolean;
    adaptationRate: number;
    experiencePoints: number;
    skillImprovements: SkillImprovement[];
  };
  
  // Metadata
  version: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Audit fields
  createdBy: string;
  updatedBy: string;
}
```

## 2. Task Assignments Collection

```typescript
interface TaskAssignmentDocument {
  _id: ObjectId;
  
  // Assignment Identification
  assignmentId: string;
  taskId: string;                   // From kanban board
  agentInstanceId: string;
  
  // Assignment Metadata
  assignedAt: Date;
  assignedBy: string;               // User or orchestrator
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  deadline?: Date;
  estimatedDuration?: number;       // minutes
  
  // Assignment Status
  status: 'proposed' | 'assigned' | 'accepted' | 'rejected' | 
          'in_progress' | 'review' | 'completed' | 'failed' | 'cancelled';
  
  // Status Timestamps
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  
  // Performance Tracking
  progress: {
    percentage: number;
    currentStep?: string;
    estimatedCompletion?: Date;
  };
  
  qualityScore?: number;            // 0-1
  efficiencyScore?: number;         // 0-1
  
  // Task Context
  taskData: {
    title: string;
    description: string;
    requirements: TaskRequirement[];
    complexity: number;             // 1-10
    tags: string[];
  };
  
  // Assignment Context
  assignmentContext: {
    confidence: number;             // 0-1
    strategy: string;
    reasoning: string;
    alternatives?: AlternativeAssignment[];
  };
  
  // Collaboration
  collaborators: {
    agentInstanceId: string;
    role: string;
    responsibilities: string[];
    joinedAt: Date;
  }[];
  
  // Learning Outcomes
  learningOutcomes: {
    capabilityImprovements: string[];
    newSkillsAcquired: string[];
    experienceGained: number;
    lessonsLearned: string[];
  }[];
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}
```

## 3. Agent Capabilities Collection

```typescript
interface AgentCapabilityDocument {
  _id: ObjectId;
  
  // Capability Identification
  capabilityId: string;
  agentInstanceId: string;
  name: string;
  category: CapabilityCategory;
  
  // Proficiency & Experience
  level: ProficiencyLevel;          // 1-5
  experience: number;               // Experience points
  successRate: number;              // 0-1
  lastUsed: Date;
  usageCount: number;
  
  // Dynamic Properties
  learningRate: number;
  adaptationRate: number;
  collaborationBonus: number;
  
  // Required Tools & Prerequisites
  requiredTools: string[];
  prerequisites: string[];
  
  // Performance History
  performanceHistory: {
    date: Date;
    taskComplexity: number;
    success: boolean;
    duration: number;
    qualityScore: number;
  }[];
  
  // Endorsements
  endorsements: {
    endorsedBy: string;             // Agent or user ID
    capability: string;
    confidence: number;             // 0-1
    endorsedAt: Date;
  }[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

## 4. Agent Sessions Collection

```typescript
interface AgentSessionDocument {
  _id: ObjectId;
  
  // Session Identification
  sessionId: string;
  agentInstanceId: string;
  
  // Session Lifecycle
  createdAt: Date;
  lastActivity: Date;
  expiresAt?: Date;
  terminatedAt?: Date;
  parentSessionId?: string;
  childSessionIds: string[];
  
  // Session State
  status: 'active' | 'paused' | 'expired' | 'terminated';
  
  // Conversation Context
  conversationHistory: {
    timestamp: Date;
    role: string;
    content: string;
    metadata?: any;
  }[];
  
  // Working Memory
  workingMemory: {
    id: string;
    type: string;
    data: any;
    priority: number;
    expiresAt?: Date;
  }[];
  
  // Tool State
  activeTools: {
    toolName: string;
    sessionId: string;
    state: any;
    lastUsed: Date;
  }[];
  
  // Tool History
  toolHistory: {
    toolName: string;
    action: string;
    timestamp: Date;
    duration: number;
    success: boolean;
    error?: string;
  }[];
  
  // Learning State
  recentLearning: {
    concept: string;
    confidence: number;
    learnedAt: Date;
    context: string;
  }[];
  
  // Collaboration State
  activeCollaborations: {
    collaborationId: string;
    participants: string[];
    role: string;
    status: string;
    startedAt: Date;
  }[];
  
  // Performance Snapshot
  currentMetrics: {
    taskProgress: number;
    resourceUsage: ResourceUsage;
    errorCount: number;
    efficiency: number;
  };
  
  // Session Configuration
  configuration: {
    maxDuration: number;
    resourceLimits: ResourceLimits;
    permissions: string[];
    allowedTools: string[];
  };
}
```

## 5. Agent Resources Collection

```typescript
interface AgentResourceDocument {
  _id: ObjectId;
  
  // Resource Identification
  resourceId: string;
  agentInstanceId: string;
  resourceType: ResourceType;
  
  // Allocation Details
  allocation: {
    amount: number;
    unit: string;
    priority: number;
    allocatedAt: Date;
    expiresAt?: Date;
  };
  
  // Usage Tracking
  currentUsage: {
    amount: number;
    unit: string;
    timestamp: Date;
  };
  
  usageHistory: {
    timestamp: Date;
    amount: number;
    operation: 'allocate' | 'use' | 'release';
    metadata?: any;
  }[];
  
  // Limits & Quotas
  limits: {
    maximum: number;
    dailyQuota?: number;
    hourlyQuota?: number;
    burstLimit?: number;
  };
  
  // Cost Tracking
  cost: {
    perUnit: number;
    currency: string;
    totalCost: number;
    budget?: number;
  };
  
  // Metadata
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 6. Agent Events Collection

```typescript
interface AgentEventDocument {
  _id: ObjectId;
  
  // Event Identification
  eventId: string;
  agentInstanceId: string;
  eventType: AgentEventType;
  
  // Event Details
  timestamp: Date;
  source: string;                   // System component that generated event
  severity: 'info' | 'warning' | 'error' | 'critical';
  
  // Event Data
  data: {
    message: string;
    details?: any;
    context?: Record<string, any>;
  };
  
  // Event Relationships
  relatedEventId?: string;
  causationEventId?: string;
  correlationId?: string;
  
  // Performance Impact
  performanceImpact?: {
    cpuUsage: number;
    memoryUsage: number;
    responseTime: number;
  };
  
  // Security Context
  securityContext?: {
    authenticated: boolean;
    permissions: string[];
    ipAddress: string;
    userAgent: string;
  };
  
  // Processing Status
  processed: boolean;
  processedAt?: Date;
  processingResult?: {
    action: string;
    success: boolean;
    error?: string;
  };
  
  // Indexing & Search
  searchableText: string;
  tags: string[];
}
```

## 7. Agent Teams Collection

```typescript
interface AgentTeamDocument {
  _id: ObjectId;
  
  // Team Identification
  teamId: string;
  name: string;
  description?: string;
  
  // Team Composition
  members: {
    agentInstanceId: string;
    role: TeamRole;
    responsibilities: string[];
    joinedAt: Date;
    permissions: string[];
  }[];
  
  // Team Configuration
  configuration: {
    maxMembers: number;
    defaultCommunicationProtocol: string;
    decisionMakingProcess: string;
    conflictResolutionStrategy: string;
  };
  
  // Team Performance
  performanceMetrics: {
    totalTasks: number;
    completedTasks: number;
    averageTaskDuration: number;
    collaborationEfficiency: number;
    memberSatisfaction: number;
  };
  
  // Active Collaborations
  activeCollaborations: {
    collaborationId: string;
    taskId: string;
    participants: string[];
    status: string;
    startedAt: Date;
  }[];
  
  // Team Learning
  teamLearning: {
    sharedSkills: string[];
    communicationPatterns: CommunicationPattern[];
    processImprovements: ProcessImprovement[];
  };
  
  // Metadata
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

## 8. Agent Policies Collection

```typescript
interface AgentPolicyDocument {
  _id: ObjectId;
  
  // Policy Identification
  policyId: string;
  name: string;
  description?: string;
  policyType: PolicyType;
  
  // Policy Scope
  scope: {
    agentTypes?: string[];
    agentInstances?: string[];
    teams?: string[];
    capabilities?: string[];
  };
  
  // Policy Rules
  rules: PolicyRule[];
  
  // Enforcement
  enforcement: {
    level: 'advisory' | 'warning' | 'blocking';
    actions: PolicyAction[];
    exceptions: PolicyException[];
  };
  
  // Policy Lifecycle
  status: 'draft' | 'active' | 'suspended' | 'deprecated';
  effectiveFrom: Date;
  effectiveTo?: Date;
  version: string;
  
  // Compliance & Audit
  complianceRequirements?: {
    standards: string[];
    controls: string[];
    reportingRequirements: string[];
  };
  
  // Policy Metadata
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
}
```

## Indexes Strategy

### Agent Instances Collection
```javascript
// Primary and query indexes
db.agent_instances.createIndex({ instanceId: 1 }, { unique: true });
db.agent_instances.createIndex({ agentType: 1, status: 1 });
db.agent_instances.createIndex({ status: 1, lastActive: -1 });
db.agent_instances.createIndex({ owner: 1, teamId: 1 });
db.agent_instances.createIndex({ "capabilities.name": 1, "capabilities.level": -1 });
db.agent_instances.createIndex({ createdAt: -1 });
db.agent_instances.createIndex({ tags: 1 });
```

### Task Assignments Collection
```javascript
db.task_assignments.createIndex({ assignmentId: 1 }, { unique: true });
db.task_assignments.createIndex({ taskId: 1, agentInstanceId: 1 });
db.task_assignments.createIndex({ agentInstanceId: 1, status: 1 });
db.task_assignments.createIndex({ status: 1, assignedAt: -1 });
db.task_assignments.createIndex({ assignedBy: 1, createdAt: -1 });
db.task_assignments.createIndex({ deadline: 1, status: 1 });
```

### Agent Sessions Collection
```javascript
db.agent_sessions.createIndex({ sessionId: 1 }, { unique: true });
db.agent_sessions.createIndex({ agentInstanceId: 1, status: 1 });
db.agent_sessions.createIndex({ lastActivity: -1, status: 1 });
db.agent_sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### Agent Events Collection
```javascript
db.agent_events.createIndex({ eventId: 1 }, { unique: true });
db.agent_events.createIndex({ agentInstanceId: 1, timestamp: -1 });
db.agent_events.createIndex({ eventType: 1, timestamp: -1 });
db.agent_events.createIndex({ severity: 1, timestamp: -1 });
db.agent_events.createIndex({ correlationId: 1 });
db.agent_events.createIndex({ tags: 1 });
db.agent_events.createIndex({ searchableText: "text" });
```

These schemas provide a comprehensive foundation for storing and managing all aspects of the Agent OS system, with appropriate indexing for performance and scalability.