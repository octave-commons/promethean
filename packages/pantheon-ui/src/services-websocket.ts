import { io, Socket } from 'socket.io-client'
import type { ActorEvent, SystemEvent, WebSocketMessage } from '@/types'

class WebSocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect(url: string = '/ws'): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(url, {
        transports: ['websocket'],
        upgrade: false,
      })

      this.socket.on('connect', () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        resolve()
      })

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason)
        this.handleReconnect()
      })

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error)
        reject(error)
      })
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.socket?.connect()
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts))
    }
  }

  // Event subscription methods
  onActorEvent(callback: (event: ActorEvent) => void): void {
    this.socket?.on('actor:event', callback)
  }

  onSystemEvent(callback: (event: SystemEvent) => void): void {
    this.socket?.on('system:event', callback)
  }

  onMessage(callback: (message: WebSocketMessage) => void): void {
    this.socket?.on('message', callback)
  }

  // Event unsubscription methods
  offActorEvent(callback: (event: ActorEvent) => void): void {
    this.socket?.off('actor:event', callback)
  }

  offSystemEvent(callback: (event: SystemEvent) => void): void {
    this.socket?.off('system:event', callback)
  }

  offMessage(callback: (message: WebSocketMessage) => void): void {
    this.socket?.off('message', callback)
  }

  // Send messages
  send(type: string, payload: any): void {
    this.socket?.emit('message', { type, payload, timestamp: Date.now() })
  }

  // Connection status
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getSocket(): Socket | null {
    return this.socket
  }
}

// Create singleton instance
export const wsService = new WebSocketService()

export default wsService