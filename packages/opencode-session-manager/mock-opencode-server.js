#!/usr/bin/env node

// Mock OpenCode Server for testing session manager
import http from 'http';
import { URL } from 'url';

// Mock data store
let sessions = [
  {
    id: 'session-1',
    title: 'Project Setup',
    description: 'Initial project configuration and setup',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: { name: 'active' },
    messages: [],
  },
  {
    id: 'session-2',
    title: 'Feature Development',
    description: 'Working on new feature implementation',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    status: { name: 'active' },
    messages: [],
  },
];

let nextId = 3;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Parse request body
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

// Send JSON response
function sendJson(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    ...corsHeaders,
  });
  res.end(JSON.stringify(data, null, 2));
}

// Send error response
function sendError(res, message, status = 400) {
  sendJson(res, { error: message }, status);
}

// Route handler
async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:4096`);
  const method = req.method;
  const path = url.pathname;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  console.log(`${method} ${path}`);

  try {
    // Session routes
    if (path === '/api/v1/sessions' || path === '/sessions') {
      if (method === 'GET') {
        sendJson(res, { sessions });
      } else if (method === 'POST') {
        const body = await parseBody(req);
        const newSession = {
          id: `session-${nextId++}`,
          title: body.title || 'New Session',
          description: body.description || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: { name: 'active' },
          messages: [],
        };
        sessions.push(newSession);
        sendJson(res, newSession, 201);
      } else {
        sendError(res, 'Method not allowed', 405);
      }
    } else if (
      path.startsWith('/sessions/') ||
      path.startsWith('/api/v1/sessions/')
    ) {
      const sessionId = path.split('/').pop();

      if (method === 'GET') {
        const session = sessions.find((s) => s.id === sessionId);
        if (session) {
          sendJson(res, session);
        } else {
          sendError(res, 'Session not found', 404);
        }
      } else if (method === 'DELETE') {
        const index = sessions.findIndex((s) => s.id === sessionId);
        if (index !== -1) {
          const deleted = sessions.splice(index, 1)[0];
          sendJson(res, { deleted: true, session: deleted });
        } else {
          sendError(res, 'Session not found', 404);
        }
      } else if (method === 'POST') {
        const session = sessions.find((s) => s.id === sessionId);
        if (session) {
          const body = await parseBody(req);
          if (body.prompt) {
            session.messages.push({
              id: `msg-${Date.now()}`,
              type: 'user',
              content: body.prompt,
              timestamp: new Date().toISOString(),
            });

            // Simulate AI response
            setTimeout(() => {
              session.messages.push({
                id: `msg-${Date.now() + 1}`,
                type: 'assistant',
                content: `This is a mock response to: "${body.prompt}"`,
                timestamp: new Date().toISOString(),
              });
            }, 1000);

            session.updatedAt = new Date().toISOString();
            sendJson(res, { success: true, message: 'Prompt sent' });
          } else {
            sendError(res, 'Prompt is required');
          }
        } else {
          sendError(res, 'Session not found', 404);
        }
      } else {
        sendError(res, 'Method not allowed', 405);
      }
    } else if (
      path === '/api/v1/sessions/' + path.split('/')[3] + '/messages' ||
      path === '/sessions/' + path.split('/')[2] + '/messages'
    ) {
      const sessionId =
        path.split('/')[path.split('/').indexOf('sessions') + 1];
      const session = sessions.find((s) => s.id === sessionId);

      if (method === 'GET') {
        if (session) {
          sendJson(res, { messages: session.messages });
        } else {
          sendError(res, 'Session not found', 404);
        }
      } else {
        sendError(res, 'Method not allowed', 405);
      }
    } else if (path === '/' || path === '/api' || path === '/api/v1') {
      sendJson(res, {
        name: 'Mock OpenCode Server',
        version: '1.0.0',
        endpoints: [
          'GET /api/v1/sessions',
          'POST /api/v1/sessions',
          'GET /api/v1/sessions/:id',
          'DELETE /api/v1/sessions/:id',
          'POST /api/v1/sessions/:id (send prompt)',
          'GET /api/v1/sessions/:id/messages',
        ],
      });
    } else {
      sendError(res, 'Not found', 404);
    }
  } catch (error) {
    console.error('Server error:', error);
    sendError(res, 'Internal server error', 500);
  }
}

// Create server
const server = http.createServer(handleRequest);

const PORT = 4096;
server.listen(PORT, () => {
  console.log(`🚀 Mock OpenCode Server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET    /api/v1/sessions        - List all sessions`);
  console.log(`  POST   /api/v1/sessions        - Create new session`);
  console.log(`  GET    /api/v1/sessions/:id     - Get session details`);
  console.log(`  DELETE /api/v1/sessions/:id     - Delete session`);
  console.log(`  POST   /api/v1/sessions/:id     - Send prompt to session`);
  console.log(`  GET    /api/v1/sessions/:id/messages - Get session messages`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down mock server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
