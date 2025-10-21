# Chat UI

A ClojureScript chat interface for viewing and managing indexed conversations from the Promethean framework.

## Features

- View indexed chat sessions
- Browse messages within sessions
- Delete individual messages
- Delete entire sessions
- Responsive web interface
- Real-time updates

## Development

### Prerequisites

- Node.js 18+
- pnpm workspace setup

### Installation

```bash
# Install dependencies
pnpm install

# Start development server (runs both API and frontend)
pnpm start

# Or run separately:
pnpm run api    # Start API server on port 3001
pnpm run dev     # Start ClojureScript development server on port 8080
```

### Usage

1. Start the development server:

   ```bash
   pnpm start
   ```

2. Open your browser to:
   - Frontend: http://localhost:8080
   - API: http://localhost:3001/api

### Building

```bash
# Build for production
pnpm run build

# Clean build artifacts
pnpm run clean
```

## Architecture

- **Frontend**: ClojureScript with Reagent and re-frame
- **Backend**: Express.js with TypeScript
- **Data**: Mock data (can be replaced with real database integration)
- **Styling**: Custom CSS with responsive design

## API Endpoints

- `GET /api/sessions` - List all sessions
- `GET /api/sessions/:id` - Get specific session
- `GET /api/sessions/:id/messages` - Get messages for session
- `DELETE /api/sessions/:id` - Delete session
- `DELETE /api/sessions/:id/messages/:messageId` - Delete message

## Integration with Indexer

This UI is designed to work with the indexed data from the `@promethean/opencode-client` indexer.

To integrate with real data:

1. Replace the mock data in `src/server/mock-data.ts` with actual database calls
2. Update the API endpoints to use the `@promethean/database` package
3. Ensure the indexer is running and populating the database

## File Structure

```
src/
├── main/           # ClojureScript application
│   ├── core.cljs    # Main entry point
│   ├── events.cljs   # re-frame events
│   ├── subs.cljs     # re-frame subscriptions
│   └── components/  # UI components
├── components/       # Reagent components
├── db/             # Database access layer
└── server/          # Express API server
```
