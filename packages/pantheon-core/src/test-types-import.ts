/**
 * Test file to verify that all types can be imported correctly
 */

// Test importing all types from the main export
import type {
  // Core Message Types
  Role,
  Message,

  // Context Management Types
  ContextSource,
  ContextMetadata,
  ContextShare,
  ContextPermission,

  // Actor and Behavior Types
  BehaviorMode,
  Behavior,
  Talent,
  ActorScript,
  Actor,
  ActorState,

  // Action Types
  Action,

  // Tool and Runtime Types
  ToolSpec,
  ToolDefinition,

  // Transport and Protocol Types
  MessageEnvelope,
  TransportConfig,
  RetryPolicy,

  // Orchestration Types
  AgentTask,
  AgentStatus,
  SessionInfo,
  SessionListResponse,
  AgentOrchestratorConfig,

  // Workflow Types
  ModelReference,
  AgentDefinition,
  ResolvedAgentDefinition,
  WorkflowNode,
  WorkflowEdge,
  WorkflowDefinition,
  AgentWorkflowGraph,

  // Security and Auth Types
  AuthToken,
  SecurityContext,

  // Error and Event Types
  PantheonError,
  SystemEvent,

  // Utility Types
  Result,
  AsyncResult,
  PaginatedResponse,

  // Type Guards
  isMessage,
  isToolSpec,
  isMessageEnvelope,
} from './index.js';

// Test importing port types
import type {
  ContextPort,
  ToolPort,
  LlmPort,
  MessageBus,
  Scheduler,
  ActorStatePort,
} from './core/ports.js';

// Test that types can be used
const testMessage: Message = {
  role: 'user',
  content: 'Hello, world!',
};

const testActor: Actor = {
  id: 'test-actor',
  script: {
    name: 'Test Actor',
    contextSources: [],
    talents: [],
  },
  goals: ['test goal'],
  state: 'idle',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const testResult: Result<string> = {
  success: true,
  data: 'test',
};

// Test type guards
const isValidMessage = isMessage(testMessage);
const isValidToolSpec = isToolSpec({
  name: 'test-tool',
  description: 'Test tool',
  parameters: {},
  runtime: 'local',
});

console.log('Type import test completed successfully');
console.log('Message is valid:', isValidMessage);
console.log('ToolSpec is valid:', isValidToolSpec);
