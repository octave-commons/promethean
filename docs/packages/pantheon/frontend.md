# Pantheon Frontend

## Overview

The Pantheon Frontend is a comprehensive React-based web application that provides a user-friendly interface for managing AI agents, monitoring their activities, and configuring the Pantheon ecosystem. It offers real-time updates, intuitive navigation, and responsive design.

## Key Features

- **React 18**: Modern React with hooks and concurrent features
- **Real-time Updates**: WebSocket integration for live agent monitoring
- **TypeScript**: Full type safety throughout the application
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Query Management**: Efficient data fetching with TanStack Query
- **Component Architecture**: Modular, reusable UI components
- **Routing**: Client-side navigation with React Router

## Application Structure

```
src/pantheon/
├── components/
│   ├── Layout.tsx              # Main application layout
│   └── ui/                     # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       └── input.tsx
├── pages/
│   ├── Dashboard.tsx            # Main dashboard
│   ├── Actors.tsx              # Actor management
│   ├── ActorDetail.tsx          # Individual actor view
│   ├── Context.tsx             # Context management
│   ├── Tools.tsx               # Tool management
│   └── Settings.tsx            # Application settings
├── providers/
│   └── WebSocketProvider.tsx    # WebSocket context provider
├── services/
│   ├── api.ts                  # API service layer
│   ├── websocket.ts            # WebSocket service
│   └── types.ts               # Service types
├── store/
│   ├── actorsStore.ts          # Actor state management
│   ├── llmStore.ts            # LLM configuration
│   └── systemStore.ts          # System state
├── lib/
│   └── utils.ts               # Utility functions
├── App.tsx                    # Main application component
├── main.tsx                   # Application entry point
├── index.html                  # HTML template
└── index.css                   # Global styles
```

## Installation & Setup

### Prerequisites

```bash
# Node.js 18+ required
node --version

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm --filter @promethean-os/frontend dev

# Build for production
pnpm --filter @promethean-os/frontend build

# Run tests
pnpm --filter @promethean-os/frontend test

# Type checking
pnpm --filter @promethean-os/frontend typecheck
```

### Environment Configuration

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:8080
VITE_APP_NAME=Pantheon Frontend
VITE_APP_VERSION=1.0.0
```

## Core Components

### Layout Component

The main application layout provides navigation and structure:

```typescript
// src/pantheon/components/Layout.tsx
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navigation = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/actors', label: 'Actors', icon: '🤖' },
    { path: '/contexts', label: 'Contexts', icon: '📚' },
    { path: '/tools', label: 'Tools', icon: '🔧' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Pantheon
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
```

### Dashboard Page

Main dashboard showing system overview and statistics:

```typescript
// src/pantheon/pages/Dashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function Dashboard() {
  const { data: systemStats, isLoading } = useQuery({
    queryKey: ['system-stats'],
    queryFn: () => fetch('/api/system/stats').then(r => r.json())
  });

  const { data: actors } = useQuery({
    queryKey: ['actors'],
    queryFn: () => fetch('/api/actors').then(r => r.json())
  });

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Actors" value={actors?.length || 0} icon="🤖" />
        <Card title="Active Actors" value={systemStats?.activeActors || 0} icon="✅" />
        <Card title="Messages Today" value={systemStats?.messagesToday || 0} icon="💬" />
        <Card title="System Health" value="Healthy" icon="🟢" />
      </div>

      {/* Recent Activity */}
      <Card title="Recent Activity">
        <div className="space-y-3">
          {systemStats?.recentActivity?.map((activity: any) => (
            <div key={activity.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{activity.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <Badge
                variant={activity.type === 'error' ? 'destructive' : 'secondary'}
              >
                {activity.type}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn btn-primary">
            Create New Actor
          </button>
          <button className="btn btn-secondary">
            View Logs
          </button>
          <button className="btn btn-outline">
            System Settings
          </button>
        </div>
      </Card>
    </div>
  );
}
```

### Actors Management Page

Comprehensive actor management interface:

```typescript
// src/pantheon/pages/Actors.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

interface Actor {
  id: string;
  name: string;
  type: 'llm' | 'tool' | 'composite';
  status: 'active' | 'inactive' | 'error';
  lastTick: string;
  goals: string[];
}

export default function Actors() {
  const [selectedActor, setSelectedActor] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: actors, isLoading } = useQuery({
    queryKey: ['actors'],
    queryFn: () => fetch('/api/actors').then(r => r.json())
  });

  const startActorMutation = useMutation({
    mutationFn: async (actorId: string) => {
      const response = await fetch(`/api/actors/${actorId}/start`, {
        method: 'POST'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actors'] });
    }
  });

  const stopActorMutation = useMutation({
    mutationFn: async (actorId: string) => {
      const response = await fetch(`/api/actors/${actorId}/stop`, {
        method: 'POST'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actors'] });
    }
  });

  const handleStartActor = (actorId: string) => {
    startActorMutation.mutate(actorId);
  };

  const handleStopActor = (actorId: string) => {
    stopActorMutation.mutate(actorId);
  };

  if (isLoading) {
    return <div>Loading actors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Actors</h1>
        <Button>Create New Actor</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actors?.map((actor: Actor) => (
          <Card key={actor.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {actor.name}
                </h3>
                <p className="text-sm text-gray-500">ID: {actor.id}</p>
              </div>
              <Badge
                variant={
                  actor.status === 'active' ? 'default' :
                  actor.status === 'error' ? 'destructive' : 'secondary'
                }
              >
                {actor.status}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type:</span>
                <span className="font-medium">{actor.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Tick:</span>
                <span className="font-medium">
                  {new Date(actor.lastTick).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Goals:</p>
              <div className="flex flex-wrap gap-1">
                {actor.goals.map((goal, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              {actor.status === 'active' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStopActor(actor.id)}
                  disabled={stopActorMutation.isLoading}
                >
                  Stop
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleStartActor(actor.id)}
                  disabled={startActorMutation.isLoading}
                >
                  Start
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedActor(actor.id)}
              >
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

## WebSocket Integration

### WebSocket Provider

Real-time communication with the backend:

```typescript
// src/pantheon/providers/WebSocketProvider.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: any;
  sendMessage: (message: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    websocket.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setLastMessage(message);

      // Handle different message types
      switch (message.type) {
        case 'actor-update':
          // Update actor state in React Query cache
          queryClient.setQueryData(['actors'], (old: any[]) => {
            return old?.map(actor =>
              actor.id === message.data.id
                ? { ...actor, ...message.data }
                : actor
            );
          });
          break;

        case 'system-notification':
          // Show system notification
          showNotification(message.data);
          break;

        case 'log-message':
          // Add to log stream
          queryClient.setQueryData(['logs'], (old: any[]) => {
            return [message.data, ...(old || [])].slice(0, 100);
          });
          break;
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const sendMessage = (message: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  return (
    <WebSocketContext.Provider value={{
      isConnected,
      lastMessage,
      sendMessage
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}
```

### Real-time Actor Updates

```typescript
// Using WebSocket in components
import { useWebSocket } from '../providers/WebSocketProvider';
import { useQuery } from '@tanstack/react-query';

export default function ActorMonitor() {
  const { isConnected, lastMessage } = useWebSocket();
  const { data: actors } = useQuery({
    queryKey: ['actors'],
    queryFn: () => fetch('/api/actors').then(r => r.json())
  });

  useEffect(() => {
    if (lastMessage?.type === 'actor-status-change') {
      // Handle real-time actor status changes
      const { actorId, status, timestamp } = lastMessage.data;

      // Update local state
      queryClient.setQueryData(['actors'], (old: any[]) => {
        return old?.map(actor =>
          actor.id === actorId
            ? { ...actor, status, lastTick: timestamp }
            : actor
        );
      });

      // Show notification
      showNotification({
        type: 'info',
        message: `Actor ${actorId} status changed to ${status}`
      });
    }
  }, [lastMessage]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="text-sm text-gray-600">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Actor list with real-time updates */}
      {actors?.map((actor: any) => (
        <div key={actor.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">{actor.name}</h3>
            <span className={`px-2 py-1 rounded text-xs ${
              actor.status === 'active' ? 'bg-green-100 text-green-800' :
              actor.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {actor.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Last tick: {new Date(actor.lastTick).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
```

## State Management

### Actor Store

Zustand-based state management for actors:

```typescript
// src/pantheon/store/actorsStore.ts
import { create } from 'zustand';

interface Actor {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  goals: string[];
  lastTick: number;
  metadata?: Record<string, any>;
}

interface ActorsStore {
  actors: Actor[];
  selectedActor: Actor | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setActors: (actors: Actor[]) => void;
  addActor: (actor: Actor) => void;
  updateActor: (id: string, updates: Partial<Actor>) => void;
  removeActor: (id: string) => void;
  setSelectedActor: (actor: Actor | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Async actions
  fetchActors: () => Promise<void>;
  createActor: (actorData: Partial<Actor>) => Promise<void>;
  startActor: (id: string) => Promise<void>;
  stopActor: (id: string) => Promise<void>;
}

export const useActorsStore = create<ActorsStore>((set, get) => ({
  actors: [],
  selectedActor: null,
  isLoading: false,
  error: null,

  setActors: (actors) => set({ actors }),
  addActor: (actor) =>
    set((state) => ({
      actors: [...state.actors, actor],
    })),
  updateActor: (id, updates) =>
    set((state) => ({
      actors: state.actors.map((actor) => (actor.id === id ? { ...actor, ...updates } : actor)),
    })),
  removeActor: (id) =>
    set((state) => ({
      actors: state.actors.filter((actor) => actor.id !== id),
    })),
  setSelectedActor: (actor) => set({ selectedActor: actor }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchActors: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/actors');
      const actors = await response.json();
      set({ actors, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch actors',
        isLoading: false,
      });
    }
  },

  createActor: async (actorData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/actors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actorData),
      });
      const newActor = await response.json();
      set((state) => ({
        actors: [...state.actors, newActor],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create actor',
        isLoading: false,
      });
    }
  },

  startActor: async (id) => {
    try {
      await fetch(`/api/actors/${id}/start`, { method: 'POST' });
      get().updateActor(id, { status: 'active' });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to start actor' });
    }
  },

  stopActor: async (id) => {
    try {
      await fetch(`/api/actors/${id}/stop`, { method: 'POST' });
      get().updateActor(id, { status: 'inactive' });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to stop actor' });
    }
  },
}));
```

## API Integration

### API Service Layer

Centralized API communication:

```typescript
// src/pantheon/services/api.ts
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Actor endpoints
  async getActors() {
    return this.request<Actor[]>('/actors');
  }

  async getActor(id: string) {
    return this.request<Actor>(`/actors/${id}`);
  }

  async createActor(actorData: Partial<Actor>) {
    return this.request<Actor>('/actors', {
      method: 'POST',
      body: JSON.stringify(actorData),
    });
  }

  async updateActor(id: string, updates: Partial<Actor>) {
    return this.request<Actor>(`/actors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteActor(id: string) {
    return this.request<void>(`/actors/${id}`, {
      method: 'DELETE',
    });
  }

  async startActor(id: string) {
    return this.request<void>(`/actors/${id}/start`, {
      method: 'POST',
    });
  }

  async stopActor(id: string) {
    return this.request<void>(`/actors/${id}/stop`, {
      method: 'POST',
    });
  }

  // Context endpoints
  async getContexts() {
    return this.request<Context[]>('/contexts');
  }

  async createContext(contextData: Partial<Context>) {
    return this.request<Context>('/contexts', {
      method: 'POST',
      body: JSON.stringify(contextData),
    });
  }

  // Tool endpoints
  async getTools() {
    return this.request<Tool[]>('/tools');
  }

  async executeTool(toolName: string, args: Record<string, any>) {
    return this.request<any>(`/tools/${toolName}/execute`, {
      method: 'POST',
      body: JSON.stringify(args),
    });
  }

  // System endpoints
  async getSystemStats() {
    return this.request<SystemStats>('/system/stats');
  }

  async getSystemLogs(limit = 100) {
    return this.request<LogEntry[]>(`/system/logs?limit=${limit}`);
  }
}

export const apiService = new ApiService();
```

## UI Components

### Reusable UI Components

Consistent design system with reusable components:

```typescript
// src/pantheon/components/ui/button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';

    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
    };

    const sizes = {
      default: 'h-10 py-2 px-4',
      sm: 'h-9 px-3 rounded-md',
      lg: 'h-11 px-8 rounded-md',
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
```

```typescript
// src/pantheon/components/ui/card.tsx
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  value?: string | number;
  icon?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, value, icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border bg-card text-card-foreground shadow-sm',
          className
        )}
        {...props}
      >
        {(title || value || icon) && (
          <div className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                {title && (
                  <h3 className="text-2xl font-bold leading-none tracking-tight">
                    {title}
                  </h3>
                )}
                {value && (
                  <p className="text-xs text-muted-foreground">
                    {value}
                  </p>
                )}
              </div>
              {icon && (
                <div className="text-2xl">{icon}</div>
              )}
            </div>
          </div>
        )}

        {children && (
          <div className="p-6 pt-0">
            {children}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
```

## Testing

### Component Testing

```typescript
// src/pantheon/components/__tests__/Layout.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../Layout';

describe('Layout', () => {
  it('renders navigation correctly', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getByText('Pantheon')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Actors')).toBeInTheDocument();
    expect(screen.getByText('Contexts')).toBeInTheDocument();
    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    render(
      <MemoryRouter initialEntries={['/actors']}>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );

    const actorsLink = screen.getByText('Actors');
    expect(actorsLink).toHaveClass('bg-blue-100', 'text-blue-700');
  });
});
```

### Integration Testing

```typescript
// src/pantheon/__tests__/App.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

describe('App Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('renders dashboard by default', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Actors')).toBeInTheDocument();
    });
  });

  it('navigates between pages', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Navigate to actors page
    const actorsLink = screen.getByText('Actors');
    actorsLink.click();

    await waitFor(() => {
      expect(screen.getByText('Create New Actor')).toBeInTheDocument();
    });
  });
});
```

## Performance Optimization

### Code Splitting

Lazy loading components for better performance:

```typescript
// src/pantheon/App.tsx
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Actors = lazy(() => import('./pages/Actors'));
const ActorDetail = lazy(() => import('./pages/ActorDetail'));
const Context = lazy(() => import('./pages/Context'));
const Tools = lazy(() => import('./pages/Tools'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/actors" element={<Actors />} />
          <Route path="/actors/:actorId" element={<ActorDetail />} />
          <Route path="/contexts" element={<Context />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
```

### Query Optimization

Efficient data fetching with TanStack Query:

```typescript
// Optimized query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Prefetching data for better UX
const ActorsPage = () => {
  const queryClient = useQueryClient();

  // Prefetch actor details when hovering
  const handleActorHover = (actorId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['actor', actorId],
      queryFn: () => fetch(`/api/actors/${actorId}`).then(r => r.json()),
    });
  };

  return (
    // Component JSX
  );
};
```

## Security Considerations

### Input Validation

```typescript
// Form validation with Zod
import { z } from 'zod';

const actorSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['llm', 'tool', 'composite']),
  goals: z.array(z.string().min(1)).max(10),
  config: z.record(z.any()).optional(),
});

// Validation hook
export function useActorValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateActor = (data: unknown) => {
    try {
      const validated = actorSchema.parse(data);
      setErrors({});
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return { success: false, error };
    }
  };

  return { errors, validateActor };
}
```

### Authentication

```typescript
// Authentication context
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('auth-token')
  );

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const { user, token } = await response.json();
        setUser(user);
        setToken(token);
        localStorage.setItem('auth-token', token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth-token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## Related Documentation

- [[pantheon-core]]: Core framework concepts
- [[pantheon-ui]]: UI component library
- [[integration-guide.md|Integration Guide]]: Backend integration
- [[developer-guide.md|Developer Guide]]: Development patterns

## File Locations

- **Main App**: `/packages/frontend/src/pantheon/App.tsx`
- **Entry Point**: `/packages/frontend/src/pantheon/main.tsx`
- **Components**: `/packages/frontend/src/pantheon/components/`
- **Pages**: `/packages/frontend/src/pantheon/pages/`
- **Services**: `/packages/frontend/src/pantheon/services/`
- **Store**: `/packages/frontend/src/pantheon/store/`
- **Tests**: `/packages/frontend/src/pantheon/components/__tests__/`

---

The Pantheon Frontend provides a modern, responsive, and feature-rich interface for managing the entire Pantheon AI agent ecosystem with real-time updates and comprehensive functionality.
