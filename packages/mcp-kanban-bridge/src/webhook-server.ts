import Fastify, { FastifyInstance } from 'fastify';
import { WebhookHandler, WebhookEvent, BridgeConfig } from './types';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export class WebhookServer implements WebhookHandler {
  private server: FastifyInstance;

  constructor(private config: BridgeConfig) {
    this.server = Fastify({
      logger: true
    });
    this.setupRoutes();
  }

  async start(): Promise<void> {
    try {
      await this.server.listen({
        port: this.config.server.port,
        host: this.config.server.host
      });
    } catch (error) {
      this.server.log.error(error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    await this.server.close();
  }

  async handleWebhook(event: WebhookEvent): Promise<void> {
    // This method is called internally when webhooks are received
    // The actual handling is done in the route handlers
  }

  verifySignature(event: WebhookEvent, secret: string): boolean {
    if (!event.signature) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(event.payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(event.signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  private setupRoutes(): void {
    // MCP webhook endpoint
    this.server.post('/webhook/mcp', {
      preHandler: async (request, reply) => {
        const signature = request.headers['x-mcp-signature'] as string;
        const payload = request.body;

        if (!signature || !this.verifyMcpSignature(payload, signature)) {
          reply.code(401).send({ error: 'Invalid signature' });
          return;
        }
      }
    }, async (request, reply) => {
      try {
        const event: WebhookEvent = {
          id: uuidv4(),
          source: 'mcp',
          type: (request.body as any).type,
          payload: request.body as any,
          signature: request.headers['x-mcp-signature'] as string,
          timestamp: new Date()
        };

        // Emit event for processing
        this.server.emit('mcpWebhook', event);

        reply.code(200).send({ received: true });
      } catch (error) {
        this.server.log.error(error);
        reply.code(500).send({ error: 'Internal server error' });
      }
    });

    // Kanban webhook endpoint
    this.server.post('/webhook/kanban', {
      preHandler: async (request, reply) => {
        const signature = request.headers['x-kanban-signature'] as string;
        const payload = request.body;

        if (!signature || !this.verifyKanbanSignature(payload, signature)) {
          reply.code(401).send({ error: 'Invalid signature' });
          return;
        }
      }
    }, async (request, reply) => {
      try {
        const event: WebhookEvent = {
          id: uuidv4(),
          source: 'kanban',
          type: (request.body as any).type,
          payload: request.body as any,
          signature: request.headers['x-kanban-signature'] as string,
          timestamp: new Date()
        };

        // Emit event for processing
        this.server.emit('kanbanWebhook', event);

        reply.code(200).send({ received: true });
      } catch (error) {
        this.server.log.error(error);
        reply.code(500).send({ error: 'Internal server error' });
      }
    });

    // Health check endpoint
    this.server.get('/health', async (request, reply) => {
      reply.code(200).send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // Metrics endpoint
    this.server.get('/metrics', async (request, reply) => {
      // This would be implemented with actual metrics
      reply.code(200).send({
        eventsProcessed: 0,
        eventsFailed: 0,
        tasksSynced: 0,
        conflictsResolved: 0,
        lastSyncTime: null,
        averageSyncTime: 0,
        queueSize: 0
      });
    });

    // Test webhook endpoint (for development)
    this.server.post('/test/webhook', async (request, reply) => {
      try {
        const { source, payload } = request.body as any;
        
        const event: WebhookEvent = {
          id: uuidv4(),
          source,
          type: payload.type || 'test',
          payload,
          timestamp: new Date()
        };

        // Emit test event
        this.server.emit('testWebhook', event);

        reply.code(200).send({ 
          received: true,
          eventId: event.id
        });
      } catch (error) {
        this.server.log.error(error);
        reply.code(500).send({ error: 'Internal server error' });
      }
    });
  }

  private verifyMcpSignature(payload: any, signature: string): boolean {
    const secret = this.config.mcp.webhookSecret;
    return this.verifySignature({
      id: '',
      source: 'mcp',
      type: '',
      payload,
      signature,
      timestamp: new Date()
    }, secret);
  }

  private verifyKanbanSignature(payload: any, signature: string): boolean {
    const secret = this.config.kanban.webhookSecret;
    return this.verifySignature({
      id: '',
      source: 'kanban',
      type: '',
      payload,
      signature,
      timestamp: new Date()
    }, secret);
  }

  // Event registration methods
  onMcpWebhook(handler: (event: WebhookEvent) => void): void {
    this.server.on('mcpWebhook', handler);
  }

  onKanbanWebhook(handler: (event: WebhookEvent) => void): void {
    this.server.on('kanbanWebhook', handler);
  }

  onTestWebhook(handler: (event: WebhookEvent) => void): void {
    this.server.on('testWebhook', handler);
  }

  // Utility methods for testing
  async testWebhook(source: 'mcp' | 'kanban', payload: any): Promise<any> {
    const response = await this.server.inject({
      method: 'POST',
      url: '/test/webhook',
      payload: { source, payload }
    });

    return response.json();
  }

  async healthCheck(): Promise<any> {
    const response = await this.server.inject({
      method: 'GET',
      url: '/health'
    });

    return response.json();
  }

  async getMetrics(): Promise<any> {
    const response = await this.server.inject({
      method: 'GET',
      url: '/metrics'
    });

    return response.json();
  }
}