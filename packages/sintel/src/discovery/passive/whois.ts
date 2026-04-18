/**
 * WHOIS Discovery Source
 * 
 * Passive WHOIS data observation for domain registration info.
 */

import type { DiscoveryTarget, RawEvidence } from '../../observation/collector.js';
import type { PassiveSource } from '../../strategy/discovery.js';

export interface WHOISData {
  domain: string;
  registrar: string;
  created_date?: string;
  updated_date?: string;
  expiry_date?: string;
  registrant?: {
    name?: string;
    organization?: string;
    country?: string;
    email?: string;
  };
  nameservers: string[];
  status: string[];
  dnssec?: boolean;
}

/**
 * WHOIS passive source.
 * Queries public WHOIS servers for domain registration data.
 */
export class WHOISDiscovery implements PassiveSource {
  readonly name = 'whois_data';
  readonly type = 'whois' as const;

  async *collect(target: DiscoveryTarget): AsyncGenerator<RawEvidence> {
    const query = target.hostname || target.ip;
    if (!query) {
      return;
    }

    const start = Date.now();
    const data = await this.queryWHOIS(query);

    yield {
      type: 'whois',
      target,
      raw: {
        query,
        ...data,
        query_time_ms: Date.now() - start
      },
      collected_at: new Date().toISOString()
    };
  }

  private async queryWHOIS(query: string): Promise<WHOISData> {
    // Placeholder: In production, use whois library or API
    // Real implementation would:
    // - Use node-whois or similar
    // - Parse WHOIS response
    // - Handle different WHOIS formats by TLD
    
    return {
      domain: query,
      registrar: 'unknown',
      nameservers: [],
      status: []
    };
  }
}

/**
 * Create a WHOIS discovery source.
 */
export function createWHOISDiscovery(): WHOISDiscovery {
  return new WHOISDiscovery();
}

/**
 * WHOIS risk signals.
 */
export interface WHOISRiskSignals {
  domain_age_days: number;
  expiry_days: number;
  privacy_protected: boolean;
  suspicious_registrar: boolean;
  nameserver_concentration: number;
}

/**
 * Extract risk signals from WHOIS data.
 */
export function extractWHOISRiskSignals(data: WHOISData): WHOISRiskSignals {
  // Domain age
  const createdDate = data.created_date ? new Date(data.created_date) : null;
  const ageDays = createdDate 
    ? (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    : 0;

  // Expiry
  const expiryDate = data.expiry_date ? new Date(data.expiry_date) : null;
  const expiryDays = expiryDate
    ? (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    : Infinity;

  // Privacy protection
  const privacyProtected = !data.registrant?.name || 
    data.registrant.name.toLowerCase().includes('privacy') ||
    data.registrant.name.toLowerCase().includes('redacted');

  // Suspicious registrars
  const suspiciousRegistrars = ['namecheap', 'godaddy', 'name silo', 'namesilo'];
  const suspiciousRegistrar = suspiciousRegistrars.some(s => 
    data.registrar?.toLowerCase().includes(s)
  );

  // Nameserver concentration (same provider)
  const nsProviders = new Set(
    data.nameservers.map(ns => {
      // Extract provider from nameserver
      const parts = ns.toLowerCase().split('.');
      return parts.length >= 2 ? parts.slice(-2).join('.') : ns;
    })
  );
  const nsConcentration = data.nameservers.length > 0 
    ? 1 - (nsProviders.size / data.nameservers.length)
    : 0;

  return {
    domain_age_days: ageDays,
    expiry_days: expiryDays,
    privacy_protected: privacyProtected,
    suspicious_registrar: suspiciousRegistrar,
    nameserver_concentration: nsConcentration
  };
}