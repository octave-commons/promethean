# Indexer Service Plugin

A comprehensive OpenCode plugin that connects to the `@promethean/indexer-service` to provide semantic search and file indexing capabilities.

## Features

### 🔍 Search Capabilities

- **Semantic Search**: Natural language search across indexed files
- **Configurable Results**: Control the number of search results (1-50)
- **Rich Metadata**: File type, size, and relevance scoring

### 📁 Indexing Management

- **Single File Indexing**: Index or update individual files
- **Pattern-based Reindexing**: Reindex files using glob patterns
- **Full Reindexing**: Reindex all files in the root directory
- **File Removal**: Remove files from the index

### 🛠️ Administrative Tools

- **Health Checks**: Monitor indexer service status
- **Configuration Management**: Update service connection settings
- **Batch Operations**: Execute multiple indexing operations
- **Reset Functionality**: Complete indexer reset with confirmation

## Available Tools

### Health & Status

- `indexer_health_check` - Check if the indexer service is running
- `indexer_status` - Get detailed status and statistics

### Search

- `indexer_search` - Perform semantic search with natural language queries

### Indexing Operations

- `indexer_index_file` - Index a single file
- `indexer_reindex_files` - Reindex files using patterns
- `indexer_reindex_all` - Reindex all files
- `indexer_remove_file` - Remove file from index

### Configuration & Management

- `indexer_configure` - Update service connection settings
- `indexer_reset` - Reset indexer (requires confirmation)
- `indexer_batch_operations` - Execute multiple operations

## Configuration

The plugin automatically configures itself using:

- **Default URL**: `http://localhost:4260`
- **Environment Variable**: `INDEXER_SERVICE_URL` (overrides default)
- **User Agent**: `opencode-plugin/1.0`

## Usage Examples

### Basic Search

```typescript
// Search for authentication patterns
await indexer_search({
  query: 'authentication middleware implementation',
  maxResults: 10,
});
```

### File Management

```typescript
// Index a new file
await indexer_index_file({
  path: 'src/new-feature.tsx',
});

// Reindex TypeScript files
await indexer_reindex_files({
  patterns: ['src/**/*.ts', 'src/**/*.tsx'],
});
```

### Service Management

```typescript
// Check service health
await indexer_health_check();

// Get detailed status
await indexer_status();

// Update service URL
await indexer_configure({
  baseUrl: 'https://indexer.example.com',
});
```

### Batch Operations

```typescript
await indexer_batch_operations({
  operations: [
    { type: 'index', path: 'src/new-component.tsx' },
    { type: 'reindex', patterns: ['docs/**/*.md'] },
    { type: 'remove', path: 'src/deprecated/old-file.ts' },
  ],
});
```

## Error Handling

All tools provide comprehensive error handling with:

- Clear error messages
- HTTP status codes (when applicable)
- Graceful fallbacks
- Detailed failure reasons

## Integration with Indexer Service

The plugin connects to the `@promethean/indexer-service` HTTP API and provides:

- RESTful API communication
- JSON request/response handling
- Error propagation
- Connection testing

## Dependencies

- `@opencode-ai/plugin` - OpenCode plugin framework
- `@promethean/indexer-service` - Indexer service (for API compatibility)

## Environment Variables

| Variable              | Default                 | Description              |
| --------------------- | ----------------------- | ------------------------ |
| `INDEXER_SERVICE_URL` | `http://localhost:4260` | Indexer service base URL |

## Security Considerations

- All file paths are validated by the indexer service
- No direct file system access - all operations go through the service
- Configuration changes are tested before applying
- Reset operations require explicit confirmation

## Troubleshooting

### Connection Issues

1. Check if the indexer service is running: `indexer_health_check`
2. Verify the service URL: `indexer_configure`
3. Check service status: `indexer_status`

### Search Issues

1. Ensure files are indexed: `indexer_status`
2. Reindex if needed: `indexer_reindex_all`
3. Check search query format

### Performance

- Use specific patterns for reindexing instead of full reindex
- Limit search results with `maxResults` parameter
- Use batch operations for multiple changes
