import { createOpencodeClient } from '@opencode-ai/sdk';
import { sessionStore, eventStore, messageStore } from '../index.js';
import type { Session, Event } from '@opencode-ai/sdk';

export class IndexerService {
  private client: any;
  private isRunning: boolean = false;
  private eventCounts: Map<string, number> = new Map();
  private lastLogTime: number = 0;
  private readonly LOG_DEBOUNCE_MS = 5000; // Log same event type max once per 5 seconds

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
      if (typeof this.client.event?.subscribe !== 'function') {
        console.error('❌ This SDK/server does not support event.subscribe()');
        return;
      }

      const sub = await this.client.event.subscribe();
      console.log('📡 Subscribed to OpenCode events');

      for await (const event of sub.stream) {
        await this.handleEvent(event);
      }
    } catch (error) {
      console.error('❌ Error subscribing to events:', error);
    }
  }

  /**
   * Handle different types of events and capture message content
   */
  private async handleEvent(event: any): Promise<void> {
    try {
      // Index the event itself
      await this.indexEvent(event);

      // If this is a message-related event, fetch and index the full message
      if (this.isMessageEvent(event)) {
        await this.handleMessageEvent(event);
      }
    } catch (error) {
      console.error('❌ Error handling event:', error);
    }
  }

  /**
   * Check if event is related to messages
   */
  private isMessageEvent(event: any): boolean {
    return (
      event.type === 'message.updated' ||
      event.type === 'message.part.updated' ||
      event.type === 'message.removed'
    );
  }

  /**
   * Handle message events by fetching full message content
   */
  private async handleMessageEvent(event: any): Promise<void> {
    try {
      const sessionId = this.extractSessionId(event);
      if (!sessionId) {
        console.warn('⚠️ Message event without session ID:', event);
        return;
      }

      // Fetch the latest messages for this session
      const messagesResult = await this.client.session.messages({
        path: { id: sessionId },
      });
      const messages = messagesResult.data || [];

      // Index all messages (we could optimize to only index new ones)
      for (const message of messages) {
        await this.indexMessage(message, sessionId);
      }

      console.log(`📝 Indexed ${messages.length} messages for session ${sessionId}`);
    } catch (error) {
      console.error('❌ Error handling message event:', error);
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

      this.logEvent(event.type);
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
      let totalMessages = 0;

      for (const session of sessions) {
        await this.indexSession(session);

        // Get messages for this session
        const messagesResult = await this.client.session.messages({
          path: { id: session.id },
        });
        const messages = messagesResult.data || [];
        totalMessages += messages.length;

        for (const message of messages) {
          await this.indexMessage(message, session.id);
        }
      }

      console.log(`✅ Indexed ${sessions.length} sessions and ${totalMessages} messages`);
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

      await messageStore.insert({
        id: `message_${message.info?.id}`,
        text: markdown,
        timestamp: message.info?.time?.created || Date.now(),
        metadata: {
          type: 'message',
          messageId: message.info?.id,
          sessionId,
          role: message.info?.role,
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
  private extractSessionId(event: any): string | undefined {
    if (event.type === 'session.updated' || event.type === 'session.deleted') {
      return (event as any).properties?.info?.id;
    }
    if (event.type === 'message.updated' || event.type === 'message.removed') {
      return (event as any).properties?.info?.sessionID || (event as any).properties?.sessionID;
    }
    if (event.type === 'message.part.updated' || event.type === 'message.part.removed') {
      return (event as any).properties?.part?.sessionID || (event as any).properties?.sessionID;
    }
    return undefined;
  }

  /**
   * Log events with deduplication to reduce noise
   */
  private logEvent(eventType: string): void {
    const now = Date.now();
    const count = this.eventCounts.get(eventType) || 0;
    const timeSinceLastLog = now - this.lastLogTime;

    // Update count
    this.eventCounts.set(eventType, count + 1);

    // Only log if:
    // 1. It's been 5+ seconds since last log, OR
    // 2. This is the first time we've seen this event type, OR
    // 3. We're in verbose mode
    const shouldLog =
      timeSinceLastLog > this.LOG_DEBOUNCE_MS || count === 1 || process.argv.includes('--verbose');

    if (shouldLog) {
      const totalEvents = Array.from(this.eventCounts.values()).reduce((sum, c) => sum + c, 0);
      console.log(`📡 Indexed events (${totalEvents} total): ${eventType} (${count})`);
      this.lastLogTime = now;
    }
  }
}
