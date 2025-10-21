import { createOpencodeClient } from '@opencode-ai/sdk';
import { sessionStore, eventStore, messageStore } from '../index.js';
import type { Session, Event } from '@opencode-ai/sdk';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface IndexerState {
  lastIndexedSessionTime?: number;
  lastIndexedMessageTimes: Record<string, number>; // sessionId -> last message time
  lastProcessedEventTime?: number;
}

export class IndexerService {
  private client: any;
  private isRunning: boolean = false;
  private eventCounts: Map<string, number> = new Map();
  private lastLogTime: number = 0;
  private readonly LOG_DEBOUNCE_MS = 5000; // Log same event type max once per 5 seconds
  private readonly STATE_SAVE_INTERVAL_MS = 30000; // Save state every 30 seconds
  private lastStateSaveTime: number = 0;
  private stateSaveTimer?: NodeJS.Timeout;
  private state: IndexerState = {
    lastIndexedMessageTimes: {},
  };
  private readonly stateFile = join(process.cwd(), '.indexer-state.json');

  constructor() {
    this.client = createOpencodeClient({
      baseUrl: 'http://localhost:4096',
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Indexer is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting OpenCode indexer service...');

    await this.loadState();
    this.startPeriodicStateSave();
    this.subscribeToEvents();
    await this.indexNewData();
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    console.log('🛑 Stopping OpenCode indexer service...');

    if (this.stateSaveTimer) {
      clearInterval(this.stateSaveTimer);
      this.stateSaveTimer = undefined;
    }

    await this.saveState();
  }

  private async loadState(): Promise<void> {
    try {
      const data = await readFile(this.stateFile, 'utf-8');
      const savedState: IndexerState = JSON.parse(data);
      this.state = {
        lastIndexedSessionTime: savedState.lastIndexedSessionTime,
        lastIndexedMessageTimes: savedState.lastIndexedMessageTimes || {},
        lastProcessedEventTime: savedState.lastProcessedEventTime,
      };
      console.log(
        `📂 Loaded indexer state: ${Object.keys(this.state.lastIndexedMessageTimes).length} session cursors`,
      );
    } catch (error) {
      console.log('📂 No previous indexer state found, starting fresh');
    }
  }

  private async saveState(): Promise<void> {
    try {
      const stateToSave = {
        lastIndexedSessionTime: this.state.lastIndexedSessionTime,
        lastIndexedMessageTimes: this.state.lastIndexedMessageTimes,
        lastProcessedEventTime: this.state.lastProcessedEventTime,
        savedAt: Date.now(),
      };

      await writeFile(this.stateFile, JSON.stringify(stateToSave, null, 2));
      this.lastStateSaveTime = Date.now();

      if (process.argv.includes('--verbose')) {
        console.log(
          `💾 Saved indexer state: ${Object.keys(this.state.lastIndexedMessageTimes).length} session cursors`,
        );
      }
    } catch (error) {
      console.warn('⚠️  Could not save indexer state:', error);
    }
  }

  private startPeriodicStateSave(): void {
    this.stateSaveTimer = setInterval(async () => {
      if (this.isRunning) {
        await this.saveState();
      }
    }, this.STATE_SAVE_INTERVAL_MS);
  }

  private async indexNewData(): Promise<void> {
    try {
      console.log('📚 Checking for new sessions and messages...');

      const sessionsResult = await this.client.session.list();
      const sessions = sessionsResult.data || [];
      let newSessions = 0;
      let newMessages = 0;

      for (const session of sessions) {
        const sessionTime = session.time?.created || 0;
        const lastSessionTime = this.state.lastIndexedSessionTime || 0;

        if (sessionTime > lastSessionTime) {
          await this.indexSession(session);
          newSessions++;

          const messagesResult = await this.client.session.messages({
            path: { id: session.id },
          });
          const messages = messagesResult.data || [];
          const lastMessageTime = this.state.lastIndexedMessageTimes[session.id] || 0;

          for (const message of messages) {
            const messageTime = message.info?.time?.created || 0;

            if (messageTime > lastMessageTime) {
              await this.indexMessage(message, session.id);
              newMessages++;
            }
          }

          if (messages.length > 0) {
            const latestMessageTime = Math.max(
              ...messages.map((m: any) => m.info?.time?.created || 0),
            );
            this.state.lastIndexedMessageTimes[session.id] = latestMessageTime;

            // Save state after processing each session to avoid re-indexing
            await this.saveState();
          }
        }
      }

      if (sessions.length > 0) {
        const latestSessionTime = Math.max(...sessions.map((s: any) => s.time?.created || 0));
        this.state.lastIndexedSessionTime = latestSessionTime;
      }

      if (newSessions > 0 || newMessages > 0) {
        console.log(`✅ Indexed ${newSessions} new sessions and ${newMessages} new messages`);
      } else {
        console.log('✅ No new sessions or messages to index');
      }

      await this.saveState();
    } catch (error) {
      console.error('❌ Error indexing new data:', error);
    }
  }

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

  private async handleEvent(event: any): Promise<void> {
    try {
      await this.indexEvent(event);

      if (this.isMessageEvent(event)) {
        await this.handleMessageEvent(event);
      }
    } catch (error) {
      console.error('❌ Error handling event:', error);
    }
  }

  private isMessageEvent(event: any): boolean {
    return (
      event.type === 'message.updated' ||
      event.type === 'message.part.updated' ||
      event.type === 'message.removed'
    );
  }

  private async handleMessageEvent(event: any): Promise<void> {
    try {
      const sessionId = this.extractSessionId(event);
      if (!sessionId) {
        console.warn('⚠️ Message event without session ID:', event);
        return;
      }

      const messagesResult = await this.client.session.messages({
        path: { id: sessionId },
      });
      const messages = messagesResult.data || [];

      for (const message of messages) {
        await this.indexMessage(message, sessionId);
      }

      console.log(`📝 Indexed ${messages.length} messages for session ${sessionId}`);
    } catch (error) {
      console.error('❌ Error handling message event:', error);
    }
  }

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

  private logEvent(eventType: string): void {
    const now = Date.now();
    const count = this.eventCounts.get(eventType) || 0;
    const timeSinceLastLog = now - this.lastLogTime;

    this.eventCounts.set(eventType, count + 1);

    const shouldLog =
      timeSinceLastLog > this.LOG_DEBOUNCE_MS || count === 1 || process.argv.includes('--verbose');

    if (shouldLog) {
      const totalEvents = Array.from(this.eventCounts.values()).reduce((sum, c) => sum + c, 0);
      console.log(`📡 Indexed events (${totalEvents} total): ${eventType} (${count})`);
      this.lastLogTime = now;
    }
  }
}
