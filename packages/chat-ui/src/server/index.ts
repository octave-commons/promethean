import express from 'express';
import cors from 'cors';
import { ContextStore } from '@promethean/persistence/src/contextStore.js';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// Get all sessions
app.get('/api/sessions', (req, res) => {
  try {
    res.json(mockSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get specific session
app.get('/api/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = mockSessions.find((s) => s.id === sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Get messages for a session
app.get('/api/sessions/:sessionId/messages', (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = mockMessages[sessionId] || [];
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Delete a session
app.delete('/api/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const index = mockSessions.findIndex((s) => s.id === sessionId);

    if (index === -1) {
      return res.status(404).json({ error: 'Session not found' });
    }

    mockSessions.splice(index, 1);
    delete mockMessages[sessionId];

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// Delete a message
app.delete('/api/sessions/:sessionId/messages/:messageId', (req, res) => {
  try {
    const { sessionId, messageId } = req.params;
    const messages = mockMessages[sessionId];

    if (!messages) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const messageIndex = messages.findIndex((m) => m.id === messageId);

    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }

    messages.splice(messageIndex, 1);

    // Update message count
    const session = mockSessions.find((s) => s.id === sessionId);
    if (session) {
      session.message_count = messages.length;
    }

    res.json({ success: true });
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
