/**
 * Signal Aggregator
 * 
 * Aggregates signals from multiple discovery sources into a unified view.
 * Computes combined confidence and risk scores.
 */

import type { DiscoveryTarget, RawEvidence } from '../observation/collector.js';
import type { ExclusionSet } from '../policy/exclusions.js';
import { ExclusionPolicy } from '../policy/exclusions.js';
import { PassiveStrategy, BoundedStrategy } from '../strategy/discovery.js';
import { 
  DNSDiscovery, 
  CTDiscovery, 
  WHOISDiscovery,
  extractDNSSignals 
} from '../discovery/passive/index.js';
import { 
  HTTPProbe, 
  TLSHandshakeProbe, 
  ServiceBannerGrab,
  RealHTTPProbe,
  RealTLSHandshakeProbe,
  extractHTTPSignals,
  extractTLSSignals 
} from '../discovery/bounded/index.js';
import { generateRadarFinding, calculateThreatProximity } from '../integration/threat-radar.js';

// Re-export radar integration (without toSignalObservation to avoid circular deps)
export { generateRadarFinding, calculateThreatProximity };
export type { RadarFindingInput } from '../integration/threat-radar.js';

// ============================================================================
// Aggregated Signal Types
// ============================================================================

export interface AggregatedTarget {
  readonly target: DiscoveryTarget;
  readonly signals: Signal[];
  readonly combined_confidence: number;
  readonly risk_indicators: RiskIndicator[];
  readonly observations: RawEvidence[];
}

export interface Signal {
  readonly source: string;
  readonly type: string;
  readonly data: Record<string, unknown>;
  readonly confidence: number;
  readonly collected_at: string;
}

export interface RiskIndicator {
  readonly category: 'infrastructure' | 'security' | 'reputation' | 'behavior';
  readonly name: string;
  readonly value: number | string | boolean;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly source: string;
}

// ============================================================================
// Aggregator Configuration
// ============================================================================

export interface AggregatorConfig {
  readonly passive_sources?: ('dns' | 'ct' | 'whois')[];
  readonly bounded_sources?: ('http' | 'tls' | 'banner')[];
  readonly bounds?: {
    readonly max_requests_per_target?: number;
    readonly allowed_ports?: number[];
    readonly timeout_ms?: number;
  };
  /** Use actual network probes (default: false, use stubs) */
  readonly use_real_probes?: boolean;
}

const DEFAULT_PASSIVE_SOURCES = ['dns', 'ct', 'whois'] as const;
const DEFAULT_BOUNDED_SOURCES = ['http', 'tls'] as const;

// ============================================================================
// Signal Aggregator
// ============================================================================

/**
 * Aggregates signals from multiple discovery sources.
 */
export class SignalAggregator {
  private readonly policy: ExclusionPolicy;
  private readonly config: AggregatorConfig;

  private readonly dnsDiscovery = new DNSDiscovery();
  private readonly ctDiscovery = new CTDiscovery();
  private readonly whoisDiscovery = new WHOISDiscovery();

  constructor(config: AggregatorConfig = {}, policy?: ExclusionPolicy) {
    this.policy = policy || new ExclusionPolicy({} as any);
    this.config = config;
  }

  // Get the configured HTTP probe (real or stub)
  private getHTTPProbe() {
    return this.config.use_real_probes 
      ? new RealHTTPProbe(this.config.bounds?.timeout_ms)
      : new HTTPProbe();
  }

  // Get the configured TLS probe (real or stub)
  private getTLSProbe() {
    return this.config.use_real_probes
      ? new RealTLSHandshakeProbe(this.config.bounds?.timeout_ms)
      : new TLSHandshakeProbe();
  }

  /**
   * Aggregate all signals for a target.
   */
  async aggregate(
    target: DiscoveryTarget,
    exclusions: ExclusionSet
  ): Promise<AggregatedTarget> {
    // Check exclusions first
    const excluded = this.policy.isExcluded(target, exclusions);
    if (excluded) {
      return {
        target,
        signals: [],
        combined_confidence: 0,
        risk_indicators: [{
          category: 'reputation',
          name: 'excluded',
          value: excluded.exclusion.category,
          severity: 'low',
          source: 'exclusion_policy'
        }],
        observations: []
      };
    }

    const observations: RawEvidence[] = [];
    const signals: Signal[] = [];
    const riskIndicators: RiskIndicator[] = [];

    // Run passive discovery
    const passiveSources = this.config.passive_sources || DEFAULT_PASSIVE_SOURCES;
    
    if (passiveSources.includes('dns')) {
      for await (const obs of this.dnsDiscovery.collect(target)) {
        observations.push(obs);
        if (obs.raw.records) {
          const dnsSignals = extractDNSSignals(obs.raw.records as any[]);
          signals.push({
            source: 'dns',
            type: 'dns_records',
            data: dnsSignals as unknown as Record<string, unknown>,
            confidence: 0.9,
            collected_at: obs.collected_at
          });
          
          // Add risk indicators from DNS
          if (dnsSignals.cdnIndicators.includes('cloudflare')) {
            riskIndicators.push({
              category: 'infrastructure',
              name: 'cdn_detected',
              value: 'cloudflare',
              severity: 'low',
              source: 'dns'
            });
          }
        }
      }
    }

    if (passiveSources.includes('ct')) {
      for await (const obs of this.ctDiscovery.collect(target)) {
        observations.push(obs);
        // Extract CT signals when implemented
      }
    }

    if (passiveSources.includes('whois')) {
      for await (const obs of this.whoisDiscovery.collect(target)) {
        observations.push(obs);
        // Extract WHOIS signals when implemented
      }
    }

    // Run bounded discovery
    const boundedSources = this.config.bounded_sources || DEFAULT_BOUNDED_SOURCES;
    
    if (boundedSources.includes('http')) {
      const http = this.getHTTPProbe();
      for await (const obs of http.verify(target, this.config.bounds || {})) {
        observations.push(obs);
        if (obs.raw.status_code !== undefined) {
          const httpSignals = extractHTTPSignals(obs.raw as any);
          signals.push({
            source: 'http',
            type: 'http_response',
            data: httpSignals as unknown as Record<string, unknown>,
            confidence: 0.85,
            collected_at: obs.collected_at
          });
          
          // Security headers risk
          const missingSecurity = Object.entries(httpSignals.security_headers)
            .filter(([_, present]) => !present)
            .map(([name]) => name);
          
          if (missingSecurity.length > 2) {
            riskIndicators.push({
              category: 'security',
              name: 'missing_security_headers',
              value: missingSecurity.join(', '),
              severity: 'medium',
              source: 'http'
            } as RiskIndicator);
          }
        }
      }
    }

    if (boundedSources.includes('tls')) {
      const tls = this.getTLSProbe();
      for await (const obs of tls.verify(target, this.config.bounds || {})) {
        observations.push(obs);
        if (obs.raw.tls_version) {
          const tlsSignals = extractTLSSignals(obs.raw as any);
          signals.push({
            source: 'tls',
            type: 'tls_handshake',
            data: tlsSignals as unknown as Record<string, unknown>,
            confidence: 0.9,
            collected_at: obs.collected_at
          });
          
          // TLS vulnerability risk
          if (tlsSignals.vulnerability_score > 50) {
            riskIndicators.push({
              category: 'security',
              name: 'tls_vulnerability',
              value: tlsSignals.vulnerability_score,
              severity: tlsSignals.vulnerability_score > 80 ? 'high' : 'medium',
              source: 'tls'
            });
          }
        }
      }
    }

    // Compute combined confidence
    const combinedConfidence = this.computeCombinedConfidence(signals);

    return {
      target,
      signals,
      combined_confidence: combinedConfidence,
      risk_indicators: riskIndicators,
      observations
    };
  }

  /**
   * Aggregate multiple targets in parallel.
   */
  async aggregateAll(
    targets: DiscoveryTarget[],
    exclusions: ExclusionSet
  ): Promise<AggregatedTarget[]> {
    return Promise.all(targets.map(t => this.aggregate(t, exclusions)));
  }

  /**
   * Compute combined confidence from multiple signals.
   */
  private computeCombinedConfidence(signals: Signal[]): number {
    if (signals.length === 0) return 0;

    // Weighted average based on source confidence
    const weights = {
      dns: 0.9,
      ct: 0.85,
      whois: 0.8,
      http: 0.85,
      tls: 0.9,
      banner: 0.75
    };

    let totalWeight = 0;
    let weightedSum = 0;

    for (const signal of signals) {
      const weight = (weights as Record<string, number>)[signal.source] || 0.5;
      totalWeight += weight;
      weightedSum += weight * signal.confidence;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
}

/**
 * Create a signal aggregator.
 */
export function createAggregator(
  config?: AggregatorConfig,
  policy?: ExclusionPolicy
): SignalAggregator {
  return new SignalAggregator(config, policy);
}