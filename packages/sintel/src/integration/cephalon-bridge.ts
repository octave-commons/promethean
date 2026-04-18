/**
 * Sintel-Cephalon Bridge
 * 
 * Feeds Sintel perception signals into the Cephalon mind queue.
 * This is the J (perception) layer of the J→C→A loop.
 */

import type { UUID, Observation } from '../core/types.js';
import type { BskySignal } from '../discovery/passive/bluesky.js';
import type { RadarFinding } from '@open-hax/signal-contracts';
import { scoreDomain } from '../integration/threat-radar.js';

// ============================================================================
// Cephalon Signal Types
// ============================================================================

/**
 * Signal categories for cephalon perception.
 */
export type CephalonSignalCategory = 
  | 'infrastructure'    // DNS, TLS, HTTP observations
  | 'social'            // Bluesky, social media signals
  | 'security'          // Vulnerability detections
  | 'anomaly'           // Unusual patterns
  | 'threat'            // Risk indicators
  | 'context';          // Enrichment data

/**
 * Priority levels for cephalon attention.
 */
export type CephalonSignalPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * A signal formatted for cephalon consumption.
 */
export interface CephalonSignal {
  /** Unique signal ID */
  readonly id: UUID;
  /** Signal category */
  readonly category: CephalonSignalCategory;
  /** Priority for cephalon attention */
  readonly priority: CephalonSignalPriority;
  /** Brief summary for cephalon context */
  readonly summary: string;
  /** Detailed evidence */
  readonly evidence: string;
  /** Confidence 0.0-1.0 */
  readonly confidence: number;
  /** Whether signal requires action */
  readonly actionable: boolean;
  /** Suggested action if actionable */
  readonly suggestedAction?: string;
  /** Source type */
  readonly source: string;
  /** Tags for categorization */
  readonly tags: string[];
  /** When observed */
  readonly observedAt: string;
  /** Raw observation */
  readonly raw?: Observation | BskySignal | RadarFinding;
}

/**
 * Message proposal format for CephalonMindQueue.
 */
export interface CephalonMessageProposal {
  readonly id: string;
  readonly sessionId: string;
  readonly cephalonId: string;
  readonly circuitIndex?: number;
  readonly createdAt: number;
  readonly content: string;
  readonly rationale?: string;
  readonly suggestedChannelId?: string;
  readonly suggestedChannelName?: string;
  readonly sourceEventType?: string;
}

/**
 * Bridge configuration.
 */
export interface SintelCephalonBridgeConfig {
  /** Cephalon session ID to send signals to */
  readonly sessionId: string;
  /** Cephalon ID within the session */
  readonly cephalonId: string;
  /** Circuit index (C1-C8) */
  readonly circuitIndex?: number;
  /** Minimum confidence to forward */
  readonly minConfidence?: number;
  /** Maximum signals per tick */
  readonly maxSignalsPerTick?: number;
  /** Categories to forward */
  readonly categories?: CephalonSignalCategory[];
  /** Priority threshold */
  readonly minPriority?: CephalonSignalPriority;
  /** Custom formatter for signals */
  readonly formatter?: (signal: CephalonSignal) => CephalonMessageProposal;
}

// ============================================================================
// Priority Mapping
// ============================================================================

const PRIORITY_ORDER: Record<CephalonSignalPriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

/**
 * Compare two priorities.
 */
export function comparePriority(
  a: CephalonSignalPriority, 
  b: CephalonSignalPriority
): number {
  return PRIORITY_ORDER[b] - PRIORITY_ORDER[a];
}

// ============================================================================
// Signal Formatting
// ============================================================================

/**
 * Map Sintel observation confidence to Cephalon priority.
 */
export function confidenceToPriority(confidence: number, riskScore?: number): CephalonSignalPriority {
  // If we have a risk score, use it
  if (riskScore !== undefined) {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }
  
  // Otherwise use confidence
  if (confidence >= 0.9) return 'high';
  if (confidence >= 0.7) return 'medium';
  return 'low';
}

/**
 * Map observation type to category.
 */
export function observationTypeToCategory(type: string): CephalonSignalCategory {
  switch (type) {
    case 'dns_record':
    case 'certificate':
    case 'http_response':
    case 'tls_handshake':
      return 'infrastructure';
    case 'vulnerability':
      return 'security';
    case 'correlation':
    case 'entity_match':
      return 'context';
    default:
      return 'anomaly';
  }
}

/**
 * Format a Sintel observation as a Cephalon signal.
 */
export function formatObservation(
  obs: Observation, 
  riskIndicators?: Array<{ category: string; name: string; severity: string }>
): CephalonSignal {
  const category = observationTypeToCategory(obs.evidence.type);
  const baseConfidence = obs.confidence.overall;
  
  // Calculate priority
  const hasHighSeverity = riskIndicators?.some(i => i.severity === 'critical' || i.severity === 'high');
  const priority: CephalonSignalPriority = hasHighSeverity 
    ? 'high' 
    : confidenceToPriority(baseConfidence);
  
  // Build summary
  const summary = `${obs.evidence.type} for ${obs.provenance.strategy} collection`;
  
  // Build evidence
  const evidence = JSON.stringify(obs.evidence.raw, null, 2);
  
  // Determine if actionable
  const actionable = category === 'security' || category === 'threat' || priority === 'critical';
  
  // Build tags
  const tags = [
    obs.evidence.type,
    `strategy:${obs.provenance.strategy}`,
    `state:${obs.state}`,
    ...Object.keys(obs.evidence.metadata).slice(0, 5),
  ].filter(Boolean);
  
  return {
    id: obs.id,
    category,
    priority,
    summary,
    evidence,
    confidence: baseConfidence,
    actionable,
    suggestedAction: actionable ? 'Investigate risk indicator' : undefined,
    source: 'sintel',
    tags,
    observedAt: obs.created_at,
    raw: obs,
  };
}

/**
 * Format a Bluesky signal as a Cephalon signal.
 */
export function formatBskySignal(signal: BskySignal): CephalonSignal {
  const priority = confidenceToPriority(signal.strength);
  
  const summary = signal.type === 'post' 
    ? `Post by ${signal.author?.handle || signal.author?.did || 'unknown'}`
    : signal.type === 'mention'
    ? `Mention of tracked entity`
    : `${signal.type} from ${signal.author?.handle || 'unknown'}`;
  
  const evidence = signal.post?.text 
    ? signal.post.text.slice(0, 500)
    : JSON.stringify(signal, null, 2);
  
  const tags = [
    'bluesky',
    signal.type,
    ...signal.tags.slice(0, 5),
  ];
  
  return {
    id: signal.id,
    category: 'social',
    priority,
    summary,
    evidence,
    confidence: signal.strength,
    actionable: signal.type === 'anomaly' || priority === 'critical',
    source: 'bluesky',
    tags,
    observedAt: signal.observedAt,
    raw: signal,
  };
}

/**
 * Format a Radar finding as a Cephalon signal.
 */
export function formatRadarFinding(finding: RadarFinding): CephalonSignal {
  const priority = confidenceToPriority(0.5, finding.risk_score);
  
  const summary = `${finding.domain}: ${finding.risk_level} risk (${finding.risk_score})`;
  const evidence = finding.summary;
  
  const tags = [
    'radar',
    finding.risk_level,
    ...finding.tags.slice(0, 5),
  ];
  
  return {
    id: finding.id,
    category: 'threat',
    priority,
    summary,
    evidence,
    confidence: finding.risk_score / 100,
    actionable: finding.risk_level === 'high' || finding.risk_level === 'critical',
    suggestedAction: 'Review and investigate risk finding',
    source: 'radar',
    tags,
    observedAt: new Date().toISOString(),
    raw: finding,
  };
}

// ============================================================================
// Bridge Class
// ============================================================================

/**
 * Bridge between Sintel and Cephalon mind queue.
 * 
 * Subscribes to Sintel observations and forwards signals
 * to the Cephalon perception layer.
 */
export class SintelCephalonBridge {
  private readonly config: Required<SintelCephalonBridgeConfig>;
  private signalBuffer: CephalonSignal[] = [];
  
  constructor(config: SintelCephalonBridgeConfig) {
    this.config = {
      sessionId: config.sessionId,
      cephalonId: config.cephalonId,
      circuitIndex: config.circuitIndex ?? 5, // Default to C5 (perception circuit)
      minConfidence: config.minConfidence ?? 0.5,
      maxSignalsPerTick: config.maxSignalsPerTick ?? 10,
      categories: config.categories ?? ['infrastructure', 'social', 'security', 'threat', 'anomaly'],
      minPriority: config.minPriority ?? 'medium',
      formatter: config.formatter ?? this.defaultFormatter,
    };
  }
  
  /**
   * Process a Sintel observation and potentially queue for cephalon.
   */
  processObservation(obs: Observation, riskIndicators?: Array<{ category: string; name: string; severity: string }>): void {
    const signal = formatObservation(obs, riskIndicators);
    this.maybeEnqueue(signal);
  }
  
  /**
   * Process a Bluesky signal and potentially queue for cephalon.
   */
  processBskySignal(signal: BskySignal): void {
    const cephalonSignal = formatBskySignal(signal);
    this.maybeEnqueue(cephalonSignal);
  }
  
  /**
   * Process a radar finding and potentially queue for cephalon.
   */
  processRadarFinding(finding: RadarFinding): void {
    const signal = formatRadarFinding(finding);
    this.maybeEnqueue(signal);
  }
  
  /**
   * Get pending signals for cephalon tick.
   */
  getPendingSignals(): CephalonSignal[] {
    // Sort by priority, then by age
    const sorted = [...this.signalBuffer].sort((a, b) => {
      const priorityDiff = comparePriority(a.priority, b.priority);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime();
    });
    
    return sorted.slice(0, this.config.maxSignalsPerTick);
  }
  
  /**
   * Clear processed signals from buffer.
   */
  clearSignals(ids: UUID[]): void {
    const idSet = new Set(ids);
    this.signalBuffer = this.signalBuffer.filter(s => !idSet.has(s.id));
  }
  
  /**
   * Get buffer stats.
   */
  getStats(): { bufferSize: number; categories: Record<string, number> } {
    const categories: Record<string, number> = {};
    
    for (const signal of this.signalBuffer) {
      categories[signal.category] = (categories[signal.category] || 0) + 1;
    }
    
    return {
      bufferSize: this.signalBuffer.length,
      categories,
    };
  }
  
  /**
   * Convert pending signals to message proposals for CephalonMindQueue.
   */
  toMessageProposals(): CephalonMessageProposal[] {
    const signals = this.getPendingSignals();
    
    return signals.map(signal => this.config.formatter(signal));
  }
  
  // ============================================================================
  // Private Methods
  // ============================================================================
  
  private maybeEnqueue(signal: CephalonSignal): void {
    // Check confidence
    if (signal.confidence < this.config.minConfidence) {
      return;
    }
    
    // Check category
    if (!this.config.categories.includes(signal.category)) {
      return;
    }
    
    // Check priority
    if (comparePriority(signal.priority, this.config.minPriority) < 0) {
      return;
    }
    
    this.signalBuffer.push(signal);
  }
  
  private defaultFormatter = (signal: CephalonSignal): CephalonMessageProposal => {
    const content = this.formatContent(signal);
    
    return {
      id: signal.id,
      sessionId: this.config.sessionId,
      cephalonId: this.config.cephalonId,
      circuitIndex: this.config.circuitIndex,
      createdAt: Date.now(),
      content,
      rationale: `Source: ${signal.source}, Priority: ${signal.priority}`,
      sourceEventType: `sintel.${signal.category}`,
    };
  };
  
  private formatContent(signal: CephalonSignal): string {
    const lines = [
      `[${signal.priority.toUpperCase()}] ${signal.summary}`,
      '',
      `Category: ${signal.category}`,
      `Confidence: ${(signal.confidence * 100).toFixed(0)}%`,
      `Source: ${signal.source}`,
      `Time: ${signal.observedAt}`,
    ];
    
    if (signal.actionable && signal.suggestedAction) {
      lines.push('', `Action: ${signal.suggestedAction}`);
    }
    
    lines.push('', 'Evidence:', signal.evidence.slice(0, 1000));
    
    return lines.join('\n');
  }
}

// ============================================================================
// Integration Helpers
// ============================================================================

/**
 * Create a bridge for a specific cephalon configuration.
 */
export function createSintelBridge(
  sessionId: string,
  cephalonId: string,
  options?: Partial<SintelCephalonBridgeConfig>
): SintelCephalonBridge {
  return new SintelCephalonBridge({
    sessionId,
    cephalonId,
    ...options,
  });
}