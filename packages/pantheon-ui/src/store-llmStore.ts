import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { LLMActor, ChatMessage } from '@/types'
import { apiClient } from '@/services/api'

interface LLMState {
  messages: Record<string, ChatMessage[]>
  loading: boolean
  sending: boolean
  error: string | null

  // Actions
  fetchMessages: (actorId: string) => Promise<void>
  sendMessage: (actorId: string, content: string) => Promise<void>
  clearMessages: (actorId: string) => Promise<void>
  addMessage: (actorId: string, message: ChatMessage) => void
  clearError: () => void
}

export const useLLMStore = create<LLMState>()(
  devtools((set, get) => ({
    messages: {},
    loading: false,
    sending: false,
    error: null,

    fetchMessages: async (actorId: string) => {
      set({ loading: true, error: null })
      try {
        const messages = await apiClient.getLLMMessages(actorId)
        set(state => ({
          messages: { ...state.messages, [actorId]: messages },
          loading: false
        }))
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch messages',
          loading: false 
        })
      }
    },

    sendMessage: async (actorId: string, content: string) => {
      set({ sending: true, error: null })
      try {
        // Add user message immediately for better UX
        const userMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          role: 'user',
          content,
          timestamp: Date.now(),
        }
        
        set(state => ({
          messages: {
            ...state.messages,
            [actorId]: [...(state.messages[actorId] || []), userMessage]
          }
        }))

        const response = await apiClient.sendLLMMessage(actorId, content)
        
        // Replace temp message with real one and add response
        set(state => {
          const currentMessages = state.messages[actorId] || []
          const filteredMessages = currentMessages.filter(msg => msg.id !== userMessage.id)
          
          return {
            messages: {
              ...state.messages,
              [actorId]: [...filteredMessages, response]
            },
            sending: false
          }
        })
      } catch (error) {
        // Remove temp message on error
        set(state => {
          const currentMessages = state.messages[actorId] || []
          const filteredMessages = currentMessages.filter(msg => msg.id !== `temp-${Date.now()}`)
          
          return {
            messages: {
              ...state.messages,
              [actorId]: filteredMessages
            },
            error: error instanceof Error ? error.message : 'Failed to send message',
            sending: false
          }
        })
      }
    },

    clearMessages: async (actorId: string) => {
      try {
        await apiClient.clearLLMMessages(actorId)
        set(state => ({
          messages: { ...state.messages, [actorId]: [] }
        }))
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to clear messages'
        })
      }
    },

    addMessage: (actorId: string, message: ChatMessage) => {
      set(state => ({
        messages: {
          ...state.messages,
          [actorId]: [...(state.messages[actorId] || []), message]
        }
      }))
    },

    clearError: () => {
      set({ error: null })
    },
  }), { name: 'llm-store' })
)