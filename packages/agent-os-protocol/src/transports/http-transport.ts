/**
 * HTTP Transport Implementation
 *
 * Provides HTTP/HTTPS transport for Agent OS Protocol messages with
 * connection pooling, retry logic, and comprehensive error handling.
 */

import { EventEmitter } from 'events';
import { fetch as undiciFetch, Agent } from 'undici';
import {
  CoreMessage,
  Transport,
  TransportConfig,
  Connection,
  ConnectionMetrics,
  TransportError,
  AgentAddress,
} from '../types/index.js';

// ============================================================================
// HTTP TRANSPORT CONFIGURATION
// ============================================================================

export type HttpTransportConfig = TransportConfig & {
  protocol: 'http' | 'https';
  hostname: string;
  port: number;
  basePath?: string;
  headers?: Record<string, string>;
  timeout?: number;
  maxRedirects?: number;
  keepAlive?: boolean;
  maxConnections?: number;
  maxSockets?: number;
  keepAliveMsecs?: number;
};

// ============================================================================
// HTTP CONNECTION
// ============================================================================

export type HttpConnection = Connection & {
  config: HttpTransportConfig;
  agent: Agent;
  lastUsed: number;
  requestCount: number;
  errorCount: number;
};

// ============================================================================
// HTTP TRANSPORT IMPLEMENTATION
// ============================================================================

export class HttpTransport extends EventEmitter implements Transport {
  private connections = new Map<string, HttpConnection>();
  private metrics: ConnectionMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    failedConnections: 0,
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageLatency: 0,
    lastActivity: new Date().toISOString(),
  };

  constructor(private config: HttpTransportConfig) {
    super();
    this.validateConfig();
  }

  // ========================================================================
  // CONNECTION MANAGEMENT
  // ========================================================================

  async connect(address: AgentAddress): Promise<HttpConnection> {
    const connectionKey = this.getConnectionKey(address);

    // Check for existing connection
    if (this.connections.has(connectionKey)) {
      const connection = this.connections.get(connectionKey)!;
      if (this.isConnectionHealthy(connection)) {
        connection.lastUsed = Date.now();
        return connection;
      }
      // Remove unhealthy connection
      this.connections.delete(connectionKey);
      this.metrics.activeConnections--;
    }

    // Create new connection
    const connection = await this.createConnection(address);
    this.connections.set(connectionKey, connection);
    this.metrics.totalConnections++;
    this.metrics.activeConnections++;

    this.emit('connected', connection);
    return connection;
  }

  async disconnect(connection: HttpConnection): Promise<void> {
    const connectionKey = this.getConnectionKey(connection.address);

    if (this.connections.has(connectionKey)) {
      this.connections.delete(connectionKey);
      this.metrics.activeConnections--;

      // Close the agent if it has dispose method
      if ('dispose' in connection.agent) {
        await (connection.agent as any).dispose();
      }

      this.emit('disconnected', connection);
    }
  }

  async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.connections.values()).map((connection) =>
      this.disconnect(connection),
    );

    await Promise.all(disconnectPromises);
    this.connections.clear();
    this.metrics.activeConnections = 0;
  }

  // ========================================================================
  // MESSAGE TRANSPORT
  // ========================================================================

  async send(message: CoreMessage, connection?: HttpConnection): Promise<void> {
    const targetConnection = connection || (await this.connect(message.recipient));

    try {
      const startTime = Date.now();
      this.metrics.totalRequests++;

      const response = await this.makeRequest(targetConnection, message);

      if (!response.ok) {
        throw new TransportError(
          `HTTP request failed: ${response.status} ${response.statusText}`,
          'HTTP_ERROR',
          { status: response.status, statusText: response.statusText },
        );
      }

      const latency = Date.now() - startTime;
      this.updateMetrics(latency, true);
      targetConnection.requestCount++;
      targetConnection.lastUsed = Date.now();

      this.emit('messageSent', message, targetConnection);
    } catch (error) {
      this.updateMetrics(0, false);
      targetConnection.errorCount++;

      if (targetConnection.errorCount > 3) {
        await this.disconnect(targetConnection);
      }

      this.emit('error', error, targetConnection);
      throw error;
    }
  }

  async receive(connection: HttpConnection, timeout?: number): Promise<CoreMessage> {
    // HTTP is primarily request/response, so receive is not typically used
    // This would be for server-side HTTP implementations
    throw new TransportError(
      'HTTP receive not implemented for client-side transport',
      'NOT_IMPLEMENTED',
    );
  }

  // ========================================================================
  // CONNECTION HEALTH
  // ========================================================================

  async isHealthy(connection: HttpConnection): Promise<boolean> {
    try {
      const response = await this.makeHealthCheck(connection);
      return response.ok;
    } catch {
      return false;
    }
  }

  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  getConnections(): HttpConnection[] {
    return Array.from(this.connections.values());
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  private validateConfig(): void {
    if (!this.config.hostname) {
      throw new TransportError('Hostname is required', 'INVALID_CONFIG');
    }
    if (!this.config.port || this.config.port < 1 || this.config.port > 65535) {
      throw new TransportError('Valid port is required', 'INVALID_CONFIG');
    }
  }

  private getConnectionKey(address: AgentAddress): string {
    return `${address.id}:${address.namespace}:${address.domain}`;
  }

  private async createConnection(address: AgentAddress): Promise<HttpConnection> {
    const agent = new Agent({
      keepAlive: this.config.keepAlive ?? true,
      maxSockets: this.config.maxSockets ?? 100,
      maxTotalSockets: this.config.maxConnections ?? 1000,
      keepAliveMsecs: this.config.keepAliveMsecs ?? 1000,
      timeout: this.config.timeout ?? 30000,
    });

    return {
      id: `http-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      address,
      status: 'connected',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      metrics: {
        messagesSent: 0,
        messagesReceived: 0,
        bytesTransferred: 0,
        errors: 0,
        averageLatency: 0,
      },
      config: this.config,
      agent,
      lastUsed: Date.now(),
      requestCount: 0,
      errorCount: 0,
    };
  }

  private isConnectionHealthy(connection: HttpConnection): boolean {
    const maxIdleTime = 300000; // 5 minutes
    const maxErrors = 3;

    return Date.now() - connection.lastUsed < maxIdleTime && connection.errorCount <= maxErrors;
  }

  private async makeRequest(connection: HttpConnection, message: CoreMessage): Promise<Response> {
    const url = this.buildUrl(connection.config, message.recipient);
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'agent-os-protocol/1.0.0',
      ...connection.config.headers,
      'X-Message-ID': message.id,
      'X-Message-Type': message.type,
      'X-Sender-ID': message.sender.id,
      'X-Recipient-ID': message.recipient.id,
    };

    const body = JSON.stringify(message);

    return undiciFetch(url, {
      method: 'POST',
      headers,
      body,
      dispatcher: connection.agent,
      signal: AbortSignal.timeout(this.config.timeout ?? 30000),
    });
  }

  private async makeHealthCheck(connection: HttpConnection): Promise<Response> {
    const url = `${connection.config.protocol}://${connection.config.hostname}:${connection.config.port}${connection.config.basePath || ''}/health`;

    return undiciFetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'agent-os-protocol/1.0.0',
      },
      dispatcher: connection.agent,
      signal: AbortSignal.timeout(5000),
    });
  }

  private buildUrl(config: HttpTransportConfig, recipient: AgentAddress): string {
    const basePath = config.basePath || '';
    const path = `/messages/${recipient.id}`;

    return `${config.protocol}://${config.hostname}:${config.port}${basePath}${path}`;
  }

  private updateMetrics(latency: number, success: boolean): void {
    if (success) {
      this.metrics.successfulRequests++;

      // Update average latency
      const totalLatency =
        this.metrics.averageLatency * (this.metrics.successfulRequests - 1) + latency;
      this.metrics.averageLatency = totalLatency / this.metrics.successfulRequests;
    } else {
      this.metrics.failedRequests++;
    }

    this.metrics.lastActivity = new Date().toISOString();
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function createHttpTransport(config: HttpTransportConfig): HttpTransport {
  return new HttpTransport(config);
}

export function isHttpTransport(transport: Transport): transport is HttpTransport {
  return transport instanceof HttpTransport;
}
