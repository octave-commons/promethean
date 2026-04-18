/**
 * Real TLS Handshake Implementation
 * 
 * Uses Node.js native TLS module for certificate inspection.
 */

import { connect } from 'node:tls';
import { EventEmitter } from 'node:events';
import type { DiscoveryTarget, RawEvidence } from '../../observation/collector.js';
import type { BoundedVerifier, DiscoveryBounds } from '../../strategy/discovery.js';
import { extractTLSSignals, type TLSHandshake, type TLSCertificate, type TLSSecuritySignals } from './tls.js';

/**
 * TLS handshake probe using native TLS.
 */
export class RealTLSHandshakeProbe implements BoundedVerifier {
  readonly name = 'tls_handshake';
  readonly type = 'tls_handshake' as const;

  timeout: number;

  constructor(timeout = 5000) {
    this.timeout = timeout;
  }

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

  private performHandshake(hostname: string, port: number): Promise<TLSHandshake> {
    return new Promise((resolve, reject) => {
      const start = Date.now();

      const socket = connect(
        port,
        hostname,
        {
          servername: hostname,
          rejectUnauthorized: false, // We want to see all certificates
        },
        () => {
          const handshakeEnd = Date.now();
          const cert = socket.getPeerCertificate();

          const certificates: TLSCertificate[] = [];
          if (cert) {
            certificates.push({
              subject: this.parseDN(cert.subject),
              issuer: this.parseDN(cert.issuer),
              serial_number: cert.serialNumber || '',
              not_before: cert.valid_from || '',
              not_after: cert.valid_to || '',
              fingerprint_sha256: cert.fingerprint256 || cert.fingerprint || '',
              san: cert.subjectaltname ? cert.subjectaltname.split(', ').map(s => s.replace(/^(DNS:|IP:|email:)/, '')) : [],
              key_usage: [],
              extended_key_usage: [],
              is_self_signed: cert.subject?.CN === cert.issuer?.CN,
              is_ca: !!(cert as any).isCA
            });
          }

          const alpnProtocol = socket.alpnProtocol;

          socket.end();

          resolve({
            hostname,
            port,
            tls_version: socket.getProtocol() || 'unknown',
            cipher_suite: socket.getCipher()?.name || 'unknown',
            peer_certificates: certificates,
            certificate_chain_valid: socket.authorized,
            sni_used: true,
            alpn_protocols: alpnProtocol ? [alpnProtocol] : [],
            timing: {
              handshake_ms: handshakeEnd - start,
              verify_ms: 0
            }
          });
        }
      );

      socket.setTimeout(this.timeout, () => {
        socket.destroy();
        reject(new Error('TLS handshake timeout'));
      });

      socket.on('error', (err) => {
        reject(err);
      });
    });
  }

  private parseDN(dn: any): Record<string, string> {
    if (!dn) return {};
    
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(dn)) {
      result[key] = String(value);
    }
    return result;
  }
}

/**
 * Create a real TLS handshake probe.
 */
export function createRealTLSHandshakeProbe(timeout?: number): RealTLSHandshakeProbe {
  return new RealTLSHandshakeProbe(timeout);
}