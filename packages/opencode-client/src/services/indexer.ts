import { createOpencodeClient } from '@opencode-ai/sdk';
import { sessionStore, eventStore, messageStore } from '../index.js';
import type { Session, Event } from '@opencode-ai/sdk';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface IndexerState {
  lastIndexedSessionId?: string;
  lastIndexedMessageId?: string;
}

export class IndexerService {
  private client: any;
  private isRunning: boolean = false;
  private readonly STATE_SAVE_INTERVAL_MS = 30000; // Save state every 30 seconds
  private stateSaveTimer?: NodeJS.Timeout;
  private state: IndexerState = {};
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
      this.state = savedState;
      console.log(
        `📂 Loaded indexer state: lastSession=${this.state.lastIndexedSessionId}, lastMessage=${this.state.lastIndexedMessageId}`,
      );
    } catch (error) {
      console.log('📂 No previous indexer state found, starting fresh');
    }
  }

  private async saveState(): Promise<void> {
    try {
      const stateToSave = {
        lastIndexedSessionId: this.state.lastIndexedSessionId,
        lastIndexedMessageId: this.state.lastIndexedMessageId,
        savedAt: Date.now(),
      };

      await writeFile(this.stateFile, JSON.stringify(stateToSave, null, 2));

      if (process.argv.includes('--verbose')) {
        console.log(
          `💾 Saved indexer state: lastSession=${this.state.lastIndexedSessionId}, lastMessage=${this.state.lastIndexedMessageId}`,
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

      // Find the index of the last indexed session
      let startIndex = 0;
      if (this.state.lastIndexedSessionId) {
        startIndex = sessions.findIndex((s: any) => s.id === this.state.lastIndexedSessionId);
        if (startIndex !== -1) startIndex++; // Start after the last indexed session
      }

      for (let i = startIndex; i < sessions.length; i++) {
        const session = sessions[i];
        await this.indexSession(session);
        newSessions++;
        this.state.lastIndexedSessionId = session.id;

        const messagesResult = await this.client.session.messages({
          path: { id: session.id },
        });
        const messages = messagesResult.data || [];

        // Find the index of the last indexed message for this session
        let messageStartIndex = 0;
        if (this.state.lastIndexedMessageId && i === sessions.length - 1) {
          messageStartIndex = messages.findIndex(
            (m: any) => m.info?.id === this.state.lastIndexedMessageId,
          );
          if (messageStartIndex !== -1) messageStartIndex++; // Start after the last indexed message
        }

        for (let j = messageStartIndex; j < messages.length; j++) {
          const message = messages[j];

          // Log progress every 50 messages
          if ((j - messageStartIndex + 1) % 50 === 0 || j === messages.length - 1) {
            console.log(
              `📨 Processing message ${j - messageStartIndex + 1}/${messages.length - messageStartIndex} in session ${session.id}`,
            );
          }

          await this.indexMessage(message, session.id);
          newMessages++;
          this.state.lastIndexedMessageId = message.info?.id;
        }

        // Save state after processing each session to avoid re-indexing
        await this.saveState();
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

      // Extract the specific message ID from the event
      const messageId = this.extractMessageId(event);
      if (!messageId) {
        console.warn('⚠️ Message event without message ID:', event);
        return;
      }

      // Fetch all messages for the session and find the specific one that changed
      const messagesResult = await this.client.session.messages({
        path: { id: sessionId },
      });
      const messages = messagesResult.data || [];

      // Find the specific message that triggered this event
      const targetMessage = messages.find((m: any) => m.info?.id === messageId);

      if (targetMessage) {
        await this.indexMessage(targetMessage, sessionId);
        this.state.lastIndexedMessageId = messageId;

        // Save state after processing message event
        await this.saveState();

        console.log(`📝 Indexed message ${messageId} for session ${sessionId}`);
      } else {
        console.warn(
          `⚠️ Could not find message ${messageId} in session ${sessionId} (found ${messages.length} messages)`,
        );
      }
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

      console.log(`📡 Indexed event: ${event.type}`);
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

  private extractMessageId(event: any): string | undefined {
    if (event.type === 'message.updated' || event.type === 'message.removed') {
      return (event as any).properties?.info?.id;
    }
    if (event.type === 'message.part.updated' || event.type === 'message.part.removed') {
      return (event as any).properties?.part?.messageID || (event as any).properties?.messageID;
    }
    return undefined;
  }
}
