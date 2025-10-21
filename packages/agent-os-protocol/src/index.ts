/**
 * Agent OS Core Message Protocol
 * Main entry point for the complete protocol implementation
 */

// Core types and interfaces
export * from './core/types';

// Protocol adapters for compatibility
export * from './adapters/protocol-adapter';

// Crisis management system
export * from './crisis/coordinator';

// Main exports
export {
  AgentBusAdapter,
  OmniAdapter,
  EnsoAdapter,
  UniversalProtocolAdapter,
  EmergencyCrisisSystem,
} from './adapters/protocol-adapter';
export { CrisisCoordinator } from './crisis/coordinator';
