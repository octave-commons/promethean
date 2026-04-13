/**
 * DNS Discovery Source
 * 
 * Passive DNS record observation without active probing.
 * Uses system DNS resolver for lookups.
 */

import type { DiscoveryTarget, RawEvidence } from '../../observation/collector.js';
import type { PassiveSource } from '../../strategy/discovery.js';

export interface DNSRecord {
  name: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'PTR' | 'SOA' | 'SRV';
  ttl: number;
  data: string;
}

export interface DNSResult {
  hostname: string;
  records: DNSRecord[];
  resolver: string;
  response_time_ms: number;
}

/**
 * DNS passive source using Node.js dns module.
 * Observes existing DNS data without active probing.
 */
export class DNSDiscovery implements PassiveSource {
  readonly name = 'dns_records';
  readonly type = 'dns_record' as const;

  resolver: DNSResolver | undefined = undefined;

  async *collect(target: DiscoveryTarget): AsyncGenerator<RawEvidence> {
    if (!target.hostname) {
      return;
    }

    const start = Date.now();
    const hostname = target.hostname;
    const records: DNSRecord[] = [];

    // Resolve various record types
    for (const type of ['A', 'AAAA', 'MX', 'TXT', 'NS'] as const) {
      try {
        const result = await this.resolve(hostname, type);
        records.push(...result);
      } catch {
        // Type not found or error - continue
      }
    }

    yield {
      type: 'dns_record',
      target,
      raw: {
        hostname,
        records,
        resolver: this.resolver?.name || 'system',
        response_time_ms: Date.now() - start
      },
      collected_at: new Date().toISOString()
    };
  }

  private async resolve(hostname: string, type: string): Promise<DNSRecord[]> {
    // Use Node.js dns module
    const dns = await import('dns').then(m => m.promises);
    
    try {
      const result = await (dns as any).resolve(hostname, type);
      return result.map((data: any) => ({
        name: hostname,
        type: type as DNSRecord['type'],
        ttl: 300, // Default TTL when not available
        data: String(data)
      }));
    } catch {
      return [];
    }
  }
}

/**
 * DNS resolver configuration.
 */
export interface DNSResolver {
  name: string;
  servers?: string[];
  timeout?: number;
}

/**
 * Create a configured DNS discovery source.
 */
export function createDNSDiscovery(resolver?: DNSResolver): DNSDiscovery {
  const discovery = new DNSDiscovery();
  if (resolver) {
    discovery.resolver = resolver;
  }
  return discovery;
}

/**
 * Extract useful signals from DNS records.
 */
export function extractDNSSignals(records: DNSRecord[]): {
  ips: string[];
  mailServers: string[];
  nameservers: string[];
  txtRecords: string[];
  cdnIndicators: string[];
} {
  const ips = records
    .filter(r => r.type === 'A' || r.type === 'AAAA')
    .map(r => r.data);

  const mailServers = records
    .filter(r => r.type === 'MX')
    .map(r => r.data.split(' ').pop() || r.data);

  const nameservers = records
    .filter(r => r.type === 'NS')
    .map(r => r.data);

  const txtRecords = records
    .filter(r => r.type === 'TXT')
    .map(r => r.data);

  // Detect CDNs from patterns
  const cdnIndicators: string[] = [];
  for (const ip of ips) {
    if (ip.includes('cloudflare') || ip.includes('cf-')) {
      cdnIndicators.push('cloudflare');
    }
  }
  for (const txt of txtRecords) {
    if (txt.includes('cloudflare')) cdnIndicators.push('cloudflare');
    if (txt.includes('google-site-verification')) cdnIndicators.push('google');
    if (txt.includes('amazonses')) cdnIndicators.push('aws');
  }

  return { ips, mailServers, nameservers, txtRecords, cdnIndicators };
}