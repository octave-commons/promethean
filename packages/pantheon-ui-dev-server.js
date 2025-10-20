#!/usr/bin/env node

/**
 * Development server for Pantheon UI with mock data
 * This allows the UI to run independently for development and testing
 */

const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const { Server } = require('socket.io')

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Mock data
const mockActors = [
  {
    id: 'actor-1',
    config: {
      name: 'Assistant Bot',
      type: 'llm',
      parameters: { model: 'gpt-3.5-turbo' },
    },
    state: {},
    lastTick: Date.now() - 1000 * 60 * 5,
    status: 'active',
    lastActivity: Date.now() - 1000 * 60 * 2,
    messageCount: 25,
  },
  {
    id: 'actor-2',
    config: {
      name: 'Data Processor',
      type: 'tool',
      parameters: { tool: 'data-processor' },
    },
    state: {},
    lastTick: Date.now() - 1000 * 60 * 15,
    status: 'idle',
    lastActivity: Date.now() - 1000 * 60 * 10,
    messageCount: 0,
  },
]

const mockMessages = {
  'actor-1': [
    {
      id: 'msg-1',
      role: 'system',
      content: 'You are a helpful AI assistant.',
      timestamp: Date.now() - 1000 * 60 * 10,
    },
    {
      id: 'msg-2',
      role: 'user',
      content: 'Hello, how are you?',
      timestamp: Date.now() - 1000 * 60 * 8,
    },
    {
      id: 'msg-3',
      role: 'assistant',
      content: 'Hello! I\'m doing well, thank you for asking. How can I help you today?',
      timestamp: Date.now() - 1000 * 60 * 7,
    },
  ],
}

const mockTools = [
  {
    name: 'create_actor',
    description: 'Create a new actor in the Pantheon system',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the actor' },
        type: { type: 'string', description: 'Type of actor' },
        config: { type: 'object', description: 'Configuration object' },
      },
      required: ['name', 'type'],
    },
    category: 'actors',
    enabled: true,
  },
  {
    name: 'tick_actor',
    description: 'Execute a tick on an actor',
    inputSchema: {
      type: 'object',
      properties: {
        actorId: { type: 'string', description: 'ID of the actor to tick' },
      },
      required: ['actorId'],
    },
    category: 'actors',
    enabled: true,
  },
]

const mockExecutions = [
  {
    id: 'exec-1',
    toolName: 'create_actor',
    args: { name: 'Test Actor', type: 'llm' },
    result: { actorId: 'actor-3', status: 'created' },
    success: true,
    timestamp: Date.now() - 1000 * 60 * 5,
    duration: 250,
  },
]

const mockContexts = [
  {
    id: 'ctx-1',
    sources: ['sessions', 'agent-tasks'],
    text: 'Sample context text for compilation',
    compiled: { processed: true },
    timestamp: Date.now() - 1000 * 60 * 30,
    status: 'completed',
    metrics: {
      processingTime: 150,
      sourceCount: 2,
      textSize: 25,
    },
  },
]

const mockMetrics = {
  totalActors: 2,
  activeActors: 1,
  totalMessages: 25,
  totalToolExecutions: 15,
  averageResponseTime: 185,
  errorRate: 0.02,
  uptime: 86400,
  memoryUsage: 512,
  cpuUsage: 25,
}

// Middleware
app.use(cors())
app.use(express.json())

// API Routes
app.get('/api/actors', (req, res) => {
  res.json({ success: true, data: mockActors, timestamp: Date.now() })
})

app.get('/api/actors/:id', (req, res) => {
  const actor = mockActors.find(a => a.id === req.params.id)
  if (actor) {
    res.json({ success: true, data: actor, timestamp: Date.now() })
  } else {
    res.status(404).json({ success: false, error: 'Actor not found', timestamp: Date.now() })
  }
})

app.post('/api/actors', (req, res) => {
  const newActor = {
    id: `actor-${Date.now()}`,
    config: req.body,
    state: {},
    lastTick: Date.now(),
    status: 'idle',
    lastActivity: Date.now(),
    messageCount: 0,
  }
  mockActors.push(newActor)
  
  // Emit WebSocket event
  io.emit('actor:event', {
    type: 'actor:created',
    actorId: newActor.id,
    data: newActor,
    timestamp: Date.now(),
  })
  
  res.json({ success: true, data: newActor, timestamp: Date.now() })
})

app.post('/api/actors/:id/tick', (req, res) => {
  const actor = mockActors.find(a => a.id === req.params.id)
  if (actor) {
    actor.lastTick = Date.now()
    actor.status = 'processing'
    
    setTimeout(() => {
      actor.status = 'active'
      io.emit('actor:event', {
        type: 'actor:ticked',
        actorId: actor.id,
        data: { timestamp: Date.now() },
        timestamp: Date.now(),
      })
    }, 1000)
    
    res.json({ success: true, timestamp: Date.now() })
  } else {
    res.status(404).json({ success: false, error: 'Actor not found', timestamp: Date.now() })
  }
})

app.get('/api/actors/:id/messages', (req, res) => {
  const messages = mockMessages[req.params.id] || []
  res.json({ success: true, data: messages, timestamp: Date.now() })
})

app.post('/api/actors/:id/messages', (req, res) => {
  const { content } = req.body
  const actorMessages = mockMessages[req.params.id] || []
  
  const userMessage = {
    id: `msg-${Date.now()}`,
    role: 'user',
    content,
    timestamp: Date.now(),
  }
  
  actorMessages.push(userMessage)
  
  // Simulate AI response
  setTimeout(() => {
    const aiMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: `This is a mock response to: "${content}". In a real implementation, this would be generated by an LLM.`,
      timestamp: Date.now(),
    }
    actorMessages.push(aiMessage)
    
    io.emit('actor:event', {
      type: 'actor:message',
      actorId: req.params.id,
      data: aiMessage,
      timestamp: Date.now(),
    })
  }, 1500)
  
  res.json({ success: true, data: userMessage, timestamp: Date.now() })
})

app.get('/api/tools', (req, res) => {
  res.json({ success: true, data: mockTools, timestamp: Date.now() })
})

app.post('/api/tools/:toolName/execute', (req, res) => {
  const { toolName } = req.params
  const args = req.body
  
  const execution = {
    id: `exec-${Date.now()}`,
    toolName,
    args,
    result: { success: true, executed: true },
    success: true,
    timestamp: Date.now(),
    duration: Math.random() * 1000,
  }
  
  mockExecutions.unshift(execution)
  
  res.json({ success: true, data: execution, timestamp: Date.now() })
})

app.get('/api/tools/executions', (req, res) => {
  res.json({ success: true, data: mockExecutions, timestamp: Date.now() })
})

app.get('/api/contexts', (req, res) => {
  res.json({ success: true, data: mockContexts, timestamp: Date.now() })
})

app.post('/api/contexts/compile', (req, res) => {
  const { sources, text } = req.body
  
  const compilation = {
    id: `ctx-${Date.now()}`,
    sources,
    text,
    compiled: { processed: true },
    timestamp: Date.now(),
    status: 'completed',
    metrics: {
      processingTime: Math.random() * 500,
      sourceCount: sources.length,
      textSize: text.length,
    },
  }
  
  mockContexts.unshift(compilation)
  
  res.json({ success: true, data: compilation, timestamp: Date.now() })
})

app.get('/api/system/metrics', (req, res) => {
  res.json({ success: true, data: mockMetrics, timestamp: Date.now() })
})

app.get('/api/system/health', (req, res) => {
  res.json({ 
    success: true, 
    data: { status: 'healthy', details: { uptime: 86400 } }, 
    timestamp: Date.now() 
  })
})

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected to WebSocket')
  
  socket.on('disconnect', () => {
    console.log('Client disconnected from WebSocket')
  })
  
  // Echo back any messages for testing
  socket.on('message', (data) => {
    console.log('Received message:', data)
    socket.emit('message', data)
  })
})

// Start server
const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
  console.log(`🚀 Pantheon Mock API Server running on port ${PORT}`)
  console.log(`📡 WebSocket server ready`)
  console.log(`🌐 API available at http://localhost:${PORT}/api`)
  console.log(`\nYou can now start the UI with:`)
  console.log(`cd packages/pantheon-ui && pnpm dev`)
})