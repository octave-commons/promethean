import { WebSocketServer, WebSocket } from "ws";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { randomBytes } from "crypto";
import type { UserContext } from "../auth/types.js";

/**
 * WebSocket connection types
 */
export interface WSConnection {
  id: string;
  ws: WebSocket;
  user?: UserContext;
  authenticated: boolean;
  lastPing: number;
  subscriptions: Set<string>;
  metadata: Record<string, any>;
}

/**
 * WebSocket message types
 */
export interface WSMessage {
  type: "ping" | "pong" | "subscribe" | "unsubscribe" | "broadcast" | "direct";
  payload?: any;
  channel?: string;
  target?: string;
  timestamp: string;
  id: string;
}

/**
 * WebSocket adapter options
 */
export interface WebSocketAdapterOptions {
  path: string;
  enableAuth?: boolean;
  enableHeartbeat?: boolean;
  heartbeatInterval?: number;
  maxConnections?: number;
  perMessageDeflate?: boolean;
}

/**
 * WebSocket event types
 */
export interface WSEvent {
  type: "connection" | "disconnection" | "message" | "subscribe" | "unsubscribe" | "broadcast" | "error";
  connectionId: string;
  user?: UserContext;
  data?: any;
  timestamp: string;
}

/**
 * WebSocket adapter class
 */
export class WebSocketAdapter {
  private wss: WebSocketServer;
  private connections: Map<string, WSConnection> = new Map();
  private eventListeners: Map<string, ((event: WSEvent) => void)[]> = new Map();
  private options: WebSocketAdapterOptions;
  private heartbeatTimer?: NodeJS.Timeout;
  private messageId: number = 0;

  constructor(options: WebSocketAdapterOptions) {
    this.options = {
      enableHeartbeat: true,
      heartbeatInterval: 30000,
      maxConnections: 1000,
      perMessageDeflate: true,
      ...options,
    };
  }

  /**
   * Mount WebSocket server on Fastify instance
   */
  mount(app: FastifyInstance): void {
    // Create WebSocket server
    this.wss = new WebSocketServer({
      path: this.options.path,
      perMessageDeflate: this.options.perMessageDeflate,
      maxPayload: 1024 * 1024, // 1MB
    });

    // Handle connections
    this.wss.on('connection', (ws, request, client) => {
      this.handleConnection(ws, request, client);
    });

    // Start heartbeat if enabled
    if (this.options.enableHeartbeat) {
      this.startHeartbeat();
    }

    // Handle server shutdown
    app.addHook('onClose', () => {
      this.wss.close();
    });

    // Add WebSocket info to Fastify instance for access
    (app as any).wsServer = this.wss;
    (app as any).wsAdapter = this;

    app.log.info(`WebSocket adapter mounted at ${this.options.path}`);
    app.log.info(`WebSocket server options: ${JSON.stringify(this.options)}`);
  }

  /**
   * Handle new WebSocket connections
   */
  private handleConnection(
    ws: WebSocket,
    request: FastifyRequest,
    client: any
  ): void {
    const connectionId = this.generateConnectionId();
    const connection: WSConnection = {
      id: connectionId,
      ws,
      authenticated: false,
      lastPing: Date.now(),
      subscriptions: new Set(),
      metadata: {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        url: request.url,
        client: client ? {
          url: client.url,
          protocol: client.protocol
        } : undefined,
      },
    };

    // Add connection to tracking
    this.connections.set(connectionId, connection);

    // Emit connection event
    this.emitEvent({
      type: "connection",
      connectionId,
      timestamp: new Date().toISOString(),
      data: {
        ip: connection.metadata.ip,
        userAgent: connection.metadata.userAgent,
      },
    });

    // Handle connection lifecycle
    this.setupConnectionHandlers(connection);

    // Send welcome message
    this.sendMessage(connection, {
      type: "direct",
      payload: {
        message: "Connected to Omni Service WebSocket",
        connectionId,
        serverTime: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      id: this.generateMessageId(),
    });

    // Check if connection limit reached
    if (this.connections.size > (this.options.maxConnections || 1000)) {
      this.sendMessage(connection, {
        type: "direct",
        payload: {
          error: "Server at capacity",
          message: "Connection limit reached",
        },
        timestamp: new Date().toISOString(),
        id: this.generateMessageId(),
      });
      
      setTimeout(() => {
        ws.close(1013, "Server at capacity");
      }, 1000);
    }
  }

  /**
   * Setup WebSocket connection handlers
   */
  private setupConnectionHandlers(connection: WSConnection): void {
    const { ws, connectionId } = connection;

    // Handle incoming messages
    ws.on('message', (data) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        this.handleMessage(connection, message);
      } catch (error) {
        this.sendMessage(connection, {
          type: "direct",
          payload: {
            error: "Invalid message format",
            message: "Message must be valid JSON",
          },
          timestamp: new Date().toISOString(),
          id: this.generateMessageId(),
        });
      }
    });

    // Handle pong responses
    ws.on('pong', () => {
      connection.lastPing = Date.now();
    });

    // Handle connection close
    ws.on('close', (code, reason) => {
      this.handleDisconnection(connection, code, reason);
    });

    // Handle connection errors
    ws.on('error', (error) => {
      this.emitEvent({
        type: "error",
        connectionId,
        timestamp: new Date().toISOString(),
        data: {
          error: error.message,
          stack: error.stack,
        },
      });
    });

    // Set up ping interval for connection
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        this.sendMessage(connection, {
          type: "ping",
          timestamp: new Date().toISOString(),
          id: this.generateMessageId(),
        });

        // Check if connection is stale (no pong for too long)
        if (Date.now() - connection.lastPing > 60000) {
          ws.terminate(1001, "Connection stale");
        }
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);

    ws.on('close', () => {
      clearInterval(pingInterval);
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(connection: WSConnection, message: WSMessage): void {
    const { connectionId, user } = connection;
    const { type, payload } = message;

    switch (type) {
      case "ping":
        // Respond with pong
        this.sendMessage(connection, {
          type: "pong",
          timestamp: new Date().toISOString(),
          id: this.generateMessageId(),
        });
        break;

      case "pong":
        // Update last ping time
        connection.lastPing = Date.now();
        break;

      case "subscribe":
        if (payload?.channel) {
          this.handleSubscription(connection, payload.channel, true);
        }
        break;

      case "unsubscribe":
        if (payload?.channel) {
          this.handleSubscription(connection, payload.channel, false);
        }
        break;

      case "broadcast":
        if (user && payload?.channel) {
          this.broadcast(payload.channel, payload.data, {
            userId: user.id,
            username: user.username,
          });
        }
        break;

      case "direct":
        // Direct messages are handled by individual services
        this.emitEvent({
          type: "message",
          connectionId,
          user,
          timestamp: new Date().toISOString(),
          data: payload,
        });
        break;

      default:
        this.sendMessage(connection, {
          type: "direct",
          payload: {
            error: "Unknown message type",
            message: `Unsupported message type: ${type}`,
          },
          timestamp: new Date().toISOString(),
          id: this.generateMessageId(),
        });
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  private handleDisconnection(
    connection: WSConnection,
    code: number,
    reason: string
  ): void {
    const { connectionId, user } = connection;

    // Remove from tracking
    this.connections.delete(connectionId);

    // Emit disconnection event
    this.emitEvent({
      type: "disconnection",
      connectionId,
      user,
      timestamp: new Date().toISOString(),
      data: {
        code,
        reason,
      },
    });
  }

  /**
   * Handle subscription management
   */
  private handleSubscription(
    connection: WSConnection,
    channel: string,
    subscribe: boolean
  ): void {
    const { connectionId } = connection;

    if (subscribe) {
      connection.subscriptions.add(channel);
      this.emitEvent({
        type: "subscribe",
        connectionId,
        timestamp: new Date().toISOString(),
        data: {
          channel,
        },
      });
    } else {
      connection.subscriptions.delete(channel);
      this.emitEvent({
        type: "unsubscribe",
        connectionId,
        timestamp: new Date().toISOString(),
        data: {
          channel,
        },
      });
    }

    this.sendMessage(connection, {
      type: "direct",
      payload: {
        message: subscribe ? `Subscribed to ${channel}` : `Unsubscribed from ${channel}`,
        channel,
        subscribed: subscribe,
        subscriptions: Array.from(connection.subscriptions),
      },
      timestamp: new Date().toISOString(),
      id: this.generateMessageId(),
    });
  }

  /**
   * Broadcast message to all connections subscribed to a channel
   */
  broadcast(
    channel: string,
    data: any,
    options?: {
      excludeConnectionId?: string;
      requireAuth?: boolean;
    }
  ): void {
    const message: WSMessage = {
      type: "broadcast",
      payload: {
        channel,
        data,
      },
      timestamp: new Date().toISOString(),
      id: this.generateMessageId(),
    };

    let sentCount = 0;
    this.connections.forEach((connection) => {
      // Skip excluded connection
      if (options?.excludeConnectionId && connection.id === options.excludeConnectionId) {
        return;
      }

      // Require authentication if specified
      if (options?.requireAuth && !connection.authenticated) {
        return;
      }

      // Only send to subscribed connections
      if (connection.subscriptions.has(channel)) {
        this.sendMessage(connection, message);
        sentCount++;
      }
    });

    this.emitEvent({
      type: "broadcast",
      connectionId: "system",
      timestamp: new Date().toISOString(),
      data: {
        channel,
        sentCount,
      },
    });
  }

  /**
   * Send direct message to a specific connection
   */
  sendDirectMessage(
    connectionId: string,
    data: any,
    options?: {
      requireAuth?: boolean;
    }
  ): boolean {
    const connection = this.connections.get(connectionId);
    
    if (!connection) {
      return false;
    }

    // Check authentication requirements
    if (options?.requireAuth && !connection.authenticated) {
      return false;
    }

    const message: WSMessage = {
      type: "direct",
      payload: data,
      timestamp: new Date().toISOString(),
      id: this.generateMessageId(),
    };

    this.sendMessage(connection, message);
    return true;
  }

  /**
   * Send message to WebSocket connection
   */
  private sendMessage(connection: WSConnection, message: WSMessage): void {
    if (connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Start heartbeat for all connections
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      const now = Date.now();
      const staleConnections: string[] = [];

      this.connections.forEach((connection, connectionId) => {
        if (now - connection.lastPing > 60000) {
          staleConnections.push(connectionId);
          connection.ws.terminate(1001, "Connection stale");
        }
      });

      // Remove stale connections
      staleConnections.forEach(connectionId => {
        this.connections.delete(connectionId);
      });

      if (staleConnections.length > 0) {
        this.emitEvent({
          type: "disconnection",
          connectionId: "system",
          timestamp: new Date().toISOString(),
          data: {
            reason: "Stale connections cleaned up",
            count: staleConnections.length,
            connectionIds: staleConnections,
          },
        });
      }
    }, this.options.heartbeatInterval);
  }

  /**
   * Authenticate WebSocket connection
   */
  authenticate(connectionId: string, user: UserContext): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }

    connection.authenticated = true;
    connection.user = user;

    this.sendMessage(connection, {
      type: "direct",
      payload: {
        message: "WebSocket connection authenticated",
        user: {
          id: user.id,
          username: user.username,
          roles: user.roles,
        },
      },
      timestamp: new Date().toISOString(),
      id: this.generateMessageId(),
    });

    return true;
  }

  /**
   * Get connection information
   */
  getConnection(connectionId: string): WSConnection | undefined {
    return this.connections.get(connectionId);
  }

  /**
   * Get all connections
   */
  getAllConnections(): WSConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Get authenticated connections
   */
  getAuthenticatedConnections(): WSConnection[] {
    return Array.from(this.connections.values()).filter(conn => conn.authenticated);
  }

  /**
   * Get connections subscribed to a channel
   */
  getConnectionsBySubscription(channel: string): WSConnection[] {
    return Array.from(this.connections.values()).filter(conn => conn.subscriptions.has(channel));
  }

  /**
   * Close WebSocket server
   */
  close(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.wss.close();
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(event: WSEvent): void {
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`WebSocket event listener error (${event.type}):`, error);
      }
    });
  }

  /**
   * Add event listener
   */
  addEventListener(eventType: string, listener: (event: WSEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventType: string, listener: (event: WSEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Generate unique connection ID
   */
  private generateConnectionId(): string {
    return `ws_${Date.now()}_${randomBytes(4).toString("hex")}`;
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${++this.messageId}_${Date.now()}`;
  }

  /**
   * Get server statistics
   */
  getStats() {
    const connections = this.getAllConnections();
    const authenticated = this.getAuthenticatedConnections();
    
    return {
      totalConnections: connections.length,
      authenticatedConnections: authenticated.length,
      openConnections: connections.filter(conn => conn.ws.readyState === WebSocket.OPEN).length,
      subscriptions: connections.reduce((acc, conn) => acc + conn.subscriptions.size, 0),
      channels: new Set(connections.flatMap(conn => Array.from(conn.subscriptions))),
    };
  }
}

/**
 * Mount WebSocket adapter with authentication integration
 */
export function mountWebSocketAdapter(
  app: FastifyInstance,
  options: WebSocketAdapterOptions,
  authManager?: any
): WebSocketAdapter {
  const wsAdapter = new WebSocketAdapter(options);

  // Mount the WebSocket server
  wsAdapter.mount(app);

  // Add event listeners for authentication integration
  wsAdapter.addEventListener('connection', (event) => {
    if (authManager && event.user) {
      // Auto-authenticate connections with existing user context
      wsAdapter.authenticate(event.connectionId, event.user);
    }
  });

  wsAdapter.addEventListener('message', (event) => {
    // Handle authentication messages
    if (event.data?.type === 'direct' && event.data?.payload?.token) {
      // Try to authenticate with token
      try {
        const result = authManager.getTokenManager().validateToken(event.data.payload.token);
        if (result.success && result.user) {
          wsAdapter.authenticate(event.connectionId, result.user);
          
          // Send success response
          wsAdapter.sendDirectMessage(event.connectionId, {
            type: "auth_success",
            message: "WebSocket connection authenticated successfully",
            user: {
              id: result.user.id,
              username: result.user.username,
              roles: result.user.roles,
            },
          });
        }
      } catch (error) {
        wsAdapter.sendDirectMessage(event.connectionId, {
          type: "auth_error",
          message: "Authentication failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  });

  // Add WebSocket routes to Fastify app for health checks
  app.get(`${options.path}/health`, (request, reply) => {
    const stats = wsAdapter.getStats();
    
    return reply.send({
      status: "ok",
      adapter: "websocket",
      timestamp: new Date().toISOString(),
      path: options.path,
      stats,
    });
  });

  app.get(`${options.path}/stats`, {
    preHandler: authManager ? authManager.createAuthMiddleware({
      required: true,
      roles: ["admin"],
    }) : undefined,
  }, (request, reply) => {
    const stats = wsAdapter.getStats();
    
    return reply.send({
      status: "ok",
      adapter: "websocket",
      timestamp: new Date().toISOString(),
      stats,
      connections: wsAdapter.getAllConnections().map(conn => ({
        id: conn.id,
        authenticated: conn.authenticated,
        subscriptions: Array.from(conn.subscriptions),
        user: conn.user ? {
          id: conn.user.id,
          username: conn.user.username,
          roles: conn.user.roles,
        } : null,
        metadata: conn.metadata,
        lastPing: new Date(conn.lastPing).toISOString(),
      })),
    });
  });

  return wsAdapter;
}