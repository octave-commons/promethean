# Pantheon UI - Comprehensive Guide

## Overview

Pantheon UI is a modern web interface for managing AI agents in the Pantheon Agent Management Framework. It provides a comprehensive dashboard for actor management, LLM interactions, context compilation, and MCP tool execution.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm package manager
- Pantheon backend (or mock server for development)

### Installation & Development

```bash
# Navigate to the UI package
cd packages/pantheon-ui

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Or start with mock backend
node dev-server.js
# In another terminal:
pnpm dev
```

The UI will be available at http://localhost:3000

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 18 + TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Zustand
- **Server State**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Real-time**: Socket.io
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library

### Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Layout.tsx       # Main application layout
│   └── __tests__/       # Component tests
├── pages/               # Page components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Actors.tsx       # Actor management
│   ├── ActorDetail.tsx  # Actor chat interface
│   ├── Context.tsx      # Context management
│   ├── Tools.tsx        # MCP tools
│   └── Settings.tsx     # Application settings
├── providers/           # React context providers
│   └── WebSocketProvider.tsx
├── services/            # API and external services
│   ├── api.ts          # REST API client
│   └── websocket.ts    # WebSocket client
├── store/              # Zustand state stores
│   ├── actorsStore.ts  # Actor state management
│   ├── llmStore.ts     # LLM chat state
│   └── systemStore.ts  # System-wide state
├── types/              # TypeScript definitions
│   └── index.ts        # Core type definitions
├── theme.ts            # Material-UI theme
├── App.tsx             # Main app component
└── main.tsx            # Application entry point
```

## 📱 Features

### 1. Dashboard
- **System Overview**: Real-time metrics and health status
- **Performance Charts**: Visual representation of system activity
- **Recent Activity**: Latest tool executions and actor events
- **Quick Actions**: Tick actors, create new actors, access tools

### 2. Actor Management
- **Actor List**: View all actors with status and metadata
- **Actor Creation**: Create LLM, tool, and composite actors
- **Actor Operations**: Tick, edit, delete actors
- **Status Monitoring**: Real-time actor status updates

### 3. LLM Chat Interface
- **Real-time Chat**: Conversation with LLM-powered actors
- **Message History**: Complete conversation history
- **Markdown Support**: Rich text formatting in responses
- **Code Highlighting**: Syntax highlighting for code blocks

### 4. Context Management
- **Source Configuration**: Define context sources
- **Compilation**: Compile context from multiple sources
- **History**: Track context compilation history
- **Metrics**: Processing time and compilation statistics

### 5. MCP Tools
- **Tool Browser**: Browse available MCP tools
- **Execution Interface**: Execute tools with parameters
- **Execution History**: Track tool execution results
- **Real-time Updates**: Live execution status

### 6. Settings & Configuration
- **API Configuration**: Backend connection settings
- **UI Preferences**: Theme, language, refresh intervals
- **Notification Settings**: Configure notification types
- **Actor Defaults**: Default actor configurations

## 🔧 Configuration

### Environment Variables

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080

# Feature Flags
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_DEBUG=true
```

### Settings Storage

Settings are stored in localStorage under the key `pantheon-settings` and include:

```typescript
interface Settings {
  api: {
    baseUrl: string
    timeout: number
  }
  ui: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    refreshInterval: number
  }
  notifications: {
    enabled: boolean
    types: Array<'info' | 'success' | 'warning' | 'error'>
  }
  actors: {
    defaultType: string
    defaultModel: string
    maxMessages: number
  }
}
```

## 🔌 API Integration

### REST API Endpoints

The UI integrates with the following API endpoints:

#### Actors
- `GET /api/actors` - List all actors
- `GET /api/actors/:id` - Get actor details
- `POST /api/actors` - Create new actor
- `PUT /api/actors/:id` - Update actor
- `DELETE /api/actors/:id` - Delete actor
- `POST /api/actors/:id/tick` - Tick actor

#### LLM Actors
- `GET /api/actors/:id/messages` - Get message history
- `POST /api/actors/:id/messages` - Send message
- `DELETE /api/actors/:id/messages` - Clear messages

#### Context
- `GET /api/contexts` - List contexts
- `POST /api/contexts/compile` - Compile context

#### MCP Tools
- `GET /api/tools` - List available tools
- `POST /api/tools/:toolName/execute` - Execute tool
- `GET /api/tools/executions` - Get execution history

#### System
- `GET /api/system/metrics` - Get system metrics
- `GET /api/system/health` - Get system health

### WebSocket Events

Real-time updates are handled via WebSocket:

#### Actor Events
- `actor:created` - New actor created
- `actor:updated` - Actor updated
- `actor:deleted` - Actor deleted
- `actor:ticked` - Actor ticked
- `actor:message` - New message from LLM actor

#### System Events
- `system:metrics` - Updated system metrics
- `system:error` - System error occurred
- `system:notification` - System notification

## 🎨 UI Components

### Material-UI Theme

The UI uses a custom dark theme based on Material-UI:

```typescript
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: deepPurple,
    secondary: amber,
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
})
```

### Responsive Design

- **Mobile**: < 600px - Stacked layout, drawer navigation
- **Tablet**: 600px - 960px - Adjusted grid layouts
- **Desktop**: > 960px - Full layout with sidebar

### Animations

Uses Framer Motion for smooth transitions:
- Page transitions: Fade and slide effects
- Card animations: Scale and fade on load
- Micro-interactions: Hover states and button clicks

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui
```

### Test Structure

```
src/
├── components/
│   └── __tests__/
│       └── Layout.test.tsx
├── pages/
│   └── __tests__/
├── services/
│   └── __tests__/
└── utils/
    └── __tests__/
```

### Mock Data

For development and testing, mock data is available in `src/mocks/api.ts`:

```typescript
export const mockAPI = {
  getActors: () => Promise.resolve(mockActors),
  createActor: (config) => Promise.resolve(newActor),
  // ... other mock functions
}
```

## 🚀 Deployment

### Build for Production

```bash
# Build the application
pnpm build

# Preview production build
pnpm preview
```

### Environment Configuration

Production builds require:

1. **API Configuration**: Set correct backend URLs
2. **WebSocket Configuration**: Configure WebSocket endpoints
3. **Feature Flags**: Disable development features
4. **Asset Optimization**: Enable compression and caching

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🔧 Development Workflow

### Adding New Features

1. **Create Component**: Add new component in `src/components/`
2. **Add Types**: Define TypeScript interfaces in `src/types/`
3. **Update Store**: Add state management in `src/store/`
4. **Add Tests**: Write unit tests for new functionality
5. **Update Documentation**: Document new features

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Follow project linting rules
- **Prettier**: Consistent code formatting
- **Components**: Functional components with hooks
- **State**: Zustand for global state, React Query for server state

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

## 🐛 Troubleshooting

### Common Issues

#### WebSocket Connection Failed
- Check backend server is running
- Verify WebSocket URL configuration
- Check CORS settings

#### API Requests Failing
- Verify API base URL
- Check authentication tokens
- Review network connectivity

#### Build Errors
- Clear node_modules and reinstall
- Check TypeScript configuration
- Verify all dependencies are installed

### Debug Mode

Enable debug mode by setting:

```bash
VITE_ENABLE_DEBUG=true
```

This enables:
- Detailed console logging
- WebSocket connection status
- API request/response logging
- Performance metrics

## 📚 Additional Resources

### Documentation
- [Material-UI Documentation](https://mui.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Socket.io Documentation](https://socket.io/docs/)

### Tools & Libraries
- [Vite](https://vitejs.dev/) - Build tool
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [React Hook Form](https://react-hook-form.com/) - Form handling
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown rendering

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting
5. Use semantic commit messages

## 📄 License

MIT License - see LICENSE file for details.