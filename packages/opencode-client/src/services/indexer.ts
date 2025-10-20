import { createOpencodeClient } from '@opencode-ai/sdk';
import { sessionStore, eventStore, messageStore } from '../index.js';
import type { Session, Event } from '@opencode-ai/sdk';

export class IndexerService {
  private client: any;
  private isRunning: boolean = false;

  constructor() {
    this.client = createOpencodeClient({
      baseUrl: 'http://localhost:4096',
    });
  }

  /**
   * Start the indexer service to actively capture events and messages
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Indexer is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting OpenCode indexer service...');

    // Start event subscription
    this.subscribeToEvents();

    // Index existing sessions and messages
    await this.indexExistingData();
  }

  /**
   * Stop the indexer service
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    console.log('🛑 Stopping OpenCode indexer service...');
  }

  /**
   * Subscribe to live events and save them to the store
   */
  private async subscribeToEvents(): Promise<void> {
    try {
      const sub = await this.client.event.subscribe();
      console.log('📡 Subscribed to OpenCode events');

      for await (const ev of sub.stream) {
        await this.indexEvent(ev);
      }
    } catch (error) {
      console.error('❌ Error subscribing to events:', error);
    }
  }

  /**
   * Index a single event as a markdown document
   */
  private async indexEvent(event: any): Promise<void> {
    try {
      const markdown = this.eventToMarkdown(event);
      const timestamp = Date.now();

      await eventStore.insert({
        id: `event_${event.type}_${timestamp}`,
        text: markdown,
        timestamp,
        metadata: {
          type: 'event',
          eventType: event.type,
          sessionId: this.extractSessionId(event),
        },
      });

      console.log(`📝 Indexed event: ${event.type}`);
    } catch (error) {
      console.error('❌ Error indexing event:', error);
    }
  }

  /**
   * Index existing sessions and their messages
   */
  private async indexExistingData(): Promise<void> {
    try {
      console.log('📚 Indexing existing sessions...');

      // Get all sessions
      const sessionsResult = await this.client.session.list();
      const sessions = sessionsResult.data || [];

      for (const session of sessions) {
        await this.indexSession(session);

        // Get messages for this session
        const messagesResult = await this.client.session.messages({
          path: { id: session.id },
        });
        const messages = messagesResult.data || [];

        for (const message of messages) {
          await this.indexMessage(message, session.id);
        }
      }

      console.log(
        `✅ Indexed ${sessions.length} sessions and ${messages.reduce((sum, msg) => sum + msg.length, 0)} messages`,
      );
    } catch (error) {
      console.error('❌ Error indexing existing data:', error);
    }
  }

  /**
   * Index a session as a markdown document
   */
  private async indexSession(session: any): Promise<void> {
    try {
      const markdown = this.sessionToMarkdown(session);

      await sessionStore.insert({
        id: `session_${session.id}`,
        text: markdown,
        timestamp: session.time?.created || Date.now(),
        metadata: {
          type: 'session',
          sessionId: session.id,
          title: session.title,
        },
      });
    } catch (error) {
      console.error('❌ Error indexing session:', error);
    }
  }

  /**
   * Index a message as a markdown document
   */
  private async indexMessage(message: any, sessionId: string): Promise<void> {
    try {
      const markdown = this.messageToMarkdown(message);

      await messageStore.add({
        id: `message_${message.info?.id}`,
        content: markdown,
        metadata: {
          type: 'message',
          messageId: message.info?.id,
          sessionId,
          role: message.info?.role,
          timestamp: message.info?.time?.created,
        },
      });
    } catch (error) {
      console.error('❌ Error indexing message:', error);
    }
  }

  /**
   * Convert event to markdown format
   */
  private eventToMarkdown(event: Event): string {
    const sessionId = this.extractSessionId(event);
    const timestamp = new Date().toISOString();

    return `# Event: ${event.type}

**Timestamp:** ${timestamp}
**Session ID:** ${sessionId || 'N/A'}

## Properties

\`\`\`json
${JSON.stringify(event.properties || {}, null, 2)}
\`\`\`

---
`;
  }

  /**
   * Convert session to markdown format
   */
  private sessionToMarkdown(session: Session): string {
    return `# Session: ${session.title}

**ID:** ${session.id}
**Created:** ${new Date(session.time.created).toLocaleString()}
**Project ID:** ${session.projectID}

## Description

${session.title || 'Untitled Session'}

---
`;
  }

  /**
   * Convert message to markdown format
   */
  private messageToMarkdown(message: any): string {
    const textParts = message.parts?.filter((part: any) => part.type === 'text') || [];
    const content = textParts.map((part: any) => part.text).join('\n\n') || '[No text content]';

    return `# Message: ${message.info?.id}

**Role:** ${message.info?.role || 'unknown'}
**Timestamp:** ${message.info?.time?.created ? new Date(message.info.time.created).toLocaleString() : 'Unknown'}
**Message ID:** ${message.info?.id || 'unknown'}

## Content

${content}

---
`;
  }

  /**
   * Extract session ID from different event types
   */
  private extractSessionId(event: Event): string | undefined {
    if (event.type === 'session.updated' || event.type === 'session.deleted') {
      return (event as any).properties?.info?.id;
    }
    if (event.type === 'message.updated' || event.type === 'message.removed') {
      return (event as any).properties?.sessionID;
    }
    if (event.type === 'message.updated') {
      return (event as any).properties?.info?.sessionID;
    }
    return undefined;
  }
}
