/**
 * TLS Handshake Discovery Source
 * 
 * Bounded TLS probing for certificate and cipher observation.
 */

import type { DiscoveryTarget, RawEvidence } from '../../observation/collector.js';
import type { BoundedVerifier, DiscoveryBounds } from '../../strategy/discovery.js';

export interface TLSHandshake {
  hostname: string;
  port: number;
  tls_version: string;
  cipher_suite: string;
  peer_certificates: TLSCertificate[];
  certificate_chain_valid: boolean;
  sni_used: boolean;
  alpn_protocols: string[];
  timing: {
    handshake_ms: number;
    verify_ms: number;
  };
}

export interface TLSCertificate {
  subject: Record<string, string>;
  issuer: Record<string, string>;
  serial_number: string;
  not_before: string;
  not_after: string;
  fingerprint_sha256: string;
  san: string[];
  key_usage: string[];
  extended_key_usage: string[];
  is_self_signed: boolean;
  is_ca: boolean;
}

/**
 * TLS handshake bounded verifier.
 * Performs TLS handshake within defined bounds.
 */
export class TLSHandshakeProbe implements BoundedVerifier {
  readonly name = 'tls_handshake';
  readonly type = 'tls_handshake' as const;

  timeout = 5000;

  async *verify(target: DiscoveryTarget, bounds: DiscoveryBounds): AsyncGenerator<RawEvidence> {
    const hostname = target.hostname;
    if (!hostname) return;

    const port = target.port || 443;

    // Respect bounds on allowed ports
    if (bounds.allowed_ports && !bounds.allowed_ports.includes(port)) {
      return;
    }

    const start = Date.now();

    try {
      const result = await this.performHandshake(hostname, port);

      yield {
        type: 'tls_handshake',
        target,
        raw: result as unknown as Record<string, unknown>,
        collected_at: new Date().toISOString()
      };
    } catch (error) {
      yield {
        type: 'tls_handshake',
        target,
        raw: {
          hostname,
          port,
          error: error instanceof Error ? error.message : 'Unknown error',
          timing: { handshake_ms: Date.now() - start, verify_ms: 0 }
        } as unknown as Record<string, unknown>,
        collected_at: new Date().toISOString()
      };
    }
  }

  private async performHandshake(hostname: string, port: number): Promise<TLSHandshake> {
    const start = Date.now();

    // In production, use node:tls or undici
    // Placeholder implementation
    return {
      hostname,
      port,
      tls_version: 'TLSv1.3',
      cipher_suite: 'TLS_AES_256_GCM_SHA384',
      peer_certificates: [],
      certificate_chain_valid: true,
      sni_used: true,
      alpn_protocols: ['h2', 'http/1.1'],
      timing: {
        handshake_ms: Date.now() - start,
        verify_ms: 0
      }
    };
  }
}

/**
 * Create a TLS handshake probe.
 */
export function createTLSHandshakeProbe(timeout?: number): TLSHandshakeProbe {
  const probe = new TLSHandshakeProbe();
  if (timeout) probe.timeout = timeout;
  return probe;
}

/**
 * TLS security signals.
 */
export interface TLSSecuritySignals {
  tls_version_ok: boolean;
  cipher_strength: 'strong' | 'acceptable' | 'weak';
  certificate_valid: boolean;
  certificate_days_remaining: number;
  certificate_matches_hostname: boolean;
  uses_hsts: boolean;
  has_mixed_content_issue: boolean;
  vulnerability_score: number;
}

/**
 * Extract TLS security signals.
 */
export function extractTLSSignals(handshake: TLSHandshake): TLSSecuritySignals {
  // TLS version check
  const tlsVersionOk = ['TLSv1.2', 'TLSv1.3'].includes(handshake.tls_version);

  // Cipher strength
  const cipherStrength = determineCipherStrength(handshake.cipher_suite);

  // Certificate validity
  const certValid = handshake.certificate_chain_valid;
  
  // Days until expiry
  const now = Date.now();
  const expiryDate = handshake.peer_certificates[0]?.not_after;
  const daysRemaining = expiryDate 
    ? (new Date(expiryDate).getTime() - now) / (1000 * 60 * 60 * 24)
    : 0;

  // Hostname match
  const hostnameMatch = handshake.peer_certificates[0]?.san?.includes(handshake.hostname) ||
    handshake.peer_certificates[0]?.subject?.CN === handshake.hostname;

  // Vulnerability score (0-100, higher = more vulnerable)
  let vulnScore = 0;
  if (!tlsVersionOk) vulnScore += 40;
  if (cipherStrength === 'weak') vulnScore += 30;
  if (cipherStrength === 'acceptable') vulnScore += 10;
  if (!certValid) vulnScore += 50;
  if (daysRemaining < 30) vulnScore += 20;

  return {
    tls_version_ok: tlsVersionOk,
    cipher_strength: cipherStrength,
    certificate_valid: certValid,
    certificate_days_remaining: daysRemaining,
    certificate_matches_hostname: hostnameMatch,
    uses_hsts: false, // From HTTP, not TLS
    has_mixed_content_issue: false, // Requires correlation with HTTP
    vulnerability_score: Math.min(100, vulnScore)
  };
}

/**
 * Determine cipher suite strength.
 */
function determineCipherStrength(cipher: string): 'strong' | 'acceptable' | 'weak' {
  const strong = ['TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256', 'TLS_AES_128_GCM_SHA256'];
  const weak = ['RC4', 'DES', '3DES', 'MD5', 'NULL', 'EXPORT'];
  
  if (strong.some(s => cipher.includes(s))) return 'strong';
  if (weak.some(w => cipher.includes(w))) return 'weak';
  return 'acceptable';
}