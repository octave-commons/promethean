import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import type { SystemMetrics, MCPTool, MCPToolExecution, ContextCompilation } from '@/types'
import { apiClient } from '@/services/api'

interface SystemState {
  metrics: SystemMetrics | null
  tools: MCPTool[]
  toolExecutions: MCPToolExecution[]
  contexts: ContextCompilation[]
  health: { status: 'healthy' | 'degraded' | 'down'; details: any } | null
  loading: boolean
  error: string | null

  // Actions
  fetchMetrics: () => Promise<void>
  fetchTools: () => Promise<void>
  fetchToolExecutions: () => Promise<void>
  fetchContexts: () => Promise<void>
  fetchHealth: () => Promise<void>
  executeTool: (toolName: string, args: Record<string, unknown>) => Promise<void>
  compileContext: (sources: string[], text: string) => Promise<void>
  refreshAll: () => Promise<void>
  clearError: () => void
}

export const useSystemStore = create<SystemState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      metrics: null,
      tools: [],
      toolExecutions: [],
      contexts: [],
      health: null,
      loading: false,
      error: null,

      fetchMetrics: async () => {
        try {
          const metrics = await apiClient.getSystemMetrics()
          set({ metrics })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch metrics'
          })
        }
      },

      fetchTools: async () => {
        try {
          const tools = await apiClient.getMCPTools()
          set({ tools })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch tools'
          })
        }
      },

      fetchToolExecutions: async () => {
        try {
          const executions = await apiClient.getMCPToolExecutions()
          set({ toolExecutions: executions })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch tool executions'
          })
        }
      },

      fetchContexts: async () => {
        try {
          const contexts = await apiClient.getContexts()
          set({ contexts })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch contexts'
          })
        }
      },

      fetchHealth: async () => {
        try {
          const health = await apiClient.getSystemHealth()
          set({ health })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch health status'
          })
        }
      },

      executeTool: async (toolName: string, args) => {
        set({ loading: true, error: null })
        try {
          const execution = await apiClient.executeMCPTool(toolName, args)
          set(state => ({
            toolExecutions: [execution, ...state.toolExecutions].slice(0, 100), // Keep last 100
            loading: false
          }))
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to execute tool',
            loading: false
          })
        }
      },

      compileContext: async (sources: string[], text: string) => {
        set({ loading: true, error: null })
        try {
          const compilation = await apiClient.compileContext(sources, text)
          set(state => ({
            contexts: [compilation, ...state.contexts],
            loading: false
          }))
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to compile context',
            loading: false
          })
        }
      },

      refreshAll: async () => {
        set({ loading: true, error: null })
        try {
          await Promise.all([
            get().fetchMetrics(),
            get().fetchTools(),
            get().fetchToolExecutions(),
            get().fetchContexts(),
            get().fetchHealth(),
          ])
          set({ loading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to refresh system data',
            loading: false
          })
        }
      },

      clearError: () => {
        set({ error: null })
      },
    })),
    { name: 'system-store' }
  )
)