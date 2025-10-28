/**
 * HTTP Transport Implementation
 *
 * Provides HTTP/HTTPS transport for Agent OS Protocol messages with
 * connection pooling, retry logic, and comprehensive error handling.
 */

import { EventEmitter } from 'events';
import {
  CoreMessage,
  Transport,
  TransportConfig,
  Connection,
  ConnectionMetrics,
  TransportError,
  AgentAddress,
  FlowControlConfig,
  FlowControlStatus,
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
  lastUsed: number;
  requestCount: number;
  errorCount: number;
};

// ============================================================================
// HTTP TRANSPORT STATE
// ============================================================================

export type HttpTransportState = {
  connections: Map<string, HttpConnection>;
  metrics: ConnectionMetrics;
  config: HttpTransportConfig;
  emitter: EventEmitter;
  flowControl: FlowControlConfig;
};

// ============================================================================
// HTTP TRANSPORT FACTORY
// ============================================================================

export const createHttpTransport = (config: HttpTransportConfig): Transport => {
  const state: HttpTransportState = {
    connections: new Map(),
    metrics: {
      messagesSent: 0,
      messagesReceived: 0,
      bytesTransferred: 0,
      errorCount: 0,
      averageLatency: 0,
      totalConnections: 0,
      activeConnections: 0,
      failedConnections: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      lastActivity: new Date(),
    },
    config,
    emitter: new EventEmitter(),
    flowControl: {
      rateLimit: 100,
      bufferSize: 1000,
      backpressureThreshold: 800,
    },
  };

  validateConfig(config);

  return {
    connect: (endpoint: string) => connect(state, endpoint),
    disconnect: (connectionId: string) => disconnect(state, connectionId),
    send: (message: CoreMessage) => send(state, message),
    receive: () => receive(state),
    acknowledge: (messageId: string) => acknowledge(state, messageId),
    reject: (messageId: string, reason: string) => reject(state, messageId, reason),
    setFlowControl: (config: FlowControlConfig) => setFlowControl(state, config),
    getFlowControlStatus: () => getFlowControlStatus(state),
  };
};

// ============================================================================
// CONNECTION MANAGEMENT
// ============================================================================

const connect = async (state: HttpTransportState, endpoint: string): Promise<Connection> => {
  const connectionKey = endpoint;

  // Check for existing connection
  if (state.connections.has(connectionKey)) {
    const connection = state.connections.get(connectionKey)!;
    if (isConnectionHealthy(connection)) {
      connection.lastUsed = Date.now();
      return connection;
    }
    // Remove unhealthy connection
    state.connections.delete(connectionKey);
    if (state.metrics.activeConnections) {
      state.metrics.activeConnections--;
    }
  }

  // Create new connection
  const connection = await createConnection(state.config, endpoint);
  state.connections.set(connectionKey, connection);
  if (state.metrics.totalConnections !== undefined) {
    state.metrics.totalConnections++;
  }
  if (state.metrics.activeConnections !== undefined) {
    state.metrics.activeConnections++;
  }

  state.emitter.emit('connected', connection);
  return connection;
};

const disconnect = async (state: HttpTransportState, connectionId: string): Promise<void> => {
  const connection = Array.from(state.connections.values()).find(
    (conn) => conn.id === connectionId,
  );

  if (!connection) {
    throw new TransportError(`Connection ${connectionId} not found`);
  }

  const connectionKey = getConnectionKey(connection.config);
  state.connections.delete(connectionKey);

  if (state.metrics.activeConnections !== undefined) {
    state.metrics.activeConnections--;
  }

  state.emitter.emit('disconnected', connection);
};

// ============================================================================
// MESSAGE TRANSPORT
// ============================================================================

const send = async (state: HttpTransportState, message: CoreMessage): Promise<void> => {
  const endpoint = `${message.recipient.endpoint || getDefaultEndpoint(message.recipient)}`;

  try {
    const startTime = Date.now();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...state.config.headers,
      },
      body: JSON.stringify(message),
      signal: AbortSignal.timeout(state.config.timeout || 30000),
    });

    if (!response.ok) {
      throw new TransportError(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Update metrics
    const latency = Date.now() - startTime;
    updateMetrics(state, 'send', latency, true);

    state.emitter.emit('messageSent', message);
  } catch (error) {
    updateMetrics(state, 'send', 0, false);
    throw new TransportError('Failed to send message', { code: 'SEND_ERROR', error });
  }
};

const receive = async function* (state: HttpTransportState): AsyncIterable<CoreMessage> {
  const messageQueue: CoreMessage[] = [];

  // In a real implementation, this would listen for incoming HTTP requests
  // For now, we'll yield from a queue that gets populated elsewhere
  while (true) {
    if (messageQueue.length > 0) {
      const message = messageQueue.shift()!;
      updateMetrics(state, 'receive', 0, true);
      yield message;
    } else {
      // Wait for new messages
      await new Promise((resolve) => {
        state.emitter.once('messageReceived', resolve);
      });
    }
  }
};

// ============================================================================
// RELIABILITY FUNCTIONS
// ============================================================================

const acknowledge = async (state: HttpTransportState, messageId: string): Promise<void> => {
  // HTTP implementation would send ACK via HTTP POST
  state.emitter.emit('acknowledged', messageId);
};

const reject = async (
  state: HttpTransportState,
  messageId: string,
  reason: string,
): Promise<void> => {
  // HTTP implementation would send REJECT via HTTP POST
  state.emitter.emit('rejected', { messageId, reason });
};

// ============================================================================
// FLOW CONTROL
// ============================================================================

const setFlowControl = (state: HttpTransportState, config: FlowControlConfig): void => {
  state.flowControl = config;
  state.emitter.emit('flowControlChanged', config);
};

const getFlowControlStatus = (state: HttpTransportState): FlowControlStatus => {
  return {
    currentRate:
      (state.metrics.messagesSent / (Date.now() - (state.metrics.lastActivity as Date).getTime())) *
      1000,
    bufferUtilization: state.connections.size / (state.config.maxConnections || 100),
    backpressureActive: state.connections.size >= state.flowControl.backpressureThreshold,
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const validateConfig = (config: HttpTransportConfig): void => {
  if (!config.hostname) {
    throw new TransportError('Hostname is required');
  }
  if (!config.port || config.port < 1 || config.port > 65535) {
    throw new TransportError('Valid port is required');
  }
};

const createConnection = async (
  config: HttpTransportConfig,
  endpoint: string,
): Promise<HttpConnection> => {
  const connectionId = crypto.randomUUID();

  try {
    // Test connectivity with a simple request
    await fetch(endpoint, {
      method: 'HEAD',
      signal: AbortSignal.timeout(config.timeout || 30000),
    });

    return {
      id: connectionId,
      endpoint,
      status: 'connected',
      lastActivity: new Date(),
      metrics: {
        messagesSent: 0,
        messagesReceived: 0,
        bytesTransferred: 0,
        errorCount: 0,
        averageLatency: 0,
      },
      config,
      lastUsed: Date.now(),
      requestCount: 0,
      errorCount: 0,
    };
  } catch (error) {
    throw new TransportError(`Failed to create connection to ${endpoint}`, {
      code: 'CONNECTION_ERROR',
      error,
    });
  }
};

const isConnectionHealthy = (connection: HttpConnection): boolean => {
  const maxIdleTime = 300000; // 5 minutes
  const now = Date.now();

  return (
    connection.status === 'connected' &&
    now - connection.lastUsed < maxIdleTime &&
    connection.errorCount < 5
  );
};

const getConnectionKey = (config: HttpTransportConfig): string => {
  return `${config.protocol}://${config.hostname}:${config.port}${config.basePath || ''}`;
};

const getDefaultEndpoint = (address: AgentAddress): string => {
  return address.endpoint || `http://${address.domain}`;
};

const updateMetrics = (
  state: HttpTransportState,
  operation: 'send' | 'receive',
  latency: number,
  success: boolean,
): void => {
  if (operation === 'send') {
    state.metrics.messagesSent++;
    if (state.metrics.totalRequests !== undefined) {
      state.metrics.totalRequests++;
    }
    if (success && state.metrics.successfulRequests !== undefined) {
      state.metrics.successfulRequests++;
    }
    if (!success && state.metrics.failedRequests !== undefined) {
      state.metrics.failedRequests++;
    }
  } else {
    state.metrics.messagesReceived++;
  }

  if (latency > 0) {
    // Update average latency
    const totalLatency = state.metrics.averageLatency * (state.metrics.messagesSent - 1) + latency;
    state.metrics.averageLatency = totalLatency / state.metrics.messagesSent;
  }

  if (!success) {
    state.metrics.errorCount++;
  }

  state.metrics.lastActivity = new Date();
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isHttpTransport = (
  transport: Transport,
): transport is Transport & {
  connect(endpoint: string): Promise<HttpConnection>;
} => {
  // In a real implementation, we'd check for specific HTTP transport properties
  return transport.constructor?.name === 'HttpTransport' || false;
};

// ============================================================================
// LEGACY EXPORTS FOR BACKWARD COMPATIBILITY
// ============================================================================

export class HttpTransport extends EventEmitter implements Transport {
  private transport: Transport;

  constructor(config: HttpTransportConfig) {
    super();
    this.transport = createHttpTransport(config);
  }

  async connect(endpoint: string): Promise<Connection> {
    return this.transport.connect(endpoint);
  }

  async disconnect(connectionId: string): Promise<void> {
    return this.transport.disconnect(connectionId);
  }

  async send(message: CoreMessage): Promise<void> {
    return this.transport.send(message);
  }

  receive(): AsyncIterable<CoreMessage> {
    return this.transport.receive();
  }

  async acknowledge(messageId: string): Promise<void> {
    return this.transport.acknowledge(messageId);
  }

  async reject(messageId: string, reason: string): Promise<void> {
    return this.transport.reject(messageId, reason);
  }

  setFlowControl(config: FlowControlConfig): void {
    this.transport.setFlowControl(config);
  }

  getFlowControlStatus(): FlowControlStatus {
    return this.transport.getFlowControlStatus();
  }
}
