# File Indexer Service Daemon

PM2 ecosystem configuration for the File Indexer Service.

## Configuration

The service runs on port 3001 and provides persistent file indexing capabilities using `@promethean-os/persistence`.

## Environment Variables

- `PORT`: Service port (default: 3001)
- `NODE_ENV`: Environment (default: production)
- `EMBEDDING_FUNCTION`: Embedding function for search
- `EMBEDDING_DRIVER`: Embedding driver (ollama, etc.)

## Management

Start the service:

```bash
pm2 start ecosystem.edn
```

Stop the service:

```bash
pm2 stop file-indexer-service
```

View logs:

```bash
pm2 logs file-indexer-service
```

## API Endpoints

- `GET /health` - Health check
- `POST /search` - Search indexed files
- `POST /index` - Index a directory
- `GET /recent` - Get recent files
- `POST /file` - Get specific file
- `DELETE /file` - Remove file from index
- `GET /stats` - Indexing statistics

## Persistence

The service uses DualStoreManager for persistent storage across:

- MongoDB: Document storage
- ChromaDB: Vector search with embeddings

Files are indexed with content, metadata, and vector embeddings for efficient semantic search.
