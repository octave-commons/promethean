import React, { createContext, useContext, useEffect, useState } from 'react';

interface WebSocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  messages: any[];
  sendMessage: (message: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/ws');

    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = (message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    }
  };

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, messages, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};
