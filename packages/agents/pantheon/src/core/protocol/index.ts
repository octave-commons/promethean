/**
 * Pantheon Core Protocol Module
 *
 * Provides core protocol definitions and adapters for agent communication
 * including OS protocol types and crisis coordination functionality.
 */

// Core protocol types
export * from '../types/os-protocol';

// Protocol adapters
export * from './protocol-adapter';

// Convenience exports
export {
  AgentBusAdapter,
  CrisisCoordinator,
  CrisisMessageType,
  CrisisLevel,
  EmergencyCrisisSystem,
} from './protocol-adapter';
