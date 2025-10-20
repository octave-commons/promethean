// Re-export from pantheon core
export type { Actor, ActorConfig, Context, Message } from '@promethean/pantheon'

// Extended types for UI
export interface ActorWithStatus extends Actor {
  status: 'active' | 'idle' | 'error' | 'processing'
  lastActivity: number
  messageCount: number
  errors?: string[]
}

export interface LLMActor extends ActorWithStatus {
  type: 'llm'
  config: LLMActorConfig
  messages: ChatMessage[]
  model: string
  systemPrompt: string
}

export interface LLMActorConfig extends ActorConfig {
  llm: any // OpenAI adapter
  systemPrompt: string
  maxMessages: number
  model: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  metadata?: Record<string, unknown>
}

export interface MCPTool {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, any>
    required?: string[]
  }
  category?: string
  enabled: boolean
}

export interface MCPToolExecution {
  id: string
  toolName: string
  args: Record<string, unknown>
  result: any
  success: boolean
  error?: string
  timestamp: number
  duration: number
}

export interface ContextSource {
  id: string
  name: string
  type: 'file' | 'directory' | 'url' | 'database'
  path: string
  lastModified: number
  size: number
  enabled: boolean
}

export interface ContextCompilation {
  id: string
  sources: string[]
  text: string
  compiled: unknown
  timestamp: number
  status: 'pending' | 'compiling' | 'completed' | 'error'
  error?: string
  metrics?: {
    processingTime: number
    sourceCount: number
    textSize: number
  }
}

export interface SystemMetrics {
  totalActors: number
  activeActors: number
  totalMessages: number
  totalToolExecutions: number
  averageResponseTime: number
  errorRate: number
  uptime: number
  memoryUsage: number
  cpuUsage: number
}

export interface DashboardWidget {
  id: string
  type: 'metric' | 'chart' | 'table' | 'list'
  title: string
  size: 'small' | 'medium' | 'large'
  position: { x: number; y: number }
  data: any
  config?: Record<string, unknown>
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: number
  read: boolean
  actions?: Array<{
    label: string
    action: string
  }>
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  notifications: {
    enabled: boolean
    types: Array<'info' | 'success' | 'warning' | 'error'>
  }
  dashboard: {
    layout: DashboardWidget[]
    refreshInterval: number
  }
  api: {
    baseUrl: string
    timeout: number
  }
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: number
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface WebSocketMessage {
  type: string
  payload: any
  timestamp: number
}

export interface ActorEvent extends WebSocketMessage {
  type: 'actor:created' | 'actor:updated' | 'actor:deleted' | 'actor:ticked' | 'actor:message'
  actorId: string
  data: any
}

export interface SystemEvent extends WebSocketMessage {
  type: 'system:metrics' | 'system:error' | 'system:notification'
  data: any
}