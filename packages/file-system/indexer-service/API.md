# API Reference

This document provides detailed API reference for the `@promethean/indexer-service` package, including both the HTTP REST API and the TypeScript client library.

## HTTP REST API

### Base URL

```
http://localhost:4260
```

### Content Type

All POST requests should use `Content-Type: application/json`.

### Response Format

All responses follow this structure:

```json
{
  "ok": boolean,
  "error?: string,
  // Additional response-specific fields
}
```

## Endpoints

### Health Check

#### GET /health

Check if the service is running.

**Response:**

```json
{
  "ok": true
}
```

**Status Codes:**

- `200 OK` - Service is healthy

---

### Indexer Status

#### GET /indexer/status

Get the current status and statistics of the indexer.

**Response:**

```json
{
  "ok": true,
  "status": {
    "mode": "indexed|bootstrap|indexing",
    "filesCount": number,
    "lastIndexed": string,
    "busy": boolean,
    // Additional indexer-specific metadata
  }
}
```

**Status Codes:**

- `200 OK` - Status retrieved successfully
- `500 Internal Server Error` - Failed to get status

---

### Reset Indexer

#### POST /indexer/reset

Reset the indexer and rebootstrap from the root path.

**Request Body:** None

**Response:**

```json
{
  "ok": true
}
```

**Error Response:**

```json
{
  "ok": false,
  "error": "Indexer busy"
}
```

**Status Codes:**

- `200 OK` - Reset successful
- `409 Conflict` - Indexer is busy
- `500 Internal Server Error` - Reset failed

---

### Reindex All Files

#### POST /indexer/reindex

Schedule a complete reindex of all files in the root path.

**Request Body:** None

**Response:**

```json
{
  "ok": true,
  "queued": number,
  "ignored": number,
  "mode": "full"
}
```

**Status Codes:**

- `200 OK` - Reindex scheduled successfully
- `500 Internal Server Error` - Failed to schedule reindex

---

### Reindex Specific Files

#### POST /indexer/files/reindex

Schedule reindexing for specific file patterns.

**Request Body:**

```json
{
  "path": string | string[]
}
```

**Examples:**

```json
{
  "path": "src/**/*.ts"
}
```

```json
{
  "path": ["src/**/*.ts", "docs/**/*.md"]
}
```

**Response:**

```json
{
  "ok": true,
  "queued": number,
  "ignored": number,
  "mode": "subset"
}
```

**Error Response:**

```json
{
  "ok": false,
  "error": "Missing 'path'"
}
```

**Status Codes:**

- `200 OK` - Reindex scheduled successfully
- `400 Bad Request` - Missing or invalid path parameter
- `500 Internal Server Error` - Failed to schedule reindex

---

### Index Single File

#### POST /indexer/index

Index a single file.

**Request Body:**

```json
{
  "path": string
}
```

**Example:**

```json
{
  "path": "src/components/Button.tsx"
}
```

**Response:**

```json
{
  "ok": true,
  "queued": 1,
  "ignored": 0,
  "mode": "single"
}
```

**Error Response:**

```json
{
  "ok": false,
  "error": "Invalid or missing path"
}
```

**Status Codes:**

- `200 OK` - File indexed successfully
- `400 Bad Request` - Missing or invalid path
- `500 Internal Server Error` - Failed to index file

---

### Remove File from Index

#### POST /indexer/remove

Remove a file from the index.

**Request Body:**

```json
{
  "path": string
}
```

**Example:**

```json
{
  "path": "src/deprecated/old-component.ts"
}
```

**Response:**

```json
{
  "ok": true
}
```

**Error Response:**

```json
{
  "ok": false,
  "error": "Invalid or missing path"
}
```

**Status Codes:**

- `200 OK` - File removed successfully
- `400 Bad Request` - Missing or invalid path
- `500 Internal Server Error` - Failed to remove file

---

### Semantic Search

#### POST /search

Perform semantic search across indexed files.

**Request Body:**

```json
{
  "q": string,
  "n": number
}
```

**Parameters:**

- `q` (required): Search query string
- `n` (optional): Maximum number of results (default: 8)

**Example:**

```json
{
  "q": "authentication middleware implementation",
  "n": 10
}
```

**Response:**

```json
{
  "ok": true,
  "results": [
    {
      "path": "src/middleware/auth.ts",
      "content": "string",
      "score": number,
      "metadata": {
        "fileType": "typescript",
        "lastModified": "2024-01-15T10:30:00Z",
        "size": 2048
      }
    }
  ]
}
```

**Error Response:**

```json
{
  "ok": false,
  "error": "Missing 'q'"
}
```

**Status Codes:**

- `200 OK` - Search completed successfully
- `400 Bad Request` - Missing query parameter
- `500 Internal Server Error` - Search failed

---

### OpenAPI Documentation

#### GET /openapi.json

Get the OpenAPI 3.1.0 specification (when docs are enabled).

**Response:** OpenAPI JSON specification

**Status Codes:**

- `200 OK` - Specification retrieved successfully

---

## TypeScript Client API

### IndexerServiceClient

Main client class for interacting with the indexer service.

#### Constructor

```typescript
new IndexerServiceClient(config: IndexerServiceClientConfig)
```

**Config:**

```typescript
interface IndexerServiceClientConfig {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  headers?: Record<string, string>;
}
```

**Example:**

```typescript
import { IndexerServiceClient } from '@promethean/indexer-service/client';

const client = new IndexerServiceClient({
  baseUrl: 'http://localhost:4260',
  headers: {
    Authorization: 'Bearer your-token',
  },
});
```

#### Methods

##### status()

Get indexer status.

```typescript
async status(signal?: AbortSignal): Promise<IndexerStatus>
```

**Returns:** `Promise<IndexerStatus>`

**Example:**

```typescript
const status = await client.status();
console.log('Indexer mode:', status.mode);
console.log('Files indexed:', status.filesCount);
```

##### reset()

Reset the indexer.

```typescript
async reset(signal?: AbortSignal): Promise<ControlResponse>
```

**Returns:** `Promise<ControlResponse>`

**Example:**

```typescript
const result = await client.reset();
if (result.ok) {
  console.log('Indexer reset successfully');
} else {
  console.error('Reset failed:', result.error);
}
```

##### reindexAll()

Reindex all files.

```typescript
async reindexAll(signal?: AbortSignal): Promise<ScheduleResponse>
```

**Returns:** `Promise<ScheduleResponse>`

**Example:**

```typescript
const result = await client.reindexAll();
console.log(`Queued ${result.queued} files for reindexing`);
```

##### reindexFiles()

Reindex specific file patterns.

```typescript
async reindexFiles(
  path: string | string[],
  signal?: AbortSignal
): Promise<ScheduleResponse>
```

**Parameters:**

- `path`: File pattern or array of patterns

**Returns:** `Promise<ScheduleResponse>`

**Example:**

```typescript
// Single pattern
const result1 = await client.reindexFiles('src/**/*.ts');

// Multiple patterns
const result2 = await client.reindexFiles(['src/**/*.ts', 'docs/**/*.md']);
```

##### indexPath()

Index a single file.

```typescript
async indexPath(
  path: string,
  signal?: AbortSignal
): Promise<ScheduleResponse>
```

**Parameters:**

- `path`: File path relative to indexer root

**Returns:** `Promise<ScheduleResponse>`

**Example:**

```typescript
const result = await client.indexPath('src/new-component.tsx');
if (result.queued > 0) {
  console.log('File queued for indexing');
}
```

##### removePath()

Remove a file from the index.

```typescript
async removePath(
  path: string,
  signal?: AbortSignal
): Promise<ControlResponse>
```

**Parameters:**

- `path`: File path relative to indexer root

**Returns:** `Promise<ControlResponse>`

**Example:**

```typescript
const result = await client.removePath('src/old-component.tsx');
if (result.ok) {
  console.log('File removed from index');
}
```

##### search()

Perform semantic search.

```typescript
async search(
  query: string,
  n = 8,
  signal?: AbortSignal
): Promise<SearchResponse>
```

**Parameters:**

- `query`: Search query
- `n`: Maximum number of results (default: 8)

**Returns:** `Promise<SearchResponse>`

**Example:**

```typescript
const results = await client.search('authentication patterns', 10);
results.results.forEach((result) => {
  console.log(`${result.path}: ${result.score}`);
});
```

---

### Utility Functions

#### createIndexerServiceClient()

Factory function to create a new client instance.

```typescript
function createIndexerServiceClient(config: IndexerServiceClientConfig): IndexerServiceClient;
```

**Example:**

```typescript
import { createIndexerServiceClient } from '@promethean/indexer-service/client';

const client = createIndexerServiceClient({
  baseUrl: 'http://localhost:4260',
});
```

---

### Type Definitions

#### IndexerServiceClientConfig

```typescript
interface IndexerServiceClientConfig {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  headers?: Record<string, string>;
}
```

#### IndexerStatus

```typescript
type IndexerStatus = Record<string, unknown>;
```

Typically includes:

- `mode`: Indexer mode ("bootstrap", "indexed", "indexing")
- `filesCount`: Number of indexed files
- `lastIndexed`: Timestamp of last indexing
- `busy`: Whether indexer is currently busy

#### ScheduleResponse

```typescript
interface ScheduleResponse {
  readonly ok: boolean;
  readonly queued?: number;
  readonly ignored?: number;
  readonly mode?: string;
}
```

#### ControlResponse

```typescript
interface ControlResponse {
  readonly ok: boolean;
  readonly error?: string;
}
```

#### SearchResponse

```typescript
interface SearchResponse {
  readonly ok: boolean;
  readonly results: unknown[];
}
```

Each result typically includes:

- `path`: File path
- `content`: File content snippet
- `score`: Relevance score
- `metadata`: File metadata

---

### Error Handling

#### IndexerServiceError

Custom error class for service-related errors.

```typescript
class IndexerServiceError extends Error {
  constructor(message: string, readonly status: number);
}
```

**Properties:**

- `message`: Error message
- `status`: HTTP status code
- `name`: "IndexerServiceError"

**Example:**

```typescript
import { IndexerServiceError } from '@promethean/indexer-service/client';

try {
  await client.search('test query');
} catch (error) {
  if (error instanceof IndexerServiceError) {
    console.error(`HTTP ${error.status}: ${error.message}`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## Usage Examples

### Basic Client Usage

```typescript
import { createIndexerServiceClient } from '@promethean/indexer-service/client';

const client = createIndexerServiceClient({
  baseUrl: 'http://localhost:4260',
});

// Check service health
const status = await client.status();
console.log('Service status:', status);

// Search for content
const results = await client.search('React hooks');
console.log('Found', results.results.length, 'results');

// Index new file
await client.indexPath('src/new-feature.tsx');
```

### Advanced Client Configuration

```typescript
const client = createIndexerServiceClient({
  baseUrl: 'https://indexer.example.com',
  headers: {
    Authorization: 'Bearer your-api-key',
    'User-Agent': 'MyApp/1.0',
  },
  fetchImpl: customFetch, // Custom fetch implementation
});
```

### Error Handling

```typescript
import { IndexerServiceError } from '@promethean/indexer-service/client';

async function safeSearch(query: string) {
  try {
    const results = await client.search(query);
    return results;
  } catch (error) {
    if (error instanceof IndexerServiceError) {
      switch (error.status) {
        case 400:
          console.error('Invalid query:', query);
          break;
        case 500:
          console.error('Service error:', error.message);
          break;
        default:
          console.error('Unexpected error:', error);
      }
    }
    throw error;
  }
}
```

### Batch Operations

```typescript
async function reindexProject() {
  // Check if indexer is busy
  const status = await client.status();
  if (status.busy) {
    console.log('Indexer is busy, waiting...');
    return;
  }

  // Reindex different file types
  const types = ['src/**/*.ts', 'docs/**/*.md', 'tests/**/*.test.ts'];

  for (const pattern of types) {
    const result = await client.reindexFiles(pattern);
    console.log(`Pattern ${pattern}: ${result.queued} files queued`);
  }
}
```
