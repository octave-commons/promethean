/**
 * HTTP Probe Discovery Source
 * 
 * Bounded HTTP probing for web service observation.
 */

import type { DiscoveryTarget, RawEvidence } from '../../observation/collector.js';
import type { BoundedVerifier, DiscoveryBounds } from '../../strategy/discovery.js';

export interface HTTPResponse {
  url: string;
  status_code: number;
  headers: Record<string, string>;
  body_preview?: string;
  final_url?: string; // After redirects
  certificates?: TLSInfo[];
  timing: {
    dns_ms: number;
    connect_ms: number;
    tls_ms: number;
    response_ms: number;
    total_ms: number;
  };
}

export interface TLSInfo {
  version: string;
  cipher_suite: string;
  peer_cert: {
    subject: string;
    issuer: string;
    valid_from: string;
    valid_to: string;
    fingerprint: string;
  };
}

/**
 * HTTP bounded verifier.
 * Performs targeted HTTP requests within defined bounds.
 */
export class HTTPProbe implements BoundedVerifier {
  readonly name = 'http_probe';
  readonly type = 'http_response' as const;

  timeout = 10000; // 10 second default

  async *verify(target: DiscoveryTarget, bounds: DiscoveryBounds): AsyncGenerator<RawEvidence> {
    const hostname = target.hostname;
    if (!hostname) return;

    // Respect bounds
    if (bounds.max_concurrency && bounds.max_concurrency < 1) {
      return;
    }

    const start = Date.now();
    const scheme = bounds.allowed_ports?.includes(80) ? 'http' : 'https';
    const port = target.port || (scheme === 'https' ? 443 : 80);
    const url = `${scheme}://${hostname}:${port}/`;

    try {
      const response = await this.probe(url, bounds);
      
      yield {
        type: 'http_response',
        target,
        raw: response as unknown as Record<string, unknown>,
        collected_at: new Date().toISOString()
      };
    } catch (error) {
      // Capture error as observation
      yield {
        type: 'http_response',
        target,
        raw: {
          url,
          status_code: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          timing: { dns_ms: 0, connect_ms: 0, tls_ms: 0, response_ms: 0, total_ms: Date.now() - start }
        } as unknown as Record<string, unknown>,
        collected_at: new Date().toISOString()
      };
    }
  }

  private async probe(url: string, bounds: DiscoveryBounds): Promise<HTTPResponse> {
    const start = Date.now();
    
    // In production, use fetch or http client
    // Placeholder implementation
    const timing = {
      dns_ms: 0,
      connect_ms: 0,
      tls_ms: 0,
      response_ms: 0,
      total_ms: Date.now() - start
    };

    return {
      url,
      status_code: 200,
      headers: {
        'server': 'unknown',
        'content-type': 'text/html'
      },
      timing
    };
  }
}

/**
 * Create an HTTP probe verifier.
 */
export function createHTTPProbe(timeout?: number): HTTPProbe {
  const probe = new HTTPProbe();
  if (timeout) probe.timeout = timeout;
  return probe;
}

/**
 * Extract signals from HTTP response.
 */
export function extractHTTPSignals(response: HTTPResponse): {
  server_type: string;
  technologies: string[];
  security_headers: Record<string, boolean>;
  redirect_chain: string[];
  redirects: boolean;
  hsts: boolean;
  content_type: string;
} {
  const headers = response.headers;

  // Server detection
  const serverType = headers['server'] || 'unknown';

  // Technology fingerprinting
  const technologies: string[] = [];
  const poweredBy = headers['x-powered-by'];
  if (poweredBy) technologies.push(poweredBy);
  if (headers['x-aspnet-version']) technologies.push('ASP.NET');
  if (headers['x-runtime']) technologies.push('Node.js');

  // Security headers
  const securityHeaders = {
    'strict-transport-security': !!headers['strict-transport-security'],
    'content-security-policy': !!headers['content-security-policy'],
    'x-frame-options': !!headers['x-frame-options'],
    'x-content-type-options': !!headers['x-content-type-options'],
    'x-xss-protection': !!headers['x-xss-protection']
  };

  const hsts = securityHeaders['strict-transport-security'];

  // Redirects
  const redirectChain = response.final_url ? [response.final_url] : [];
  const redirects = response.final_url !== undefined && response.final_url !== response.url;

  return {
    server_type: serverType,
    technologies,
    security_headers: securityHeaders,
    redirect_chain: redirectChain,
    redirects,
    hsts,
    content_type: headers['content-type'] || 'unknown'
  };
}