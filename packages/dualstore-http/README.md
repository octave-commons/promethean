# @promethean/dualstore-http

HTTP API server for Promethean dualstore collections, providing REST endpoints and real-time Server-Sent Events (SSE) streaming.

## Features

- **REST API**: Full CRUD operations for session_messages, agent_tasks, and opencode_events collections
- **Real-time Streaming**: Server-Sent Events for live data updates
- **Type Safety**: Full TypeScript support with Zod validation schemas
- **Authentication**: Optional Bearer token authentication
- **CORS Support**: Configurable cross-origin resource sharing
- **Health Checks**: Built-in health and status endpoints
- **OpenAPI Documentation**: Auto-generated API documentation

## Installation

```bash
npm install @promethean/dualstore-http
```

## Quick Start

### Basic Usage

```typescript
import { createServer, start } from '@promethean/dualstore-http';

// Start the server with default configuration
start();
```

### Custom Configuration

```typescript
import { createServer } from '@promethean/dualstore-http';

const server = await createServer();
await server.listen({ port: 3000, host: '0.0.0.0' });
```

## Environment Configuration

Create a `.env` file in your project root:

```env
# Server Configuration
PORT=3000
HOST=localhost
NODE_ENV=development
LOG_LEVEL=info

# CORS Configuration
CORS_ORIGIN=*

# Authentication (optional)
# BEARER_AUTH_KEY=your-secret-bearer-token-here

# SSE Configuration
SSE_HEARTBEAT_INTERVAL=30000
SSE_POLLING_INTERVAL=5000
```

## API Endpoints

### REST API

#### Session Messages

- `GET /api/v1/session_messages` - List all session messages
- `GET /api/v1/session_messages/:id` - Get specific session message
- `POST /api/v1/session_messages` - Create new session message

#### Agent Tasks

- `GET /api/v1/agent_tasks` - List all agent tasks
- `GET /api/v1/agent_tasks/:id` - Get specific agent task
- `POST /api/v1/agent_tasks` - Create new agent task

#### Opencode Events

- `GET /api/v1/opencode_events` - List all opencode events
- `GET /api/v1/opencode_events/:id` - Get specific opencode event
- `POST /api/v1/opencode_events` - Create new opencode event

### Streaming Endpoints

- `GET /api/v1/stream/session_messages` - Stream session messages via SSE
- `GET /api/v1/stream/agent_tasks` - Stream agent tasks via SSE
- `GET /api/v1/stream/opencode_events` - Stream opencode events via SSE

### System Endpoints

- `GET /` - API information
- `GET /health` - Health check

## Query Parameters

All list endpoints support the following query parameters:

- `session_id` - Filter by session ID
- `created_after` - Filter items created after this timestamp
- `created_before` - Filter items created before this timestamp
- `sort_by` - Sort field (default: created_at)
- `sort_order` - Sort order: asc or desc (default: desc)
- `offset` - Pagination offset (default: 0)
- `limit` - Items per page (default: 50, max: 100)

## Data Models

### SessionMessage

```typescript
{
  id: string;
  created_at: string;
  updated_at: string;
  session_id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  metadata?: Record<string, any>;
}
```

### AgentTask

```typescript
{
  id: string;
  created_at: string;
  updated_at: string;
  session_id: string;
  agent_id: string;
  task_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  error_message?: string;
  metadata?: Record<string, any>;
}
```

### OpencodeEvent

```typescript
{
  id: string;
  created_at: string;
  updated_at: string;
  session_id: string;
  event_type: string;
  event_data: Record<string, any>;
  source?: string;
  severity: 'info' | 'warning' | 'error' | 'debug';
  metadata?: Record<string, any>;
}
```

## Server-Sent Events

The streaming endpoints send events in the following format:

```
event: <event_type>
data: {
  "collection": "<collection_name>",
  "data": { ... },
  "timestamp": "<ISO_timestamp>"
}
```

Event types:

- `connection` - Initial connection established
- `insert` - New item created
- `update` - Item updated
- `delete` - Item deleted
- `heartbeat` - Keep-alive signal

## Authentication

If `BEARER_AUTH_KEY` is configured, all API endpoints require Bearer token authentication:

```bash
curl -H "Authorization: Bearer your-token-here" \
     http://localhost:3000/api/v1/session_messages
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## License

GPL-3.0 - see LICENSE.txt file for details.
