# Configuration Guide

This document provides comprehensive configuration information for the `@promethean/indexer-service` package, including environment variables, deployment options, and best practices.

## Environment Variables

All configuration is managed through environment variables. The service validates required variables on startup and provides sensible defaults for optional settings.

### Required Variables

#### `INDEX_ROOT` / `ROOT_PATH`

The root directory to index. This is the primary directory that the indexer will scan and process.

```bash
# Required: Set the root directory for indexing
export INDEX_ROOT="/path/to/your/project"

# Alternative: ROOT_PATH is also supported as a fallback
export ROOT_PATH="/path/to/your/project"
```

**Priority:** `INDEX_ROOT` → `ROOT_PATH` → `process.cwd()`

**Examples:**

```bash
# Development
export INDEX_ROOT="/home/user/dev/my-project"

# Production
export INDEX_ROOT="/data/app/source-code"

# Docker
export INDEX_ROOT="/app"
```

### Optional Variables

#### `INDEX_CACHE_PATH` / `INDEXER_CACHE_PATH`

Directory for storing indexer cache and state files.

```bash
# Default: $INDEX_ROOT/.cache/indexer-service
export INDEX_CACHE_PATH="/var/cache/indexer"

# Alternative: INDEXER_CACHE_PATH is also supported
export INDEXER_CACHE_PATH="/tmp/indexer-cache"
```

**Priority:** `INDEX_CACHE_PATH` → `INDEXER_CACHE_PATH` → `$INDEX_ROOT/.cache/indexer-service`

#### `PORT`

HTTP port for the service to listen on.

```bash
# Default: 4260
export PORT=8080
```

**Valid Range:** 1-65535
**Validation:** Must be a positive integer

#### `HOST`

Network interface to bind the service to.

```bash
# Default: 0.0.0.0 (all interfaces)
export HOST="127.0.0.1"  # Localhost only
export HOST="0.0.0.0"    # All interfaces
export HOST="10.0.1.100" # Specific IP
```

#### `LOG_LEVEL`

Logging verbosity level.

```bash
# Default: info
export LOG_LEVEL="debug"   # Verbose logging
export LOG_LEVEL="info"    # Standard logging
export LOG_LEVEL="warn"    # Warnings and errors only
export LOG_LEVEL="error"   # Errors only
```

**Valid Values:** `debug`, `info`, `warn`, `error`

#### `ENABLE_DOCS`

Enable/disable OpenAPI documentation endpoints.

```bash
# Default: true
export ENABLE_DOCS="true"   # Enable /openapi.json endpoint
export ENABLE_DOCS="false"  # Disable documentation
```

**Note:** When disabled, the `/openapi.json` endpoint will return 404.

#### `ENABLE_RATE_LIMIT`

Enable/disable request rate limiting.

```bash
# Default: true
export ENABLE_RATE_LIMIT="true"   # Enable rate limiting
export ENABLE_RATE_LIMIT="false"  # Disable rate limiting
```

**Rate Limit Settings (when enabled):**

- Max requests: 100 per minute
- Window: 1 minute
- Per IP address

## Configuration Examples

### Development Environment

```bash
# .env.development
INDEX_ROOT="/home/user/dev/my-project"
PORT=4260
HOST="127.0.0.1"
LOG_LEVEL="debug"
ENABLE_DOCS="true"
ENABLE_RATE_LIMIT="false"
INDEX_CACHE_PATH="/tmp/indexer-dev-cache"
```

### Production Environment

```bash
# .env.production
INDEX_ROOT="/data/app/source-code"
PORT=8080
HOST="0.0.0.0"
LOG_LEVEL="info"
ENABLE_DOCS="false"
ENABLE_RATE_LIMIT="true"
INDEX_CACHE_PATH="/var/cache/indexer"
```

### Docker Environment

```dockerfile
# Dockerfile
FROM node:18-alpine

# Set environment variables
ENV INDEX_ROOT="/app"
ENV PORT=4260
ENV HOST="0.0.0.0"
ENV LOG_LEVEL="info"
ENV ENABLE_DOCS="true"
ENV ENABLE_RATE_LIMIT="true"

WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm build

EXPOSE 4260
CMD ["pnpm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  indexer-service:
    build: .
    ports:
      - '4260:4260'
    environment:
      - INDEX_ROOT=/data
      - LOG_LEVEL=info
      - ENABLE_RATE_LIMIT=true
    volumes:
      - ./source-code:/data:ro
      - indexer-cache:/var/cache/indexer
    restart: unless-stopped

volumes:
  indexer-cache:
```

### Kubernetes Environment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: indexer-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: indexer-service
  template:
    metadata:
      labels:
        app: indexer-service
    spec:
      containers:
        - name: indexer-service
          image: indexer-service:latest
          ports:
            - containerPort: 4260
          env:
            - name: INDEX_ROOT
              value: '/data'
            - name: PORT
              value: '4260'
            - name: HOST
              value: '0.0.0.0'
            - name: LOG_LEVEL
              value: 'info'
            - name: ENABLE_DOCS
              value: 'false'
            - name: ENABLE_RATE_LIMIT
              value: 'true'
            - name: INDEX_CACHE_PATH
              value: '/var/cache/indexer'
          volumeMounts:
            - name: source-code
              mountPath: /data
              readOnly: true
            - name: cache
              mountPath: /var/cache/indexer
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
      volumes:
        - name: source-code
          configMap:
            name: source-code
        - name: cache
          emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: indexer-service
spec:
  selector:
    app: indexer-service
  ports:
    - port: 80
      targetPort: 4260
  type: ClusterIP
```

## Configuration Validation

The service performs comprehensive validation on startup:

### Required Variable Validation

```typescript
function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}
```

### Port Validation

```typescript
const port = Number(process.env.PORT || 4260);
// Validates that port is a positive integer
return {
  port: Number.isFinite(port) && port > 0 ? port : 4260,
  // ...
};
```

### Log Level Validation

```typescript
function normalizeLevel(raw: string): Level {
  const value = raw.toLowerCase() as Level;
  const LEVELS = new Set<Level>(['debug', 'info', 'warn', 'error']);
  return LEVELS.has(value) ? value : 'info';
}
```

## Runtime Configuration

### Server Options

The `buildServer` function accepts runtime configuration options:

```typescript
interface BuildServerOptions {
  rootPath?: string;
  cachePath?: string;
  port?: number;
  host?: string;
  logLevel?: string;
  enableDocs?: boolean;
  enableRateLimit?: boolean;
}

// Override environment variables
const { app, manager, config } = await buildServer({
  port: 3000,
  logLevel: 'debug',
  enableRateLimit: false,
});
```

### Client Configuration

The TypeScript client can be configured with custom options:

```typescript
import { createIndexerServiceClient } from '@promethean/indexer-service/client';

const client = createIndexerServiceClient({
  baseUrl: 'https://indexer.example.com',
  headers: {
    Authorization: 'Bearer your-api-key',
    'User-Agent': 'MyApp/1.0',
  },
  fetchImpl: customFetchImplementation,
});
```

## Security Configuration

### Rate Limiting

When rate limiting is enabled, the following settings apply:

```typescript
// Default rate limit configuration
{
  max: 100,           // Maximum requests per window
  timeWindow: "1 minute"  // Time window for rate limiting
}
```

### Path Security

The service includes built-in path traversal protection:

```typescript
function isSafeRelPath(rel: string): boolean {
  return (
    typeof rel === 'string' &&
    rel.length > 0 &&
    rel.length < 256 &&
    !rel.split(/[\\/]/).includes('..') &&
    !path.isAbsolute(rel)
  );
}
```

### CORS Configuration

For cross-origin requests, configure CORS in your Fastify setup:

```typescript
import cors from '@fastify/cors';

await app.register(cors, {
  origin: ['https://yourdomain.com'],
  credentials: true,
});
```

## Performance Configuration

### Cache Configuration

Optimize cache settings for your deployment:

```bash
# High-performance SSD cache
export INDEX_CACHE_PATH="/nvme/indexer-cache"

# Network-attached storage
export INDEX_CACHE_PATH="/mnt/nfs/cache/indexer"

# Temporary directory (for testing)
export INDEX_CACHE_PATH="/tmp/indexer-test"
```

### Memory Configuration

Monitor and adjust memory usage:

```bash
# Node.js memory limits
export NODE_OPTIONS="--max-old-space-size=2048"

# V8 optimization
export NODE_OPTIONS="--optimize-for-size"
```

### Connection Configuration

For high-traffic deployments:

```bash
# Increase connection limits
export UV_THREADPOOL_SIZE=16

# Enable HTTP keep-alive
export HTTP_KEEP_ALIVE=true
```

## Monitoring Configuration

### Health Check Configuration

The health endpoint can be customized:

```typescript
app.get('/health', async (_req, reply) => {
  // Add custom health checks
  const dbStatus = await checkDatabase();
  const cacheStatus = await checkCache();

  reply.send({
    ok: dbStatus && cacheStatus,
    checks: {
      database: dbStatus,
      cache: cacheStatus,
    },
  });
});
```

### Logging Configuration

Structured logging with custom fields:

```typescript
const logger = createLogger({
  service: 'indexer-service',
  level: config.logLevel,
  // Add custom metadata
  version: process.env.APP_VERSION,
  environment: process.env.NODE_ENV,
});
```

## Troubleshooting Configuration

### Common Issues

#### Missing INDEX_ROOT

```
Error: Missing required environment variable INDEX_ROOT
```

**Solution:** Set the INDEX_ROOT environment variable:

```bash
export INDEX_ROOT="/path/to/your/files"
```

#### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::4260
```

**Solution:** Change the port or stop the conflicting service:

```bash
export PORT=8080
# or
sudo lsof -ti:4260 | xargs kill -9
```

#### Permission Denied

```
Error: EACCES: permission denied, mkdir '/var/cache/indexer'
```

**Solution:** Ensure proper permissions or use a different cache path:

```bash
sudo mkdir -p /var/cache/indexer
sudo chown $USER:$USER /var/cache/indexer
# or
export INDEX_CACHE_PATH="$HOME/.cache/indexer"
```

### Debug Configuration

Enable debug logging for troubleshooting:

```bash
export LOG_LEVEL="debug"
export NODE_OPTIONS="--trace-warnings"
```

### Configuration Validation

Test your configuration before starting:

```bash
# Create a test script
node -e "
const { loadConfig } = require('./dist/config.js');
try {
  const config = loadConfig();
  console.log('Configuration valid:', config);
} catch (error) {
  console.error('Configuration error:', error.message);
  process.exit(1);
}
"
```

## Best Practices

### Environment Management

1. **Use .env files** for local development
2. **Use secrets management** for production
3. **Validate configuration** on startup
4. **Document all variables** for your team

### Security

1. **Principle of least privilege** for file system access
2. **Enable rate limiting** in production
3. **Use HTTPS** for external communication
4. **Regular security updates** for dependencies

### Performance

1. **Use SSD storage** for cache directory
2. **Monitor memory usage** and set appropriate limits
3. **Enable compression** for large responses
4. **Use connection pooling** for high traffic

### Monitoring

1. **Enable structured logging** for log aggregation
2. **Set up health checks** for load balancers
3. **Monitor key metrics** (response time, error rate)
4. **Set up alerts** for critical failures

This configuration guide provides all the information needed to successfully deploy and configure the indexer service in various environments.
