import type { 
  ActorWithStatus, 
  LLMActor, 
  ChatMessage, 
  MCPTool, 
  MCPToolExecution,
  ContextCompilation,
  SystemMetrics 
} from '@/types'

// Mock data for development and testing
export const mockActors: ActorWithStatus[] = [
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

export const mockLLMMessages: Record<string, ChatMessage[]> = {
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

export const mockMCPTools: MCPTool[] = [
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
  {
    name: 'compile_context',
    description: 'Compile context from various sources',
    inputSchema: {
      type: 'object',
      properties: {
        sources: { type: 'array', items: { type: 'string' }, description: 'List of context sources' },
        text: { type: 'string', description: 'Text to compile into context' },
      },
      required: ['sources'],
    },
    category: 'context',
    enabled: true,
  },
]

export const mockToolExecutions: MCPToolExecution[] = [
  {
    id: 'exec-1',
    toolName: 'create_actor',
    args: { name: 'Test Actor', type: 'llm' },
    result: { actorId: 'actor-3', status: 'created' },
    success: true,
    timestamp: Date.now() - 1000 * 60 * 5,
    duration: 250,
  },
  {
    id: 'exec-2',
    toolName: 'tick_actor',
    args: { actorId: 'actor-1' },
    result: { actorId: 'actor-1', ticked: true },
    success: true,
    timestamp: Date.now() - 1000 * 60 * 2,
    duration: 120,
  },
]

export const mockContexts: ContextCompilation[] = [
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

export const mockSystemMetrics: SystemMetrics = {
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

// Mock API functions for development
export const mockAPI = {
  getActors: () => Promise.resolve(mockActors),
  getActor: (id: string) => Promise.resolve(mockActors.find(a => a.id === id)),
  createActor: (config: any) => Promise.resolve({
    id: `actor-${Date.now()}`,
    config,
    state: {},
    lastTick: Date.now(),
    status: 'idle' as const,
    lastActivity: Date.now(),
    messageCount: 0,
  }),
  updateActor: (id: string, config: any) => Promise.resolve({
    id,
    config,
    state: {},
    lastTick: Date.now(),
    status: 'idle' as const,
    lastActivity: Date.now(),
    messageCount: 0,
  }),
  deleteActor: (id: string) => Promise.resolve(),
  tickActor: (id: string) => Promise.resolve(),
  
  getLLMMessages: (actorId: string) => Promise.resolve(mockLLMMessages[actorId] || []),
  sendLLMMessage: (actorId: string, content: string) => Promise.resolve({
    id: `msg-${Date.now()}`,
    role: 'assistant' as const,
    content: `Mock response to: ${content}`,
    timestamp: Date.now(),
  }),
  clearLLMMessages: (actorId: string) => Promise.resolve(),
  
  getContexts: () => Promise.resolve(mockContexts),
  compileContext: (sources: string[], text: string) => Promise.resolve({
    id: `ctx-${Date.now()}`,
    sources,
    text,
    compiled: { processed: true },
    timestamp: Date.now(),
    status: 'completed' as const,
    metrics: {
      processingTime: Math.random() * 500,
      sourceCount: sources.length,
      textSize: text.length,
    },
  }),
  
  getMCPTools: () => Promise.resolve(mockMCPTools),
  executeMCPTool: (toolName: string, args: any) => Promise.resolve({
    id: `exec-${Date.now()}`,
    toolName,
    args,
    result: { success: true },
    success: true,
    timestamp: Date.now(),
    duration: Math.random() * 1000,
  }),
  getMCPToolExecutions: () => Promise.resolve(mockToolExecutions),
  
  getSystemMetrics: () => Promise.resolve(mockSystemMetrics),
  getSystemHealth: () => Promise.resolve({
    status: 'healthy' as const,
    details: { uptime: 86400 },
  }),
}