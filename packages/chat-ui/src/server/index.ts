import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { ContextStore, DualStoreManager } from '@promethean/persistence';

const app = express();
const PORT = parseInt(process.env.PORT || '3002', 10);
const AGENT_NAME = 'duck';

// Collection names - must match opencode-client exactly
const SESSION_STORE_NAME = 'sessionStore';
const EVENT_STORE_NAME = 'eventStore';
const MESSAGE_STORE_NAME = 'messageStore';

// Initialize ContextStore with AGENT_NAME
const contextStore = new ContextStore((ms) => new Date(ms).toISOString(), AGENT_NAME);

// Store access proxies using ContextStore - same pattern as opencode-client
const createStoreProxy = (storeName: string): DualStoreManager<'text', 'timestamp'> => {
  return new Proxy({} as DualStoreManager<'text', 'timestamp'>, {
    get(_, prop) {
      const collection = contextStore.getCollection(storeName);
      const typedCollection = collection as DualStoreManager<'text', 'timestamp'>;
      return typedCollection[prop as keyof DualStoreManager<'text', 'timestamp'>];
    },
  });
};

// Create store proxies - same as opencode-client
const sessionStore = createStoreProxy(SESSION_STORE_NAME);
const eventStore = createStoreProxy(EVENT_STORE_NAME);
const messageStore = createStoreProxy(MESSAGE_STORE_NAME);

// Initialize stores - same as opencode-client
let storesInitialized = false;
const ensureStores = async () => {
  if (!storesInitialized) {
    try {
      await contextStore.createCollection(SESSION_STORE_NAME, 'text', 'timestamp');
      await contextStore.createCollection(EVENT_STORE_NAME, 'text', 'timestamp');
      await contextStore.createCollection(MESSAGE_STORE_NAME, 'text', 'timestamp');
      storesInitialized = true;
      console.log(
        '✅ Initialized ContextStore collections: sessionStore, eventStore, messageStore',
      );
    } catch (error) {
      console.error('Error creating collections:', error);
      // Collections might already exist, try to get them
      try {
        contextStore.getCollection(SESSION_STORE_NAME);
        contextStore.getCollection(EVENT_STORE_NAME);
        contextStore.getCollection(MESSAGE_STORE_NAME);
        storesInitialized = true;
        console.log('✅ Connected to existing ContextStore collections');
      } catch (getError) {
        console.error('Failed to connect to collections:', getError);
        throw getError;
      }
    }
  }
};

// Session data interfaces - same as opencode-client
interface SessionData {
  id: string;
  title?: string;
  createdAt: number;
  updatedAt: number;
  lastActivity: number;
  status: string;
  time?: {
    created?: string;
    updated?: string;
  };
  activityStatus?: string;
  isAgentTask?: boolean;
  task?: string;
  completionMessage?: string;
  messages?: unknown[];
  agentTaskStatus?: string;
  lastActivityTime?: number;
}

interface StoreSession {
  id?: string;
  text: string;
  timestamp?: number | string | Date;
  [key: string]: unknown;
}

// Parse session data - same as opencode-client
function parseSessionData(session: StoreSession): SessionData {
  try {
    return JSON.parse(session.text);
  } catch (error) {
    // Handle legacy plain text format
    const text = session.text;
    const sessionMatch = text.match(/Session:\s*(\w+)/);
    if (sessionMatch) {
      return {
        id: sessionMatch[1] || 'unknown',
        title: `Session ${sessionMatch[1]}`,
        createdAt: typeof session.timestamp === 'number' ? session.timestamp : Date.now(),
        updatedAt: typeof session.timestamp === 'number' ? session.timestamp : Date.now(),
        lastActivity: typeof session.timestamp === 'number' ? session.timestamp : Date.now(),
        status: 'unknown',
        time: {
          created: new Date(session.timestamp || Date.now()).toISOString(),
        },
      };
    }
    // Fallback
    return {
      id: session.id?.toString() || 'unknown',
      title: 'Legacy Session',
      createdAt: typeof session.timestamp === 'number' ? session.timestamp : Date.now(),
      updatedAt: typeof session.timestamp === 'number' ? session.timestamp : Date.now(),
      lastActivity: typeof session.timestamp === 'number' ? session.timestamp : Date.now(),
      status: 'unknown',
      time: {
        created: new Date(session.timestamp || Date.now()).toISOString(),
      },
    };
  }
}

// Convert sessions to chat UI format
function sessionsToChatUIFormat(sessions: SessionData[]): any[] {
  return sessions.map((session) => ({
    id: session.id,
    title: session.title || `Session ${session.id}`,
    created_at: session.createdAt || Date.now(),
    message_count: session.messages?.length || 0,
    activityStatus: session.activityStatus || 'idle',
    isAgentTask: session.isAgentTask || false,
    agentTaskStatus: session.agentTaskStatus,
  }));
}

// Convert messages to chat UI format
function messagesToChatUIFormat(messages: any[]): any[] {
  return messages.map((message, index) => ({
    id: message.id || `msg-${index}`,
    role: message.role || 'user',
    content: message.content || message.text || '',
    created_at: message.timestamp || message.created_at || Date.now(),
  }));
}

// Middleware
app.use(cors());
app.use(express.json());

// Debug route
app.get('/api/debug', (req, res) => {
  res.json({
    cwd: process.cwd(),
    publicPath: require('path').join(process.cwd(), 'public'),
    publicExists: require('fs').existsSync(require('path').join(process.cwd(), 'public')),
    indexExists: require('fs').existsSync(
      require('path').join(process.cwd(), 'public', 'index.html'),
    ),
  });
});

// Debug route
app.get('/api/debug', (req, res) => {
  const publicPath = path.join(process.cwd(), 'public');
  res.json({
    cwd: process.cwd(),
    publicPath,
    publicExists: fs.existsSync(publicPath),
    indexExists: fs.existsSync(path.join(publicPath, 'index.html')),
    publicFiles: fs.existsSync(publicPath) ? fs.readdirSync(publicPath) : [],
  });
});

// API Routes

// Get all sessions - using real sessionStore data
app.get('/api/sessions', async (req, res) => {
  try {
    await ensureStores();

    // Get sessions from sessionStore - same as opencode-client
    const storedSessions = await sessionStore.getMostRecent(100);

    if (!storedSessions?.length) {
      return res.json([]);
    }

    // Parse sessions - same as opencode-client
    const parsedSessions = storedSessions.map((session) => parseSessionData(session));

    // Sort by creation time (most recent first)
    const sortedSessions = [...parsedSessions].sort((a, b) => {
      const aTime = a.createdAt || a.time?.created || '';
      const bTime = b.createdAt || b.time?.created || '';

      if (aTime && bTime && typeof aTime === 'string' && typeof bTime === 'string') {
        return bTime.localeCompare(aTime);
      }

      const aId = a.id || '';
      const bId = b.id || '';
      return bId.localeCompare(aId);
    });

    // Get message counts for each session
    const sessionsWithCounts = await Promise.all(
      sortedSessions.map(async (session) => {
        try {
          // Look for messages in sessionStore with key pattern
          const messageKey = `session:${session.id}:messages`;
          const allStored = await sessionStore.getMostRecent(100);
          const messageEntry = allStored.find((entry) => entry.id === messageKey);
          let messages: unknown[] = [];
          if (messageEntry) {
            messages = JSON.parse(messageEntry.text);
          }

          return {
            ...session,
            message_count: messages.length,
          };
        } catch (error) {
          console.error(`Error getting message count for session ${session.id}:`, error);
          return {
            ...session,
            message_count: 0,
          };
        }
      }),
    );

    // Convert to chat UI format
    const chatUISessions = sessionsToChatUIFormat(sessionsWithCounts);
    res.json(chatUISessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get specific session
app.get('/api/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await ensureStores();

    // Look for session in sessionStore
    const allStored = await sessionStore.getMostRecent(100);
    const sessionEntry = allStored.find((entry) => {
      try {
        const sessionData = JSON.parse(entry.text);
        return sessionData.id === sessionId;
      } catch {
        return false;
      }
    });

    if (!sessionEntry) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const sessionData = parseSessionData(sessionEntry);
    const chatUISession = sessionsToChatUIFormat([sessionData])[0];
    res.json(chatUISession);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Get messages for a session - using real messageStore data
app.get('/api/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await ensureStores();

    // Look for messages in sessionStore with the standard key pattern
    const messageKey = `session:${sessionId}:messages`;
    const allStored = await sessionStore.getMostRecent(100);
    const messageEntry = allStored.find((entry) => entry.id === messageKey);

    let messages: unknown[] = [];
    if (messageEntry) {
      try {
        messages = JSON.parse(messageEntry.text);
      } catch (error) {
        console.error('Error parsing messages:', error);
        messages = [];
      }
    }

    // Also check messageStore for any additional messages
    try {
      const messageStoreEntries = await messageStore.getMostRecent(100);
      const sessionMessages = messageStoreEntries.filter(
        (entry) => entry.metadata?.sessionID === sessionId,
      );

      // Combine messages from both sources
      const allMessages = [
        ...messages,
        ...sessionMessages.map((entry) => ({
          id: entry.id,
          role: entry.metadata?.userName === AGENT_NAME ? 'assistant' : 'user',
          content: entry.text,
          timestamp: entry.timestamp,
        })),
      ];

      const chatUIMessages = messagesToChatUIFormat(allMessages);
      res.json(chatUIMessages);
    } catch (error) {
      console.error('Error fetching from messageStore:', error);
      // Fallback to just sessionStore messages
      const chatUIMessages = messagesToChatUIFormat(messages);
      res.json(chatUIMessages);
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Delete a session (not implemented for ContextStore - read-only)
app.delete('/api/sessions/:sessionId', (req, res) => {
  try {
    res.status(501).json({ error: 'Delete operation not supported for ContextStore' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// Delete a message (not implemented for ContextStore - read-only)
app.delete('/api/sessions/:sessionId/messages/:messageId', (req, res) => {
  try {
    res.status(501).json({ error: 'Delete operation not supported for ContextStore' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Serve static files
app.use(express.static(path.join(process.cwd(), 'public')));

// Serve index.html for root route
app.get('/', (req, res) => {
  const indexPath = path.join(process.cwd(), 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Index file not found');
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Chat UI server running on port ${PORT}`);
  console.log(`Frontend available at: http://localhost:${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
});
