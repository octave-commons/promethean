/**
 * Real-time Synchronization for MCP-Kanban Bridge
 *
 * Provides WebSocket-based real-time updates and event broadcasting
 * for seamless MCP-Kanban communication.
 */

import { WebSocket, WebSocketServer } from 'ws';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import type { BridgeConfig, SyncEvent, BridgeTask, BridgeBoard } from './types.js';

// Define additional types needed for real-time sync
export interface SyncSubscription {
  id: string;
  clientId: string;
  filters: {
    statuses?: string[];
    priorities?: string[];
    labels?: string[];
  };
  createdAt: string;
  lastActivity: string;
}

export interface SyncMessage {
  type: 'update' | 'delete' | 'create';
  entity: 'task' | 'board' | 'column';
  data: any;
  timestamp: string;
}

export interface RealtimeClient {
  id: string;
  ws: WebSocket;
  subscriptions: SyncSubscription[];
  lastPing: string;
  isActive: boolean;
}

export class RealtimeSyncManager extends EventEmitter {
  private wss?: WebSocketServer;
  private clients = new Map<string, RealtimeClient>();
  private subscriptions = new Map<string, SyncSubscription>();
  private pingInterval?: NodeJS.Timeout;

  constructor(private config: BridgeConfig) {
    super();
    // Store config for potential future use
    void this.config; // Mark as used to avoid unused variable warning
  }

  async start(port: number = 8080): Promise<void> {
    this.wss = new WebSocketServer({
      port,
      path: '/ws',
    });

    this.wss.on('connection', (ws: WebSocket, request) => {
      this.handleConnection(ws, request);
    });

    this.startPingInterval();

    console.log(`🔌 Real-time sync server started on port ${port}`);
    this.emit('serverStarted', { port });

    // Set up event listeners for bridge events
    this.setupBridgeEventListeners();
  }

  async stop(): Promise<void> {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    if (this.wss) {
      // Close all client connections
      for (const client of this.clients.values()) {
        client.ws.close(1000, 'Server shutting down');
      }

      this.wss.close();
      this.wss = undefined;
    }

    console.log('🔌 Real-time sync server stopped');
    this.emit('serverStopped');
  }

  private handleConnection(ws: WebSocket, _request: any): void {
    const clientId = uuidv4();
    const client: RealtimeClient = {
      id: clientId,
      ws,
      subscriptions: [],
      lastPing: new Date().toISOString(),
      isActive: true,
    };

    this.clients.set(clientId, client);

    console.log(`🔗 Client connected: ${clientId}`);

    ws.on('message', (data: Buffer) => {
      this.handleClientMessage(clientId, data);
    });

    ws.on('close', (code: number, reason: Buffer) => {
      this.handleDisconnection(clientId, code, reason.toString());
    });

    ws.on('error', (error: Error) => {
      console.error(`❌ WebSocket error for client ${clientId}:`, error);
      this.handleDisconnection(clientId, 1006, 'WebSocket error');
    });

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'connected',
      data: {
        clientId,
        serverTime: new Date().toISOString(),
        capabilities: ['subscribe', 'unsubscribe', 'ping', 'get_status'],
      },
    });
  }

  private handleClientMessage(clientId: string, data: Buffer): void {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'subscribe':
          this.handleSubscription(clientId, message.data);
          break;
        case 'unsubscribe':
          this.handleUnsubscription(clientId, message.data);
          break;
        case 'ping':
          this.handlePing(clientId);
          break;
        case 'get_status':
          this.handleGetStatus(clientId);
          break;
        default:
          console.warn(`⚠️ Unknown message type from client ${clientId}:`, message.type);
      }
    } catch (error) {
      console.error(`❌ Invalid message from client ${clientId}:`, error);
      this.sendError(clientId, 'invalid_message', 'Invalid JSON format');
    }
  }

  private handleSubscription(clientId: string, data: any): void {
    const subscription: SyncSubscription = {
      id: uuidv4(),
      clientId,
      filters: data.filters || {},
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };

    this.subscriptions.set(subscription.id, subscription);

    const client = this.clients.get(clientId);
    if (client) {
      client.subscriptions.push(subscription);
    }

    console.log(`📝 Client ${clientId} subscribed with filters:`, subscription.filters);

    this.sendToClient(clientId, {
      type: 'subscribed',
      data: { subscriptionId: subscription.id },
    });

    this.emit('clientSubscribed', { clientId, subscription });
  }

  private handleUnsubscription(clientId: string, data: any): void {
    const subscriptionId = data.subscriptionId;
    const subscription = this.subscriptions.get(subscriptionId);

    if (subscription && subscription.clientId === clientId) {
      this.subscriptions.delete(subscriptionId);

      const client = this.clients.get(clientId);
      if (client) {
        client.subscriptions = client.subscriptions.filter((s) => s.id !== subscriptionId);
      }

      console.log(`🗑️ Client ${clientId} unsubscribed from ${subscriptionId}`);

      this.sendToClient(clientId, {
        type: 'unsubscribed',
        data: { subscriptionId },
      });

      this.emit('clientUnsubscribed', { clientId, subscriptionId });
    } else {
      this.sendError(
        clientId,
        'invalid_subscription',
        'Subscription not found or not owned by client',
      );
    }
  }

  private handlePing(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.lastPing = new Date().toISOString();
    }

    this.sendToClient(clientId, {
      type: 'pong',
      data: { timestamp: new Date().toISOString() },
    });
  }

  private handleGetStatus(clientId: string): void {
    const status = {
      connectedClients: this.clients.size,
      activeSubscriptions: this.subscriptions.size,
      serverUptime: process.uptime(),
      lastSyncTime: new Date().toISOString(),
    };

    this.sendToClient(clientId, {
      type: 'status',
      data: status,
    });
  }

  private handleDisconnection(clientId: string, code: number, reason: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      // Remove client's subscriptions
      for (const subscription of client.subscriptions) {
        this.subscriptions.delete(subscription.id);
      }

      this.clients.delete(clientId);
      console.log(`🔌 Client disconnected: ${clientId} (${code}: ${reason})`);

      this.emit('clientDisconnected', { clientId, code, reason });
    }
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      const now = new Date();
      const timeoutMs = 30000; // 30 seconds timeout

      for (const [clientId, client] of this.clients.entries()) {
        const lastPing = new Date(client.lastPing);
        const diffMs = now.getTime() - lastPing.getTime();

        if (diffMs > timeoutMs) {
          console.log(`⏰ Client ${clientId} timed out, disconnecting`);
          client.ws.close(1000, 'Ping timeout');
          this.handleDisconnection(clientId, 1000, 'Ping timeout');
        } else {
          // Send ping to client
          this.sendToClient(clientId, {
            type: 'ping',
            data: { timestamp: now.toISOString() },
          });
        }
      }
    }, 15000); // Send ping every 15 seconds
  }

  private setupBridgeEventListeners(): void {
    // Listen to sync events and broadcast them
    this.on('syncEvent', (event: SyncEvent) => {
      this.broadcastSyncEvent(event);
    });

    this.on('taskUpdated', (data: { taskId: string; task: BridgeTask }) => {
      this.broadcastTaskUpdate(data);
    });

    this.on('boardUpdated', (data: { board: BridgeBoard }) => {
      this.broadcastBoardUpdate(data);
    });
  }

  // Public methods for broadcasting events
  broadcastSyncEvent(event: SyncEvent): void {
    const message: SyncMessage = {
      type: 'update',
      entity: 'task',
      data: event,
      timestamp: new Date().toISOString(),
    };

    this.broadcastToSubscribers(message, event);
  }

  broadcastTaskUpdate(data: { taskId: string; task: BridgeTask }): void {
    const message: SyncMessage = {
      type: 'update',
      entity: 'task',
      data,
      timestamp: new Date().toISOString(),
    };

    this.broadcastToSubscribers(message, { taskId: data.taskId });
  }

  broadcastBoardUpdate(data: { board: BridgeBoard }): void {
    const message: SyncMessage = {
      type: 'update',
      entity: 'board',
      data,
      timestamp: new Date().toISOString(),
    };

    // Board updates go to all subscribers
    this.broadcast(message);
  }

  private broadcastToSubscribers(message: SyncMessage, eventFilter?: any): void {
    for (const subscription of this.subscriptions.values()) {
      if (this.shouldSendToSubscription(subscription, eventFilter)) {
        this.sendToClient(subscription.clientId, {
          type: 'sync_event',
          data: message,
        });

        subscription.lastActivity = new Date().toISOString();
      }
    }
  }

  private shouldSendToSubscription(subscription: SyncSubscription, eventFilter?: any): boolean {
    const filters = subscription.filters;

    if (!filters || Object.keys(filters).length === 0) {
      return true; // No filters, send to all
    }

    // Check status filter
    if (filters.statuses && filters.statuses.length > 0 && eventFilter) {
      // This would need to be implemented based on the actual event structure
      // For now, we'll send it if there are any status filters
    }

    // Check priority filter
    if (filters.priorities && filters.priorities.length > 0 && eventFilter) {
      // Similar implementation needed for priority filtering
    }

    // Check labels filter
    if (filters.labels && filters.labels.length > 0 && eventFilter) {
      // Similar implementation needed for label filtering
    }

    return true; // Default to sending if no specific filter logic
  }

  private broadcast(message: any): void {
    for (const clientId of this.clients.keys()) {
      this.sendToClient(clientId, message);
    }
  }

  private sendToClient(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`❌ Failed to send message to client ${clientId}:`, error);
      }
    }
  }

  private sendError(clientId: string, code: string, message: string): void {
    this.sendToClient(clientId, {
      type: 'error',
      data: { code, message },
    });
  }

  // Utility methods
  getConnectedClients(): number {
    return this.clients.size;
  }

  getActiveSubscriptions(): number {
    return this.subscriptions.size;
  }

  getClientStats(): Array<{ clientId: string; subscriptions: number; lastPing: string }> {
    return Array.from(this.clients.values()).map((client) => ({
      clientId: client.id,
      subscriptions: client.subscriptions.length,
      lastPing: client.lastPing,
    }));
  }
}
