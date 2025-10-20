# Pantheon UI

Web interface for the Pantheon Agent Management Framework.

## Features

- **Actor Management**: Create, view, edit, and delete AI actors
- **LLM Chat Interface**: Real-time conversation with LLM-powered actors
- **Context Management**: Compile and manage context sources
- **MCP Tool Execution**: Execute and monitor MCP tools
- **Real-time Updates**: WebSocket integration for live updates
- **Modern UI**: Material-UI based responsive design
- **Dark/Light Theme**: Customizable theme support

## Development

### Prerequisites

- Node.js 18+
- pnpm package manager

### Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm --filter @promethean/pantheon-ui dev

# Build for production
pnpm --filter @promethean/pantheon-ui build

# Run tests
pnpm --filter @promethean/pantheon-ui test

# Type checking
pnpm --filter @promethean/pantheon-ui typecheck

# Linting
pnpm --filter @promethean/pantheon-ui lint
```

### Architecture

The UI is built with:

- **React 18** with TypeScript
- **Material-UI** for component library
- **Zustand** for state management
- **React Query** for server state
- **React Router** for navigation
- **Socket.io** for real-time updates
- **Vite** for build tooling

### Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── providers/          # React context providers
├── services/           # API and WebSocket services
├── store/              # Zustand state stores
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── theme.ts            # Material-UI theme configuration
├── App.tsx             # Main app component
└── main.tsx            # Application entry point
```

### Configuration

The UI connects to the Pantheon backend via:

- **REST API**: `/api/*` endpoints
- **WebSocket**: `/ws` for real-time updates

Configuration can be adjusted in the Settings page or by modifying the default settings in `src/pages/Settings.tsx`.

### Testing

```bash
# Run unit tests
pnpm test

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

### Building

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Usage

1. Start the Pantheon backend server
2. Start the UI development server
3. Open http://localhost:3000 in your browser
4. Use the interface to manage actors, contexts, and tools

## Contributing

1. Follow the existing code style and patterns
2. Add tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

## License

MIT License - see LICENSE file for details.