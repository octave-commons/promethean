# @promethean/indexer-service

HTTP service wrapper for the Promethean indexer system, providing REST API endpoints for file indexing and semantic search operations.

## Overview

The `@promethean/indexer-service` package exposes the functionality of `@promethean/indexer-core` through a Fastify-based HTTP service. It provides a complete REST API for managing file indexing operations and performing semantic searches across indexed content.

### Key Features

- **RESTful API**: Complete HTTP interface for indexer operations
- **Semantic Search**: Natural language search across indexed files
- **File Management**: Index, reindex, and remove files programmatically
- **Health Monitoring**: Built-in health checks and status endpoints
- **Rate Limiting**: Configurable request rate limiting
- **OpenAPI Documentation**: Auto-generated API documentation
- **TypeScript Client**: Included client library for easy integration

## Quick Start

### Installation

```bash
pnpm add @promethean/indexer-service
```

### Basic Usage

#### Starting the Service

```bash
# Set required environment variables
export INDEX_ROOT="/path/to/your/files"
export PORT=4260

# Start the service
pnpm indexer-service start
```

#### Using the Client

```typescript
import { createIndexerServiceClient } from '@promethean/indexer-service/client';

const client = createIndexerServiceClient({
  baseUrl: 'http://localhost:4260',
});

// Check service status
const status = await client.status();
console.log('Service status:', status);

// Search for content
const results = await client.search('authentication patterns');
console.log('Search results:', results.results);

// Index a specific file
await client.indexPath('src/auth/login.ts');

// Reindex all files
await client.reindexAll();
```

### Environment Variables

| Variable            | Default                              | Description                              |
| ------------------- | ------------------------------------ | ---------------------------------------- |
| `INDEX_ROOT`        | `process.cwd()`                      | Root directory to index                  |
| `INDEX_CACHE_PATH`  | `$INDEX_ROOT/.cache/indexer-service` | Cache directory                          |
| `PORT`              | `4260`                               | Service port                             |
| `HOST`              | `0.0.0.0`                            | Service host                             |
| `LOG_LEVEL`         | `info`                               | Logging level (debug, info, warn, error) |
| `ENABLE_DOCS`       | `true`                               | Enable OpenAPI documentation             |
| `ENABLE_RATE_LIMIT` | `true`                               | Enable rate limiting                     |

## API Endpoints

### Health & Status

- `GET /health` - Service health check
- `GET /indexer/status` - Indexer status and statistics

### Indexing Operations

- `POST /indexer/reset` - Reset indexer and rebootstrap
- `POST /indexer/reindex` - Reindex all files
- `POST /indexer/files/reindex` - Reindex specific file patterns
- `POST /indexer/index` - Index a single file
- `POST /indexer/remove` - Remove file from index

### Search

- `POST /search` - Semantic search with natural language queries

### Documentation

- `GET /openapi.json` - OpenAPI specification (when docs enabled)

## Development

### Scripts

```bash
# Build the package
pnpm build

# Start in development mode
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

### Project Structure

```
src/
├── main.ts              # Service entry point
├── server.ts            # Fastify server setup
├── config.ts            # Configuration management
├── client.ts            # TypeScript client library
├── routes/
│   ├── indexer.ts       # Indexing management routes
│   └── search.ts        # Search functionality routes
└── tests/
    └── server.test.ts   # Integration tests
```

## Usage Examples

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm build
EXPOSE 4260
ENV INDEX_ROOT=/data
ENV PORT=4260
CMD ["pnpm", "start"]
```

### Integration with Express

```typescript
import express from 'express';
import { createIndexerServiceClient } from '@promethean/indexer-service/client';

const app = express();
const indexerClient = createIndexerServiceClient({
  baseUrl: 'http://indexer-service:4260',
});

app.get('/search/:query', async (req, res) => {
  try {
    const results = await indexerClient.search(req.params.query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Batch Operations

```typescript
// Reindex multiple file patterns
await client.reindexFiles(['src/**/*.ts', 'docs/**/*.md', 'config/**/*.json']);

// Check status before operations
const status = await client.status();
if (status.busy) {
  console.log('Indexer is busy, waiting...');
  // Wait or retry logic
}
```

## Security Considerations

- **Path Traversal Protection**: All file paths are validated against directory traversal attacks
- **Rate Limiting**: Built-in rate limiting prevents abuse (configurable)
- **Input Validation**: All inputs are validated before processing
- **Error Handling**: Sensitive information is not exposed in error messages

## Monitoring & Observability

### Health Checks

```bash
curl http://localhost:4260/health
# Response: {"ok": true}
```

### Status Monitoring

```bash
curl http://localhost:4260/indexer/status
# Response: {"ok": true, "status": {...}}
```

### Logging

The service uses structured logging with configurable levels:

```typescript
// Set log level via environment
export LOG_LEVEL=debug

// Logs include request context, timing, and error details
```

## Dependencies

- **@fastify/rate-limit**: Request rate limiting
- **@fastify/swagger**: OpenAPI documentation generation
- **@fastify/swagger-ui**: Interactive API documentation
- **@promethean/indexer-core**: Core indexing functionality
- **@promethean/utils**: Shared utilities
- **fastify**: HTTP server framework

## Contributing

1. Follow the existing code style and patterns
2. Add tests for new functionality
3. Update documentation for API changes
4. Ensure all tests pass before submitting

## License

Internal package - part of the Promethean Framework.
