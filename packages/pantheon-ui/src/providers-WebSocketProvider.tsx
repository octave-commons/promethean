import React, { createContext, useContext, useEffect, useState } from 'react'
import { wsService } from '@/services/websocket'
import { useActorsStore } from '@/store/actorsStore'
import { useLLMStore } from '@/store/llmStore'
import { useSystemStore } from '@/store/systemStore'
import type { ActorEvent, SystemEvent } from '@/types'

interface WebSocketContextType {
  connected: boolean
  reconnect: () => Promise<void>
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider')
  }
  return context
}

interface WebSocketProviderProps {
  children: React.ReactNode
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [connected, setConnected] = useState(false)
  const updateActorStatus = useActorsStore(state => state.updateActorStatus)
  const addMessage = useLLMStore(state => state.addMessage)

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await wsService.connect()
        setConnected(true)

        // Subscribe to actor events
        wsService.onActorEvent((event: ActorEvent) => {
          switch (event.type) {
            case 'actor:created':
            case 'actor:updated':
              updateActorStatus(event.actorId, event.data)
              break
            case 'actor:ticked':
              updateActorStatus(event.actorId, {
                lastTick: event.data.timestamp,
                status: 'idle'
              })
              break
            case 'actor:message':
              if (event.data.role === 'assistant') {
                addMessage(event.actorId, event.data)
              }
              break
            case 'actor:deleted':
              // Handle actor deletion - this would need to be implemented in the store
              break
          }
        })

        // Subscribe to system events
        wsService.onSystemEvent((event: SystemEvent) => {
          switch (event.type) {
            case 'system:metrics':
              // Update metrics in system store
              break
            case 'system:error':
              console.error('System error:', event.data)
              break
            case 'system:notification':
              // Handle system notifications
              break
          }
        })

      } catch (error) {
        console.error('Failed to connect WebSocket:', error)
        setConnected(false)
      }
    }

    connectWebSocket()

    return () => {
      wsService.disconnect()
      setConnected(false)
    }
  }, [updateActorStatus, addMessage])

  const reconnect = async () => {
    try {
      await wsService.disconnect()
      await wsService.connect()
      setConnected(true)
    } catch (error) {
      console.error('Failed to reconnect WebSocket:', error)
      setConnected(false)
    }
  }

  return (
    <WebSocketContext.Provider value={{ connected, reconnect }}>
      {children}
    </WebSocketContext.Provider>
  )
}