# DirectoryAdapter

The DirectoryAdapter provides a secure, centralized interface for all task file operations in the Promethean Framework. It implements comprehensive security validation, automated backup, performance monitoring, and seamless integration with the existing caching layer.

## Features

### 🔒 Security
- **Path Traversal Protection**: Prevents directory traversal attacks
- **File Type Validation**: Restricts operations to allowed file types
- **Content Security**: Scans for dangerous content patterns (XSS, scripts, etc.)
- **Size Limits**: Enforces maximum file size limits
- **Authentication**: Optional user authentication requirements
- **Audit Logging**: Comprehensive audit trail for all operations

### 💾 Backup & Recovery
- **Automated Backups**: Automatic backup creation before modifications
- **Integrity Verification**: SHA-256 hash verification for backup integrity
- **Compression Support**: Optional compression for backup storage
- **Retention Policies**: Configurable backup retention periods
- **Restore Operations**: Full restore capabilities with verification

### ⚡ Performance
- **Caching Integration**: Seamless integration with `@promethean/level-cache`
- **Streaming Support**: Efficient handling of large result sets
- **Batch Operations**: Optimized batch processing capabilities
- **Metrics Tracking**: Detailed performance metrics and monitoring
- **Concurrent Safety**: Thread-safe concurrent operations

### 🛠️ Operations
- **CRUD Operations**: Create, read, update, delete task files
- **Search & Filter**: Advanced search and filtering capabilities
- **Move & Rename**: Safe file moving and renaming
- **Validation**: Comprehensive file structure validation
- **Listing**: Paginated and filtered file listing

## Quick Start

```typescript
import { createDirectoryAdapter, getConfig } from '@promethean/kanban/lib/directory-adapter';
import { createTaskCache } from '@promethean/kanban/board/task-cache';

// Get configuration for your environment
const config = getConfig('development');

// Create cache (optional but recommended)
const cache = await createTaskCache({
  path: './cache',
  namespace: 'tasks'
});

// Create directory adapter
const adapter = createDirectoryAdapter(config, cache);

// Use the adapter
const task = {
  uuid: 'task-123',
  title: 'New Task',
  status: 'todo',
  priority: 'medium',
  content: '# Task Description\n\nThis is a new task.'
};

// Create a task file
const result = await adapter.createTaskFile(task);
if (result.success) {
  console.log('Task created successfully');
} else {
  console.error('Failed to create task:', result.error);
}
```

## Configuration

### Basic Configuration

```typescript
const config = {
  baseDirectory: 'docs/agile/tasks',
  security: {
    level: 'strict', // 'strict' | 'moderate' | 'permissive'
    allowedExtensions: ['.md'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowPathTraversal: false,
    allowSymlinks: false,
    requireAuthentication: false,
    auditLog: true
  },
  backup: {
    enabled: true,
    directory: 'docs/agile/tasks/backups',
    retentionDays: 30
  },
  cache: {
    enabled: true,
    ttl: 24 * 60 * 60 * 1000 // 24 hours
  },
  performance: {
    enableStreaming: true,
    batchSize: 100,
    maxConcurrentOps: 10
  }
};
```

### Environment-Specific Configurations

```typescript
import { getConfig, createConfig } from '@promethean/kanban/lib/directory-adapter';

// Pre-configured environments
const devConfig = getConfig('development');
const prodConfig = getConfig('production');
const testConfig = getConfig('test');

// Custom configuration with overrides
const customConfig = createConfig(devConfig, {
  security: {
    level: 'strict',
    requireAuthentication: true
  },
  backup: {
    retentionDays: 90
  }
});
```

## API Reference

### Task File Operations

#### `createTaskFile(task: IndexedTask): Promise<FileOperationResult<void>>`
Creates a new task file with full security validation.

```typescript
const result = await adapter.createTaskFile({
  uuid: 'unique-id',
  title: 'Task Title',
  status: 'todo',
  priority: 'medium',
  content: '# Task Description\n\nContent here...'
});
```

#### `readTaskFile(uuid: string): Promise<FileOperationResult<IndexedTask>>`
Reads a task file with cache integration.

```typescript
const result = await adapter.readTaskFile('task-uuid');
if (result.success) {
  const task = result.data;
  console.log('Task title:', task.title);
}
```

#### `updateTaskFile(uuid: string, updates: Partial<IndexedTask>): Promise<FileOperationResult<void>>`
Updates an existing task file with automatic backup.

```typescript
const result = await adapter.updateTaskFile('task-uuid', {
  title: 'Updated Title',
  status: 'in_progress'
});
```

#### `deleteTaskFile(uuid: string): Promise<FileOperationResult<void>>`
Deletes a task file with backup creation.

```typescript
const result = await adapter.deleteTaskFile('task-uuid');
```

#### `moveTaskFile(uuid: string, newTitle: string): Promise<FileOperationResult<void>>`
Moves/renames a task file safely.

```typescript
const result = await adapter.moveTaskFile('task-uuid', 'New Task Title');
```

### Search and Listing

#### `listTaskFiles(options?: ListOptions): Promise<FileOperationResult<IndexedTask[]>>`
Lists task files with filtering and pagination.

```typescript
const result = await adapter.listTaskFiles({
  filter: {
    status: ['todo', 'in_progress'],
    priority: ['high', 'medium']
  },
  sort: {
    field: 'created',
    order: 'desc'
  },
  pagination: {
    offset: 0,
    limit: 50
  }
});
```

#### `searchTaskFiles(query: string, options?: SearchOptions): Promise<FileOperationResult<IndexedTask[]>>`
Searches task files by content.

```typescript
const result = await adapter.searchTaskFiles('database migration', {
  fields: ['title', 'content'],
  fuzzy: true,
  limit: 20
});
```

### Validation and Backup

#### `validateTaskFile(uuid: string): Promise<FileOperationResult<TaskValidationResult>>`
Validates task file structure and content.

```typescript
const result = await adapter.validateTaskFile('task-uuid');
if (result.success) {
  console.log('Validation result:', result.data);
}
```

#### `backupTaskFile(uuid: string, reason?: string): Promise<FileOperationResult<string>>`
Creates a manual backup of a task file.

```typescript
const result = await adapter.backupTaskFile('task-uuid', 'Manual backup before major changes');
```

### Monitoring and Metrics

#### `getPerformanceMetrics(): PerformanceMetrics`
Gets performance and usage metrics.

```typescript
const metrics = adapter.getPerformanceMetrics();
console.log('Total operations:', metrics.totalOperations);
console.log('Cache hit rate:', metrics.cacheHitRate);
console.log('Error rates:', metrics.errorRates);
```

#### `getAuditLog(): AuditLogEntry[]`
Gets the audit log of all operations.

```typescript
const auditLog = adapter.getAuditLog();
const recentOperations = auditLog.filter(entry => 
  entry.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
);
```

## Security Features

### Path Validation
The DirectoryAdapter prevents path traversal attacks through multiple validation layers:

```typescript
// These will be blocked:
'../../../etc/passwd'
'..%2f..%2fetc%2fpasswd'  // URL encoded
'/etc/passwd'             // Absolute paths outside base directory
```

### Content Security
Dangerous content patterns are automatically detected and blocked:

```typescript
// These will be flagged as dangerous:
'<script>alert("xss")</script>'
'javascript:alert("xss")'
'<iframe src="evil.com"></iframe>'
```

### File Type Restrictions
Only allowed file extensions are permitted:

```typescript
const config = {
  security: {
    allowedExtensions: ['.md', '.markdown'] // Only markdown files
  }
};
```

## Error Handling

The DirectoryAdapter provides comprehensive error handling with specific error types:

```typescript
import { 
  DirectoryAdapterError,
  SecurityValidationError,
  FileNotFoundError,
  FilePermissionError 
} from '@promethean/kanban/lib/directory-adapter';

try {
  const result = await adapter.readTaskFile('non-existent');
  if (!result.success) {
    if (result.error?.includes('not found')) {
      // Handle file not found
    } else if (result.error?.includes('security')) {
      // Handle security violations
    }
  }
} catch (error) {
  if (error instanceof SecurityValidationError) {
    console.error('Security violation:', error.securityIssues);
  } else if (error instanceof FileNotFoundError) {
    console.error('File not found:', error.path);
  }
}
```

## Integration with Existing Systems

### With TaskCache
The DirectoryAdapter integrates seamlessly with the existing TaskCache:

```typescript
import { createTaskCache } from '@promethean/kanban/board/task-cache';

const cache = await createTaskCache({
  path: './cache',
  namespace: 'tasks'
});

const adapter = createDirectoryAdapter(config, cache);

// Operations automatically use cache when available
const result = await adapter.readTaskFile('task-uuid'); // Cache hit if available
```

### With Existing Kanban System
Replace direct file operations with DirectoryAdapter calls:

```typescript
// Before (direct file access)
import { promises as fs } from 'fs';
const content = await fs.readFile(`docs/agile/tasks/${uuid}.md`, 'utf8');

// After (secure with caching)
const result = await adapter.readTaskFile(uuid);
const content = result.data?.content;
```

## Testing

The DirectoryAdapter includes comprehensive tests:

```bash
# Run all tests
pnpm test

# Run specific test files
pnpm test packages/kanban/src/lib/directory-adapter/tests/adapter.test.ts
pnpm test packages/kanban/src/lib/directory-adapter/tests/security.test.ts
pnpm test packages/kanban/src/lib/directory-adapter/tests/backup.test.ts
```

## Best Practices

### 1. Always Use the Adapter
Never bypass the DirectoryAdapter for file operations. All file access should go through the adapter to ensure security and consistency.

### 2. Configure Appropriately for Environment
Use different security levels for different environments:
- **Development**: `moderate` level, relaxed security for easier testing
- **Production**: `strict` level, maximum security
- **Testing**: `permissive` level, minimal security for test speed

### 3. Monitor Performance
Regularly check performance metrics to identify issues:

```typescript
const metrics = adapter.getPerformanceMetrics();
if (metrics.cacheHitRate < 0.5) {
  console.warn('Low cache hit rate - consider cache tuning');
}
```

### 4. Handle Errors Gracefully
Always check operation results and handle errors appropriately:

```typescript
const result = await adapter.createTaskFile(task);
if (!result.success) {
  logger.error('Task creation failed', { 
    error: result.error,
    path: result.metadata.path,
    operation: result.metadata.operation 
  });
  // Handle error appropriately
}
```

### 5. Use Backups
Enable backups in production to prevent data loss:

```typescript
const config = {
  backup: {
    enabled: true,
    directory: './backups',
    retentionDays: 90 // Keep backups for 90 days
  }
};
```

## Migration Guide

To migrate existing code to use DirectoryAdapter:

1. **Replace direct file operations**:
   ```typescript
   // Old
   const content = await fs.readFile(filePath, 'utf8');
   
   // New
   const result = await adapter.readTaskFile(uuid);
   const content = result.data?.content;
   ```

2. **Add error handling**:
   ```typescript
   if (!result.success) {
     throw new Error(`Operation failed: ${result.error}`);
   }
   ```

3. **Update configuration**:
   ```typescript
   const config = getConfig(process.env.NODE_ENV);
   const adapter = createDirectoryAdapter(config, cache);
   ```

4. **Add monitoring**:
   ```typescript
   // Log metrics periodically
   setInterval(() => {
     const metrics = adapter.getPerformanceMetrics();
     logger.info('DirectoryAdapter metrics', metrics);
   }, 60000); // Every minute
   ```

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure the process has write access to the base directory and backup directory.
2. **Cache Issues**: Clear cache if tasks are not appearing: `await cache.rebuildIndex()`
3. **Security Violations**: Check file paths and content for security issues. Use `moderate` security level in development if needed.
4. **Performance Issues**: Enable caching and check metrics for bottlenecks.

### Debug Mode

Enable debug logging:

```typescript
import { createLogger } from '@promethean/utils';

const logger = createLogger({ 
  service: 'directory-adapter',
  level: 'debug'
});
```

This will provide detailed logging of all operations and security validations.