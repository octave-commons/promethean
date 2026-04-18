/**
 * Passive Discovery Sources Index
 */

export { DNSDiscovery, createDNSDiscovery, extractDNSSignals } from './dns.js';
export type { DNSRecord, DNSResult, DNSResolver } from './dns.js';

export { CTDiscovery, createCTDiscovery, extractCTSignals, PUBLIC_CT_LOGS } from './certificate.js';
export type { CTLogEntry, CTResult } from './certificate.js';

export { WHOISDiscovery, createWHOISDiscovery, extractWHOISRiskSignals } from './whois.js';
export type { WHOISData, WHOISRiskSignals } from './whois.js';

export { BskyDiscovery } from './bluesky.js';
export type { 
  BskyAccount, 
  BskyPost, 
  BskyFacet,
  BskyEmbed,
  BskySignal, 
  BskySignalAggregate,
  FirehoseEvent,
  FirehoseOptions 
} from './bluesky.js';