import express from 'express';
import cors from 'cors';
import { ContextStore } from '@promethean/persistence';

const app = express();
const PORT = process.env.PORT || 3002;
const AGENT_NAME = 'duck';

// Initialize ContextStore
const contextStore = new ContextStore((ms) => new Date(ms).toISOString(), AGENT_NAME);

// Initialize the default collection
let defaultCollection: any = null;

// Helper function to ensure collection is initialized
const ensureCollection = async () => {
  if (!defaultCollection) {
    try {
      defaultCollection = await contextStore.getOrCreateCollection('default');
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  }
  return defaultCollection;
};

// Helper function to convert ContextStore entries to session format
const entriesToSessions = (entries: any[]): any[] => {
  const sessionMap = new Map();

  entries.forEach((entry, index) => {
    const date = new Date(entry.timestamp);
    const dateStr = date.toISOString().split('T')[0];
    const sessionId = `session-${dateStr}`;

    if (!sessionMap.has(sessionId)) {
      sessionMap.set(sessionId, {
        id: sessionId,
        title: `Conversation - ${dateStr}`,
        created_at: date.getTime(),
        message_count: 0,
      });
    }

    const session = sessionMap.get(sessionId);
    session.message_count++;
  });

  return Array.from(sessionMap.values()).sort((a, b) => b.created_at - a.created_at);
};

// Helper function to convert ContextStore entries to messages format
const entriesToMessages = (entries: any[], sessionId: string): any[] => {
  const dateStr = sessionId.replace('session-', '');
  const targetDate = new Date(dateStr);
  const nextDate = new Date(targetDate);
  nextDate.setDate(nextDate.getDate() + 1);

  return entries
    .filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= targetDate && entryDate < nextDate;
    })
    .map((entry, index) => ({
      id: `msg-${sessionId}-${index}`,
      role:
        entry.metadata?.userName === AGENT_NAME
          ? entry.metadata?.isThought
            ? 'system'
            : 'assistant'
          : 'user',
      content: entry.text,
      created_at: new Date(entry.timestamp).getTime(),
    }))
    .sort((a, b) => a.created_at - b.created_at);
};

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// Get all sessions
app.get('/api/sessions', async (req, res) => {
  try {
    await ensureCollection();
    const entries = await contextStore.getLatestDocuments(100);
    const sessions = entriesToSessions(entries);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get specific session
app.get('/api/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const dateStr = sessionId.replace('session-', '');
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      return res.status(404).json({ error: 'Invalid session ID' });
    }

    const session = {
      id: sessionId,
      title: `Conversation - ${dateStr}`,
      created_at: date.getTime(),
      message_count: 0,
    };

    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Get messages for a session
app.get('/api/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await ensureCollection();
    const entries = await contextStore.getLatestDocuments(100);
    const messages = entriesToMessages(entries, sessionId);
    res.json(messages);
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
app.use(express.static('public'));

// Start server
app.listen(PORT, () => {
  console.log(`Chat UI server running on port ${PORT}`);
  console.log(`Frontend available at: http://localhost:${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
});
