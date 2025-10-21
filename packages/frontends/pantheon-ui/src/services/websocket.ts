export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
}

export class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(url: string = 'ws://localhost:8080/ws'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.socket.onclose = () => {
          console.log('WebSocket disconnected');
          this.handleReconnect();
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(message.payload);
        } catch (error) {
          console.error('Error in WebSocket listener:', error);
        }
      });
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(
        () => {
          this.reconnectAttempts++;
          console.log(
            `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
          );
          this.connect();
        },
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      );
    }
  }

  on(type: string, listener: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  off(type: string, listener: (data: any) => void) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  send(type: string, payload: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: Date.now(),
      };
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();
