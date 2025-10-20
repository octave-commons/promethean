# @promethean/embedding-cache

Embedding-based cache for LLM prompt/response caching with similarity matching.

## Features

- **Similarity-based caching**: Uses cosine similarity to find semantically similar prompts
- **Model isolation**: Separate cache instances per model for proper isolation
- **TTL support**: Time-based expiration for cache entries
- **Level-cache compatible interface**: Drop-in replacement for key-value caches
- **Statistics tracking**: Built-in hit rate and usage statistics
- **Configurable thresholds**: Adjustable similarity thresholds and cache limits

## Installation

```bash
pnpm add @promethean/embedding-cache
```

## Usage

### Basic Usage

```typescript
import { createEmbeddingCache } from '@promethean/embedding-cache';

// Create cache for a specific model
const cache = createEmbeddingCache('llama2', {
  similarityThreshold: 0.85,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  maxSize: 1000,
});

// Store a response
await cache.set(
  'What is the capital of France?',
  'Paris is the capital of France.'
);

// Retrieve with similarity matching
const response = await cache.get("Tell me about France's capital");
console.log(response); // 'Paris is the capital of France.' (if similarity >= threshold)
```

### Advanced Usage with Details

```typescript
import { EmbeddingCache } from '@promethean/embedding-cache';

const cache = new EmbeddingCache('gpt-4', {
  similarityThreshold: 0.9,
  enableEmbedding: true,
});

// Get detailed information about cache hit
const result = await cache.getWithDetails('Some prompt');
if (result.hit) {
  console.log(`Found with similarity: ${result.similarity}`);
  console.log(`Response: ${result.value}`);
}
```

### Cache without Embeddings (Exact Match)

```typescript
const cache = new EmbeddingCache('model', {
  enableEmbedding: false, // Use exact key matching only
});

await cache.set('exact-key', 'exact-value');
const value = await cache.get('exact-key'); // Only matches exact keys
```

### Statistics

```typescript
const stats = cache.getStats();
console.log(`Cache size: ${stats.size}`);
console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
console.log(`Hits: ${stats.hits}, Misses: ${stats.misses}`);

// Reset statistics
cache.resetStats();
```

## API Reference

### EmbeddingCache<T>

#### Constructor

```typescript
new EmbeddingCache(modelName: string, options?: CacheOptions)
```

- `modelName`: Ollama model name for generating embeddings
- `options`: Configuration options

#### Options

```typescript
interface CacheOptions {
  similarityThreshold?: number; // Default: 0.85
  maxAge?: number; // Default: 24 hours (ms)
  maxSize?: number; // Default: 1000
  enableEmbedding?: boolean; // Default: true
}
```

#### Methods

- `get(key: string): Promise<T | undefined>` - Get value by key
- `getWithDetails(key: string): Promise<CacheResult<T>>` - Get with similarity info
- `set(key: string, value: T, ttl?: number): Promise<void>` - Store value
- `has(key: string): Promise<boolean>` - Check if key exists
- `delete(key: string): Promise<boolean>` - Delete entry
- `clear(): Promise<void>` - Clear all entries
- `getStats(): CacheStats` - Get cache statistics
- `resetStats(): void` - Reset statistics
- `size: number` - Current cache size

### Factory Functions

- `createEmbeddingCache<T>(modelName, options?)` - Create cache instance
- `createDefaultCache<T>(modelName)` - Create cache with default options

## Types

```typescript
interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  memoryUsage?: number;
}

interface CacheResult<T> {
  hit: boolean;
  value?: T;
  similarity?: number;
}
```

## Use Cases

### LLM Response Caching

Cache LLM responses to avoid redundant API calls for similar prompts:

```typescript
const cache = createEmbeddingCache('llama2');

// Check cache first
const cached = await cache.get(userPrompt);
if (cached) {
  return cached;
}

// Generate response and cache it
const response = await generateLLMResponse(userPrompt);
await cache.set(userPrompt, response);
return response;
```

### Code Generation Caching

Cache code generation results for similar requests:

```typescript
const codeCache = createEmbeddingCache('codellama', {
  similarityThreshold: 0.9, // Higher threshold for code
});

const cachedCode = await codeCache.get(
  'Create a TypeScript function for validation'
);
if (cachedCode) {
  return cachedCode;
}
```

### Multi-Model Caching

Create separate caches for different models:

```typescript
const llamaCache = createEmbeddingCache('llama2');
const codexCache = createEmbeddingCache('codellama');
const gptCache = createEmbeddingCache('gpt-4');
```

## Performance Considerations

- **Embedding Generation**: First cache miss for a key requires embedding generation
- **Memory Usage**: Cache stores embeddings in memory; monitor with `getStats()`
- **Similarity Threshold**: Lower thresholds increase hit rates but may reduce relevance
- **Cache Size**: Set appropriate `maxSize` to balance memory and performance

## Limitations

- Uses `InMemoryChroma` for storage (not persistent)
- Delete and clear operations are placeholders (not implemented)
- Requires Ollama server for embedding generation
- Embedding generation failures fall back to cache misses

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## License

Private package for Promethean Framework internal use.
