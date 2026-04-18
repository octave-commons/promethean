/**
 * Certificate Transparency Discovery Source
 * 
 * Passive CT log observation for SSL/TLS certificates.
 */

import type { DiscoveryTarget, RawEvidence } from '../../observation/collector.js';
import type { PassiveSource } from '../../strategy/discovery.js';

export interface CTLogEntry {
  log_name: string;
  log_url: string;
  timestamp: number;
  cert_issuer: string;
  cert_subject: string;
  cert_san: string[];
  cert_not_before: string;
  cert_not_after: string;
  fingerprint_sha256: string;
}

export interface CTResult {
  hostname: string;
  entries: CTLogEntry[];
  total_count: number;
  query_time_ms: number;
}

/**
 * Certificate Transparency passive source.
 * Observes public CT logs for certificate emissions.
 */
export class CTDiscovery implements PassiveSource {
  readonly name = 'certificate_transparency';
  readonly type = 'certificate' as const;

  private ctLogServer = 'https://ct.openhax.dev'; // Placeholder CT log server

  async *collect(target: DiscoveryTarget): AsyncGenerator<RawEvidence> {
    if (!target.hostname) {
      return;
    }

    const start = Date.now();
    const hostname = target.hostname;

    // In production, this would query CT logs
    // For now, we simulate with a placeholder
    const entries: CTLogEntry[] = await this.queryCTLogs(hostname);

    yield {
      type: 'certificate',
      target,
      raw: {
        hostname,
        entries,
        total_count: entries.length,
        query_time_ms: Date.now() - start,
        source: 'ct_logs'
      },
      collected_at: new Date().toISOString()
    };
  }

  private async queryCTLogs(hostname: string): Promise<CTLogEntry[]> {
    // Placeholder: In production, use CT log API
    // Real implementation would query:
    // - crt.sh
    // - certstream
    // - Google CT logs
    // - Cloudflare CT logs
    
    // For development, return empty with structure hint
    return [];
  }
}

/**
 * Public CT log servers for query.
 */
export const PUBLIC_CT_LOGS = [
  { name: 'google_argon2024', url: 'https://ct.googleapis.com/logs/argon2024/' },
  { name: 'cloudflare_nimbus2024', url: 'https://ct.cloudflare.com/logs/nimbus2024/' },
  { name: 'digicert_ct', url: 'https://ct2.digicert.com/' },
] as const;

/**
 * Create a CT discovery source.
 */
export function createCTDiscovery(): CTDiscovery {
  return new CTDiscovery();
}

/**
 * Extract signals from CT entries.
 */
export function extractCTSignals(entries: CTLogEntry[]): {
  issuers: string[];
  subdomains: string[];
  wildcards: string[];
  freshness_hours: number;
} {
  const issuers = [...new Set(entries.map(e => e.cert_issuer))];
  
  const allSANs = entries.flatMap(e => e.cert_san);
  const subdomains = allSANs.filter(san => 
    !san.startsWith('*.') && san.includes('.')
  );
  const wildcards = allSANs.filter(san => san.startsWith('*.'));

  // Calculate freshness from most recent entry
  const timestamps = entries.map(e => e.timestamp);
  const mostRecent = Math.max(...timestamps, 0);
  const freshness_hours = mostRecent > 0 
    ? (Date.now() - mostRecent) / (1000 * 60 * 60)
    : Infinity;

  return { issuers, subdomains, wildcards, freshness_hours };
}