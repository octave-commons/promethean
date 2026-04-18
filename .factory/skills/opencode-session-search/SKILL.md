---
name: opencode-session-search
description: "Search and index OpenCode sessions using ChromaDB vector embeddings for semantic similarity retrieval and conversation reconstitute workflows"
---

# Skill: OpenCode Session Search

## Goal
Search and index OpenCode sessions using ChromaDB vector embeddings for semantic similarity retrieval and conversation reconstitute workflows.

## Use This Skill When
- You need to find relevant context from previous OpenCode conversations
- You want to search for specific patterns, errors, or solutions discussed in past sessions
- You are recovering or continuing a previous development context
- You need to understand what was discussed in a specific session
- You want to index new sessions for future searchability

## Do Not Use This Skill When
- You only need to browse session metadata (use OpenCode API directly)
- You are looking for file-based content (use grep/find instead)
- The conversation is very recent and not yet indexed

## Inputs
- Search query (for search command)
- Optional session ID filter
- Number of results (k value)
- Environment configuration for ChromaDB and Ollama

## Steps

### Indexing Sessions
1. Connect to OpenCode server to fetch all sessions
2. For each session, retrieve all messages via OpenCode API
3. Convert messages to Ollama-compatible format with role and content
4. Extract file paths mentioned in messages
5. Generate embeddings using Ollama (with LevelDB caching)
6. Upsert embeddings and metadata to ChromaDB collection
7. Track indexing state in LevelDB to avoid re-indexing unchanged messages

### Searching Sessions
1. Generate embedding for search query using Ollama
2. Query ChromaDB collection for nearest neighbors
3. Filter by session ID if specified
4. Group results by session
5. Display results with metadata (message index, role, paths, etc.)

## Output

### Index Command Output
```
Found 42 sessions
Upserted 32 rows to opencode_messages_v1 (total: 32)
Upserted 15 rows to opencode_messages_v1 (total: 47)
...
Done. Total records indexed: 1247
```

### Search Command Output
```
Searching OpenCode sessions...
Query: "authentication flow implementation"
Top-K: 10

=== session_id: ses_abc123 (hits: 3) ===
--- Result ---
ID: ses_abc123:15
Distance: 0.2341
Message Index: 15
Role: assistant
Session Title: User auth implementation
Created: 2026-02-01T10:30:00.000Z
Paths: src/auth.ts, src/middleware.ts, tests/auth.test.ts

[assistant] The authentication flow requires...

=== session_id: ses_def456 (hits: 2) ---
...
```

## Strong Hints

### Environment Configuration
- **OPENCODE_BASE_URL**: OpenCode server URL (default: http://localhost:4096)
- **CHROMA_URL**: ChromaDB server URL (default: http://localhost:8000)
- **CHROMA_COLLECTION**: Base collection name (default: opencode_messages_v1; model suffix appended)
- **OPENCODE_THROTTLE_MS**: Minimum delay between OpenCode API calls (default: 200)
- **OLLAMA_URL**: Ollama server URL (default: http://localhost:11434)
- **OLLAMA_EMBED_MODEL**: Embedding model (default: qwen3-embedding:8b)
- **LEVEL_DIR**: LevelDB cache directory (default: .reconstitute/level)
- **BATCH_SIZE**: Embedding batch size (default: 32)
- **EMBED_TTL_MS**: Cache TTL in milliseconds (default: 30 days)

### Message Processing
- System, user, and assistant messages are labeled with role prefixes
- Tool calls are extracted and formatted as `[tool_call:name] {args}`
- Tool results are labeled as `[tool:name] output`
- File paths are extracted using loose pattern matching

### ChromaDB Schema
- **Collection**: opencode_messages_v1 (configurable via CHROMA_COLLECTION)
- **Documents**: Flattened message content for embedding
- **Metadata**: session_id, session_title, message_id, message_index, role, created_at, paths
- **IDs**: Format `${session_id}:${message_index}`

## Common Commands

### Index All Sessions
```bash
# Index all OpenCode sessions
pnpm -C packages/reconstituter opencode-sessions index

# Index with custom collection name
CHROMA_COLLECTION=my_sessions pnpm -C packages/reconstituter opencode-sessions index

# Index with different embedding model
OLLAMA_EMBED_MODEL=nomic-embed-text pnpm -C packages/reconstituter opencode-sessions index
```

### Search Sessions
```bash
# Basic search
pnpm -C packages/reconstituter opencode-sessions search "authentication flow"

# Get more results
pnpm -C packages/reconstituter opencode-sessions search "error handling patterns" --k 20

# Filter by specific session
pnpm -C packages/reconstituter opencode-sessions search "api design" --session ses_abc123

# Combine filters
pnpm -C packages/reconstituter opencode-sessions search "database schema" --k 5 --session ses_xyz789
```

### Indexer Service (PM2)
```bash
# Compile ecosystem configuration
pnpm generate-ecosystem

# Start or restart the indexer service
pm2 start ecosystem.config.cjs --only opencode-indexer
pm2 restart opencode-indexer

# Inspect logs
pm2 logs opencode-indexer --lines 100
```

### View Help
```bash
# Show all available commands and options
pnpm -C packages/reconstituter opencode-sessions help
```

## References
- CLI tool: `packages/reconstituter/src/opencode-sessions.ts`
- ChromaDB: https://docs.trychroma.com/
- Ollama embeddings: https://github.com/ollama/ollama/blob/main/docs/api.md#generate-embeddings

## Important Constraints
- **Caching**: Embeddings are cached in LevelDB with 30-day TTL
- **Incremental Indexing**: Only new/updated messages are re-indexed
- **Session Filtering**: Use `--session` to limit search to specific conversation
- **Batch Processing**: Embeddings generated in batches of 32 by default
- **Distance Metric**: ChromaDB uses cosine similarity (lower = more relevant)

## Error Handling
- **Missing ChromaDB**: Script fails if ChromaDB is not accessible
- **Missing Ollama**: Embedding generation fails if Ollama is not running
- **Empty Results**: Search returns "No matches found" if no results
- **Invalid Session**: Non-existent session ID returns no results
- **Network Errors**: Connection timeouts retry once before failing

## Output Format
Results are grouped by session_id with the following fields:
- **ID**: Unique message identifier (`${session_id}:${message_index}`)
- **Distance**: Cosine similarity distance (0.0 = exact match)
- **Message Index**: Position in conversation
- **Role**: Message author (user/assistant/system)
- **Session Title**: Human-readable session name
- **Created**: ISO timestamp of message creation
- **Paths**: Extracted file paths (pipe-separated)
- **Content**: Full message content
