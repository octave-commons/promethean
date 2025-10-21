/**
 * @license
 * Copyright (C) 2025 Promethean Technologies. All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import type { FastifyReply } from 'fastify';
import type { SSEEvent, CollectionType } from '../types/index.js';

/**
 * Extended SSE event type that includes connection and heartbeat events
 */
interface ExtendedSSEEvent {
  type: 'insert' | 'update' | 'delete' | 'connection' | 'heartbeat';
  collection: CollectionType;
  data: any;
  timestamp: string;
}

/**
 * SSE Client connection
 */
interface SSEClient {
  id: string;
  reply: FastifyReply;
  collections: Set<CollectionType>;
  lastPing: number;
}

/**
 * Server-Sent Events service for real-time data streaming
 */
export class SSEService {
  private clients = new Map<string, SSEClient>();
  private pollingInterval: NodeJS.Timeout | null = null;
  private pollingIntervalMs: number;
  private isRunning = false;

  constructor(pollingIntervalMs: number = 5000) {
    this.pollingIntervalMs = pollingIntervalMs;
  }

  /**
   * Start the SSE service
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.startPolling();
    this.startHeartbeat();
  }

  /**
   * Stop the SSE service
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    // Close all client connections
    for (const client of this.clients.values()) {
      try {
        client.reply.raw.end();
      } catch (error) {
        // Ignore errors when closing connections
      }
    }

    this.clients.clear();
  }

  /**
   * Add a new SSE client
   */
  addClient(clientId: string, reply: FastifyReply, collections: CollectionType[] = []): void {
    const client: SSEClient = {
      id: clientId,
      reply,
      collections: new Set(collections),
      lastPing: Date.now(),
    };

    this.clients.set(clientId, client);

    // Set up SSE headers
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Send initial connection event
    this.sendEvent(clientId, {
      type: 'connection',
      collection: 'session_messages' as CollectionType,
      data: { clientId, connected: true },
      timestamp: new Date().toISOString(),
    });

    // Handle client disconnect
    reply.raw.on('close', () => {
      this.removeClient(clientId);
    });
  }

  /**
   * Remove an SSE client
   */
  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      try {
        client.reply.raw.end();
      } catch (error) {
        // Ignore errors when closing connections
      }
      this.clients.delete(clientId);
    }
  }

  /**
   * Send an event to a specific client
   */
  sendEvent(clientId: string, event: SSEEvent | ExtendedSSEEvent): boolean {
    const client = this.clients.get(clientId);
    if (!client) {
      return false;
    }

    try {
      const eventData = this.formatSSEEvent(event);
      client.reply.raw.write(eventData);
      return true;
    } catch (error) {
      // Remove client if connection is broken
      this.removeClient(clientId);
      return false;
    }
  }

  /**
   * Broadcast an event to all clients subscribed to a collection
   */
  broadcastEvent(collection: CollectionType, event: SSEEvent | ExtendedSSEEvent): number {
    let sentCount = 0;

    for (const [clientId, client] of this.clients) {
      if (client.collections.has(collection) || client.collections.size === 0) {
        if (this.sendEvent(clientId, event)) {
          sentCount++;
        }
      }
    }

    return sentCount;
  }

  /**
   * Get active client count
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get client information
   */
  getClients(): Array<{ id: string; collections: CollectionType[]; lastPing: number }> {
    return Array.from(this.clients.values()).map((client) => ({
      id: client.id,
      collections: Array.from(client.collections),
      lastPing: client.lastPing,
    }));
  }

  /**
   * Format SSE event data
   */
  private formatSSEEvent(event: SSEEvent | ExtendedSSEEvent): string {
    const lines = [
      `event: ${event.type}`,
      `data: ${JSON.stringify({
        collection: event.collection,
        data: event.data,
        timestamp: event.timestamp,
      })}`,
      '', // Empty line to end the event
      '', // Extra newline for proper formatting
    ];

    return lines.join('\n');
  }

  /**
   * Start polling for data changes
   */
  public startPolling(): void {
    this.pollingInterval = setInterval(async () => {
      try {
        await this.pollForChanges();
      } catch (error) {
        console.error('Error polling for changes:', error);
      }
    }, this.pollingIntervalMs);
  }

  /**
   * Poll for data changes (mock implementation)
   * In a real implementation, this would query the database for changes
   */
  private async pollForChanges(): Promise<void> {
    // This is a mock implementation
    // In a real application, you would:
    // 1. Query each collection for new/updated/deleted items
    // 2. Compare with last known state
    // 3. Send appropriate SSE events to subscribed clients

    // For now, we'll just send a heartbeat event
    const heartbeatEvent: ExtendedSSEEvent = {
      type: 'heartbeat',
      collection: 'session_messages',
      data: { timestamp: Date.now() },
      timestamp: new Date().toISOString(),
    };

    for (const clientId of this.clients.keys()) {
      this.sendEvent(clientId, heartbeatEvent);
    }
  }

  /**
   * Start heartbeat to keep connections alive
   */
  private startHeartbeat(): void {
    setInterval(() => {
      const now = Date.now();
      const timeout = 30000; // 30 seconds timeout

      for (const [clientId, client] of this.clients) {
        if (now - client.lastPing > timeout) {
          this.removeClient(clientId);
        } else {
          // Send ping
          try {
            client.reply.raw.write(': ping\n\n');
            client.lastPing = now;
          } catch (error) {
            this.removeClient(clientId);
          }
        }
      }
    }, 15000); // Send ping every 15 seconds
  }
}

export default SSEService;
