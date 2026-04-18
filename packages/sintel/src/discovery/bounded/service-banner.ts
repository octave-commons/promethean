/**
 * Service Banner Discovery Source
 * 
 * Bounded service banner grabbing for identification.
 */

import type { DiscoveryTarget, RawEvidence } from '../../observation/collector.js';
import type { BoundedVerifier, DiscoveryBounds } from '../../strategy/discovery.js';

export interface ServiceBanner {
  ip: string;
  port: number;
  banner: string;
  banner_raw: Buffer;
  protocol: string;
  service_detected?: string;
  version_detected?: string;
  timing: {
    connect_ms: number;
    banner_ms: number;
    total_ms: number;
  };
}

export interface ServiceSignature {
  service: string;
  pattern: RegExp;
  version_pattern?: RegExp;
  confidence: number;
}

/**
 * Known service signatures for banner matching.
 */
const SERVICE_SIGNATURES: ServiceSignature[] = [
  // SSH
  { service: 'ssh', pattern: /^SSH-\d+\.\d+/, version_pattern: /SSH-(\d+\.\d+)/, confidence: 0.95 },
  // HTTP
  { service: 'http', pattern: /^HTTP\/\d/, confidence: 0.90 },
  // FTP
  { service: 'ftp', pattern: /^220 .*FTP/i, version_pattern: /(\d+\.\d+)/, confidence: 0.85 },
  // SMTP
  { service: 'smtp', pattern: /^220 .*SMTP/i, version_pattern: /(\d+\.\d+)/, confidence: 0.85 },
  // MySQL
  { service: 'mysql', pattern: /\x00\x00\x00/, confidence: 0.75 },
  // PostgreSQL
  { service: 'postgresql', pattern: /PostgreSQL/, confidence: 0.90 },
  // Redis
  { service: 'redis', pattern: /^-ERR /, confidence: 0.80 },
  // Memcached
  { service: 'memcached', pattern: /^STAT /, confidence: 0.85 },
  // VNC
  { service: 'vnc', pattern: /^RFB \d+\.\d+/, confidence: 0.95 },
  // Docker
  { service: 'docker', pattern: /Docker/, confidence: 0.85 },
];

/**
 * Service banner bounded verifier.
 * Grabs service banner within defined bounds.
 */
export class ServiceBannerGrab implements BoundedVerifier {
  readonly name = 'service_banner';
  readonly type = 'service_banner' as const;

  timeout = 5000;

  async *verify(target: DiscoveryTarget, bounds: DiscoveryBounds): AsyncGenerator<RawEvidence> {
    if (!target.ip && !target.hostname) return;

    const port = target.port || 22;
    
    // Respect bounds on allowed ports
    if (bounds.allowed_ports && !bounds.allowed_ports.includes(port)) {
      return;
    }

    const start = Date.now();

    try {
      const result = await this.grabBanner(target, port);

      yield {
        type: 'service_banner',
        target,
        raw: result as unknown as Record<string, unknown>,
        collected_at: new Date().toISOString()
      };
    } catch (error) {
      yield {
        type: 'service_banner',
        target,
        raw: {
          ip: target.ip,
          port,
          banner: '',
          error: error instanceof Error ? error.message : 'Unknown error',
          timing: { connect_ms: 0, banner_ms: 0, total_ms: Date.now() - start }
        } as unknown as Record<string, unknown>,
        collected_at: new Date().toISOString()
      };
    }
  }

  private async grabBanner(target: DiscoveryTarget, port: number): Promise<ServiceBanner> {
    const start = Date.now();
    
    // In production, use net.connect()
    // Placeholder implementation
    const timing = {
      connect_ms: 0,
      banner_ms: 0,
      total_ms: Date.now() - start
    };

    return {
      ip: target.ip || '',
      port,
      banner: '',
      banner_raw: Buffer.alloc(0),
      protocol: 'tcp',
      timing
    };
  }
}

/**
 * Create a service banner grabber.
 */
export function createServiceBannerGrab(timeout?: number): ServiceBannerGrab {
  const grab = new ServiceBannerGrab();
  if (timeout) grab.timeout = timeout;
  return grab;
}

/**
 * Detect service from banner.
 */
export function detectService(banner: string): { service: string; version?: string } | null {
  for (const sig of SERVICE_SIGNATURES) {
    if (sig.pattern.test(banner)) {
      const version = sig.version_pattern 
        ? banner.match(sig.version_pattern)?.[1]
        : undefined;
      
      return {
        service: sig.service,
        version
      };
    }
  }
  return null;
}

/**
 * Extract signals from service banner.
 */
export function extractBannerSignals(banner: ServiceBanner): {
  service: string;
  version: string | undefined;
  product_detected: boolean;
  confidence: number;
} {
  const detected = detectService(banner.banner);
  
  return {
    service: detected?.service || 'unknown',
    version: detected?.version,
    product_detected: detected !== null,
    confidence: detected ? SERVICE_SIGNATURES.find(s => s.service === detected.service)?.confidence || 0.5 : 0
  };
}