/**
 * Event Capture Service for Populating Dual Stores
 * Bridges opencode events to dual store persistence
 */

import { DualStoreManager } from '@promethean/persistence';

// Store managers
let sessionMessagesStore: DualStoreManager<'message', 'timestamp'> | null = null;
let agentTasksStore: DualStoreManager<'task', 'createdAt'> | null = null;
let opencodeEventsStore: DualStoreManager<'data', 'timestamp'> | null = null;

// Event subscription interface
interface OpenCodeEvent {
  type: string;
  properties?: any;
  timestamp?: string;
}

/**
 * Initialize event capture service
 */
export async function initializeEventCapture() {
  try {
    console.log('🔄 Initializing event capture service...');

    // Initialize dual store managers
    sessionMessagesStore = await DualStoreManager.create(
      'session_messages',
      'message',
      'timestamp',
    );
    agentTasksStore = await DualStoreManager.create('agent_tasks', 'task', 'createdAt');
    opencodeEventsStore = await DualStoreManager.create('opencode_events', 'data', 'timestamp');

    console.log('✅ Event capture service initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize event capture:', error);
    return false;
  }
}

/**
 * Extract session ID from various event structures
 */
function extractSessionId(event: OpenCodeEvent): string | undefined {
  return (
    event.properties?.sessionID ||
    event.properties?.session?.id ||
    event.properties?.message?.session_id ||
    event.properties?.sessionId
  );
}

/**
 * Extract user ID from event
 */
function extractUserId(event: OpenCodeEvent): string | undefined {
  return event.properties?.userId || event.properties?.user?.id;
}

/**
 * Extract message data from event
 */
function extractMessageData(event: OpenCodeEvent): any {
  const message = event.properties?.message;
  if (!message) return undefined;

  return {
    id: message.info?.id,
    session_id: message.session_id,
    parts: message.parts?.map((part: any) => ({
      type: part.type,
      text: part.type === 'text' ? truncateText(part.text, 500) : undefined,
      metadata: part.metadata,
    })),
    role: message.role,
    created_at: message.created_at,
  };
}

/**
 * Extract session data from event
 */
function extractSessionData(event: OpenCodeEvent): any {
  const sessionInfo = event.properties?.session || event.properties?.info;
  if (!sessionInfo) return undefined;

  return {
    id: sessionInfo.id,
    title: sessionInfo.title,
    created_at: sessionInfo.created_at,
    updated_at: sessionInfo.updated_at,
    message_count: sessionInfo.message_count,
    is_agent_task: sessionInfo.is_agent_task,
  };
}

/**
 * Extract tool data from event
 */
function extractToolData(event: OpenCodeEvent): any {
  const tool = event.properties?.tool;
  if (!tool) return undefined;

  return {
    name: tool.name,
    args: tool.args,
    result: tool.result
      ? typeof tool.result === 'string'
        ? truncateText(tool.result, 1000)
        : 'Complex result object'
      : undefined,
    error: tool.error,
  };
}

/**
 * Truncate text helper
 */
function truncateText(text: string | undefined, maxLength: number): string | undefined {
  if (!text) return undefined;
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Process and store a single event
 */
export async function processEvent(event: OpenCodeEvent): Promise<void> {
  try {
    const sessionId = extractSessionId(event);
    const userId = extractUserId(event);
    const messageData = extractMessageData(event);
    const sessionData = extractSessionData(event);
    const toolData = extractToolData(event);

    // Store in opencode_events
    if (opencodeEventsStore) {
      const eventData = {
        eventType: event.type,
        timestamp: event.timestamp || new Date().toISOString(),
        sessionId,
        userId,
        messageData,
        sessionData,
        toolData,
        rawEvent: truncateText(JSON.stringify(event), 10000),
      };

      await opencodeEventsStore.insert({
        id: `${event.type}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        data: JSON.stringify(eventData),
        timestamp: eventData.timestamp,
        metadata: {
          eventType: event.type,
          sessionId,
          userId,
          hasMessage: !!messageData,
          hasSession: !!sessionData,
          hasTool: !!toolData,
          isAgentTask: sessionData?.is_agent_task || false,
        },
      });
    }

    // Store session messages
    if (sessionMessagesStore && messageData) {
      await sessionMessagesStore.insert({
        id: messageData.id,
        message: JSON.stringify(messageData),
        timestamp: messageData.created_at || new Date().toISOString(),
        metadata: {
          session_id: messageData.session_id,
          role: messageData.role,
          userId,
        },
      });
    }

    // Store agent tasks
    if (agentTasksStore && sessionData?.is_agent_task) {
      await agentTasksStore.insert({
        id: sessionData.id,
        task: sessionData.title || 'Untitled Task',
        createdAt: sessionData.created_at || new Date().toISOString(),
        metadata: {
          session_id: sessionData.id,
          status: 'running',
          created_at: sessionData.created_at,
          updated_at: sessionData.updated_at,
          message_count: sessionData.message_count,
          userId,
        },
      });
    }

    console.log(`📝 Processed event: ${event.type} (${sessionId || 'no-session'})`);
  } catch (error) {
    console.error('Error processing event:', error);
  }
}

/**
 * Mock event subscription for testing
 * In real implementation, this would connect to actual opencode event stream
 */
export async function startMockEventGeneration() {
  console.log('🎭 Starting mock event generation for testing...');

  // Generate some sample events
  const sampleEvents: OpenCodeEvent[] = [
    {
      type: 'session.created',
      properties: {
        session: {
          id: 'test-session-1',
          title: 'Test Session: Build React Component',
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          updated_at: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
          message_count: 5,
          is_agent_task: true,
        },
        userId: 'test-user-1',
      },
    },
    {
      type: 'message.created',
      properties: {
        message: {
          info: { id: 'msg-1' },
          session_id: 'test-session-1',
          parts: [
            { type: 'text', text: 'I need to build a React component for user authentication' },
          ],
          role: 'user',
          created_at: new Date(Date.now() - 3000000).toISOString(), // 50 min ago
        },
        userId: 'test-user-1',
      },
    },
    {
      type: 'message.created',
      properties: {
        message: {
          info: { id: 'msg-2' },
          session_id: 'test-session-1',
          parts: [
            {
              type: 'text',
              text: "I'll help you build a React authentication component with login form and state management.",
            },
          ],
          role: 'assistant',
          created_at: new Date(Date.now() - 2400000).toISOString(), // 40 min ago
        },
        userId: 'assistant-1',
      },
    },
    {
      type: 'tool.execute',
      properties: {
        tool: {
          name: 'write',
          args: { filePath: '/src/components/AuthForm.tsx', content: 'React component code...' },
          result: 'Successfully created AuthForm.tsx',
        },
        userId: 'assistant-1',
      },
    },
    {
      type: 'session.updated',
      properties: {
        session: {
          id: 'test-session-1',
          title: 'Test Session: Build React Component',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date(Date.now() - 600000).toISOString(), // 10 min ago
          message_count: 8,
          is_agent_task: true,
        },
        userId: 'test-user-1',
      },
    },
  ];

  // Process events with delays to simulate real-time
  for (let i = 0; i < sampleEvents.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
    const event = sampleEvents[i];
    if (event) {
      await processEvent(event);
    }
  }

  console.log('✅ Mock event generation completed');
}

/**
 * Get store managers for external access
 */
export function getStores() {
  return {
    sessionMessagesStore,
    agentTasksStore,
    opencodeEventsStore,
  };
}
