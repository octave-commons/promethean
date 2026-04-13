/**
 * Integration Index
 */

export {
  toSignalObservation,
  createCorrelationEdge,
  generateRadarFinding,
  calculateThreatProximity,
  scoreDomain,
  type RadarFindingInput
} from './threat-radar.js';

export {
  SintelCephalonBridge,
  createSintelBridge,
  formatObservation,
  formatBskySignal,
  formatRadarFinding,
  confidenceToPriority,
  observationTypeToCategory,
  comparePriority,
  type CephalonSignal,
  type CephalonSignalCategory,
  type CephalonSignalPriority,
  type CephalonMessageProposal,
  type SintelCephalonBridgeConfig
} from './cephalon-bridge.js';