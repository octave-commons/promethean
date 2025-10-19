/**
 * Pantheon Agent Framework - Main Entry Point
 *
 * This is the unified framework consolidating:
 * - Context Management (agent-context)
 * - Orchestration (agent-orchestrator)
 * - Protocol Communication (agent-protocol)
 * - Workflow System (agents-workflow)
 * - OS Protocol (agent-os-protocol)
 * - Agent Generator (agent-generator)
 * - Management UI (agent-management-ui)
 */

// ============================================================================
// Core Exports
// ============================================================================

export * from './core/index.js';

// ============================================================================
// Module Exports
// ============================================================================

// Context Management
export * as Context from './context/index.js';

// Orchestration
export * as Orchestrator from './orchestrator/index.js';

// Protocol Communication
export * as Protocol from './protocol/index.js';

// Workflow System
export * as Workflow from './workflow/index.js';

// OS Protocol
export * as OSProtocol from './os-protocol/index.js';

// Agent Generator
export * as Generator from './generator/index.js';

// Management UI
export * as ManagementUI from './management-ui/index.js';

// ============================================================================
// Shared Utilities
// ============================================================================

export * as Shared from './shared/index.js';

// ============================================================================
// Convenience Exports
// ============================================================================

// Re-export commonly used classes and functions
export {
  // Core types
  AgentId,
  AgentStatus,
  ContextId,
  MessageEnvelope,
  WorkflowDefinition,
  AgentInstance,
  PantheonError,
  ContextError,
  ProtocolError,
  WorkflowError,
  OrchestrationError,
} from './core/index.js';

// ============================================================================
// Version Information
// ============================================================================

export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();
export const MODULE_NAME = '@promethean/pantheon';

// ============================================================================
// Framework Information
// ============================================================================

export const FrameworkInfo = {
  name: 'Pantheon Agent Framework',
  version: VERSION,
  description: 'Unified agent framework for the Promethean ecosystem',
  modules: [
    'context',
    'orchestrator',
    'protocol',
    'workflow',
    'os-protocol',
    'generator',
    'management-ui',
  ],
  buildDate: BUILD_DATE,
  repository: 'https://github.com/promethean/pantheon',
} as const;

// ============================================================================
// Default Exports
// ============================================================================

export default {
  VERSION,
  FrameworkInfo,
  // Module namespaces
  Context,
  Orchestrator,
  Protocol,
  Workflow,
  OSProtocol,
  Generator,
  ManagementUI,
  Shared,
};
