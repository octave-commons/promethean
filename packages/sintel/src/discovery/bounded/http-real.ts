/**
 * Real HTTP Probing Implementation
 * 
 * Uses Node.js native fetch (undici) for actual HTTP requests.
 */

import type { DiscoveryTarget, RawEvidence } from '../../observation/collector.js';
import type { BoundedVerifier, DiscoveryBounds } from '../../strategy/discovery.js';
import { extractHTTPSignals, type HTTPResponse, type TLSInfo } from './http.js';

/**
 * HTTP probe using native fetch.
 */
export class RealHTTPProbe implements BoundedVerifier {
  readonly name = 'http_probe';
  readonly type = 'http_response' as const;

  timeout: number;

  constructor(timeout = 10000) {
    this.timeout = timeout;
  }

  async *verify(target: DiscoveryTarget, bounds: DiscoveryBounds): AsyncGenerator<RawEvidence> {
    const hostname = target.hostname;
    if (!hostname) return;

    // Respect bounds on allowed ports
    const allowedPorts = bounds.allowed_ports || [80, 443, 8080, 8443];
    const port = target.port || 443;
    
    if (!allowedPorts.includes(port)) {
      return;
    }

    // Time window bounds
    if (bounds.time_window) {
      const now = new Date();
      const start = new Date(bounds.time_window.start);
      const end = new Date(bounds.time_window.end);
      if (now < start || now > end) {
        return;
      }
    }

    const start = Date.now();
    const scheme = port === 443 || port === 8443 ? 'https' : 'http';
    const url = `${scheme}://${hostname}:${port}/`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const dnsStart = Date.now();
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Sintel/0.1.0 (Infrastructure Signals Intelligence)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      clearTimeout(timeoutId);
      const connectEnd = Date.now();

      // Timing breakdown
      const timing = {
        dns_ms: 0, // Not available in fetch
        connect_ms: connectEnd - dnsStart - (response.headers.get('x-response-time') ? parseInt(response.headers.get('x-response-time')!) : 0),
        tls_ms: scheme === 'https' ? 0 : 0,
        response_ms: parseInt(response.headers.get('x-response-time') || '0') || connectEnd - dnsStart,
        total_ms: Date.now() - start
      };

      // Response headers
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
      });

      // Body preview (first 1KB)
      let bodyPreview: string | undefined;
      try {
        const text = await response.text();
        bodyPreview = text.slice(0, 1024);
      } catch {
        // Body not readable
      }

      // Final URL after redirects
      const finalUrl = response.url;
      const finalUrl_: string | undefined = finalUrl !== url ? finalUrl : undefined;

      const httpResponse: HTTPResponse = {
        url,
        status_code: response.status,
        headers,
        body_preview: bodyPreview,
        final_url: finalUrl_,
        timing
      };

      yield {
        type: 'http_response',
        target,
        raw: httpResponse as unknown as Record<string, unknown>,
        collected_at: new Date().toISOString()
      };

    } catch (error) {
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
}

/**
 * Create a real HTTP probe.
 */
export function createRealHTTPProbe(timeout?: number): RealHTTPProbe {
  return new RealHTTPProbe(timeout);
}

/**
 * Batch HTTP probing for multiple targets.
 */
export async function probeMultiple(
  targets: DiscoveryTarget[],
  bounds: DiscoveryBounds,
  timeout?: number
): Promise<RawEvidence[]> {
  const probe = new RealHTTPProbe(timeout);
  const results: RawEvidence[] = [];

  // Respect max_concurrency bound
  const concurrency = bounds.max_concurrency || 5;
  
  for (let i = 0; i < targets.length; i += concurrency) {
    const batch = targets.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async target => {
        const evidences: RawEvidence[] = [];
        for await (const evidence of probe.verify(target, bounds)) {
          evidences.push(evidence);
        }
        return evidences;
      })
    );
    results.push(...batchResults.flat());
  }

  return results;
}