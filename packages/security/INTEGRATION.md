# Security Integration Guide

This guide helps existing packages integrate the comprehensive input validation and secure file operations from `@promethean/security`.

## Quick Start

### 1. Install the Package

```bash
pnpm add @promethean/security
```

### 2. Replace Existing File Operations

Find and replace insecure file operations:

```typescript
// Before (insecure)
import { promises as fs } from 'fs';
import * as path from 'path';

async function readFile(root: string, userPath: string) {
  const fullPath = path.join(root, userPath);
  return await fs.readFile(fullPath, 'utf8');
}

// After (secure)
import { secureReadFile } from '@promethean/security';

async function readFile(root: string, userPath: string) {
  const result = await secureReadFile(root, userPath);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.content;
}
```

## Package-Specific Integration

### @promethean/mcp Package

The MCP package already has good security measures but can be enhanced:

```typescript
// packages/mcp/src/files.ts
import { validatePath, secureWriteFile, secureReadFile } from '@promethean/security';

// Replace existing normalizeToRoot function
export const normalizeToRoot = async (ROOT_PATH: string, rel: string) => {
  const result = await validatePath(ROOT_PATH, rel);
  if (!result.isValid) {
    throw new Error(result.error);
  }
  return result.normalizedPath!;
};

// Enhance writeFileContent
export const writeFileContent = async (ROOT_PATH: string, filePath: string, content: string) => {
  const result = await secureWriteFile(ROOT_PATH, filePath, content, {
    createParents: true,
    overwrite: true,
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return { path: result.relativePath };
};
```

### @promethean/utils Package

Update the basic file utilities:

```typescript
// packages/utils/src/files.ts
import { secureReadFile, secureWriteFile } from '@promethean/security';

export async function readText(p: string): Promise<string> {
  // For utils, we assume the caller has validated the path
  // But we can still add basic validation
  const result = await secureReadFile(path.dirname(p), path.basename(p));
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.content!;
}

export async function writeText(p: string, s: string): Promise<void> {
  const result = await secureWriteFile(path.dirname(p), path.basename(p), s, {
    createParents: true,
    overwrite: true,
  });

  if (!result.success) {
    throw new Error(result.error);
  }
}
```

### @promethean/piper Package

Enhance the file system utilities:

```typescript
// packages/piper/src/fsutils.ts
import { secureReadFile, secureWriteFile, validatePath } from '@promethean/security';

export async function readTextMaybe(p: string) {
  // Extract directory and filename for validation
  const dir = path.dirname(p);
  const file = path.basename(p);

  const result = await secureReadFile(dir, file);
  return result.success ? result.content : undefined;
}

export async function writeText(p: string, s: string) {
  const dir = path.dirname(p);
  const file = path.basename(p);

  const result = await secureWriteFile(dir, file, s, {
    createParents: true,
    overwrite: true,
  });

  if (!result.success) {
    throw new Error(result.error);
  }
}
```

### Web Applications

For web applications handling user uploads:

```typescript
// Example: Express.js route for file uploads
import { secureWriteFile, validatePath } from '@promethean/security';

app.post('/upload', async (req, res) => {
  try {
    const { filename, content } = req.body;
    const userDir = req.user.id; // Authenticated user directory

    // Validate filename
    const result = await secureWriteFile('/uploads', `${userDir}/${filename}`, content, {
      allowedExtensions: ['.txt', '.pdf', '.doc', '.docx'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      createParents: true,
      overwrite: false,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      message: 'File uploaded successfully',
      path: result.relativePath,
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});
```

## Migration Checklist

### Phase 1: Assessment

- [ ] Identify all file system operations in your package
- [ ] List user-controlled file paths
- [ ] Document current security measures
- [ ] Identify high-risk operations (uploads, deletions, etc.)

### Phase 2: Basic Integration

- [ ] Install `@promethean/security`
- [ ] Replace direct `fs` operations with secure alternatives
- [ ] Add basic path validation for user input
- [ ] Update error handling

### Phase 3: Enhanced Security

- [ ] Configure appropriate file extension restrictions
- [ ] Set file size limits
- [ ] Implement symlink policies
- [ ] Add dangerous name detection

### Phase 4: Testing

- [ ] Write security tests for path traversal attempts
- [ ] Test symlink escape scenarios
- [ ] Verify file extension enforcement
- [ ] Test error handling

### Phase 5: Documentation

- [ ] Update package documentation
- [ ] Document security configuration
- [ ] Add security best practices
- [ ] Create migration guide for users

## Common Patterns

### 1. Secure File Upload

```typescript
export async function handleUpload(
  rootDir: string,
  userPath: string,
  content: string,
  config: PathSecurityConfig = {},
) {
  const defaultConfig: PathSecurityConfig = {
    allowedExtensions: ['.txt', '.md', '.json', '.csv'],
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxDepth: 5,
    allowSymlinks: false,
    checkDangerousNames: true,
    ...config,
  };

  const result = await secureWriteFile(rootDir, userPath, content, {
    ...defaultConfig,
    createParents: true,
    overwrite: false,
  });

  if (!result.success) {
    throw new SecurityError(result.error);
  }

  return result;
}
```

### 2. Secure File Access

```typescript
export async function secureFileAccess(
  rootDir: string,
  userPath: string,
  config: PathSecurityConfig = {},
) {
  const result = await secureReadFile(rootDir, userPath, config);

  if (!result.success) {
    // Log security violations
    if (isSecurityError(result.error)) {
      console.warn('Security violation:', { path: userPath, error: result.error });
    }
    throw new SecurityError(result.error);
  }

  return result.content;
}

function isSecurityError(error?: string): boolean {
  return error
    ? error.includes('traversal') ||
        error.includes('escape') ||
        error.includes('symlink') ||
        error.includes('dangerous') ||
        error.includes('not allowed')
    : false;
}
```

### 3. Batch Operations

```typescript
export async function secureBatchUpload(
  rootDir: string,
  files: Array<{ path: string; content: string }>,
  config: PathSecurityConfig = {},
) {
  const operations = files.map(
    (file) => () =>
      secureWriteFile(rootDir, file.path, file.content, {
        ...config,
        createParents: true,
        overwrite: false,
      }),
  );

  const { results, errors } = await secureBatchOperation(operations, {
    continueOnError: true,
  });

  if (errors.length > 0) {
    console.warn('Some uploads failed:', errors);
  }

  return {
    successful: results.filter((r) => r.success),
    failed: errors,
  };
}
```

## Configuration Templates

### Document Repository

```typescript
const documentRepoConfig: PathSecurityConfig = {
  allowedExtensions: ['.pdf', '.doc', '.docx', '.txt', '.md', '.odt'],
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxDepth: 10,
  allowSymlinks: false,
  checkDangerousNames: true,
};
```

### Image Upload

```typescript
const imageUploadConfig: PathSecurityConfig = {
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  maxFileSize: 20 * 1024 * 1024, // 20MB
  maxDepth: 3,
  allowSymlinks: false,
  checkDangerousNames: true,
};
```

### Temporary Files

```typescript
const tempFileConfig: PathSecurityConfig = {
  allowedExtensions: ['.tmp', '.cache', '.temp'],
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxDepth: 2,
  allowSymlinks: false,
  checkDangerousNames: true,
};
```

### Configuration Files

```typescript
const configFilesConfig: PathSecurityConfig = {
  allowedExtensions: ['.json', '.yaml', '.yml', '.toml', '.ini', '.conf'],
  maxFileSize: 1024 * 1024, // 1MB
  maxDepth: 5,
  allowSymlinks: false,
  checkDangerousNames: true,
};
```

## Testing Security Integration

### Unit Tests

```typescript
import test from 'ava';
import { secureWriteFile } from '@promethean/security';

test('prevents path traversal attacks', async (t) => {
  const maliciousPaths = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '....//....//etc/passwd',
  ];

  for (const maliciousPath of maliciousPaths) {
    const result = await secureWriteFile('/safe/root', maliciousPath, 'content');
    t.false(result.success);
    t.true(result.error?.includes('traversal') || result.error?.includes('escape'));
  }
});

test('respects file extension restrictions', async (t) => {
  const config = {
    allowedExtensions: ['.txt'],
    blockedExtensions: ['.exe'],
  };

  const validResult = await secureWriteFile('/safe/root', 'test.txt', 'content', config);
  t.true(validResult.success);

  const invalidResult = await secureWriteFile('/safe/root', 'test.exe', 'content', config);
  t.false(invalidResult.success);
});
```

### Integration Tests

```typescript
test('integration: secure file upload workflow', async (t) => {
  const uploadDir = await createTempDirectory();

  // Simulate user upload
  const result = await secureWriteFile(uploadDir, 'user/document.txt', 'content', {
    allowedExtensions: ['.txt'],
    createParents: true,
  });

  t.true(result.success);

  // Verify file exists and is accessible
  const readResult = await secureReadFile(uploadDir, 'user/document.txt');
  t.true(readResult.success);
  t.is(readResult.content, 'content');
});
```

## Monitoring and Logging

### Security Event Logging

```typescript
import { secureWriteFile } from '@promethean/security';

function logSecurityEvent(event: string, details: Record<string, any>) {
  console.warn('[SECURITY]', event, details);
  // Send to security monitoring system
}

export async function monitoredSecureWrite(root: string, path: string, content: string) {
  const result = await secureWriteFile(root, path, content);

  if (!result.success) {
    if (isSecurityViolation(result.error)) {
      logSecurityEvent('FILE_OPERATION_BLOCKED', {
        operation: 'write',
        path,
        error: result.error,
        timestamp: new Date().toISOString(),
      });
    }
    throw new Error(result.error);
  }

  return result;
}

function isSecurityViolation(error?: string): boolean {
  return error
    ? error.includes('traversal') ||
        error.includes('escape') ||
        error.includes('symlink') ||
        error.includes('dangerous')
    : false;
}
```

## Performance Considerations

### Caching Validation Results

For frequently accessed paths, consider caching validation results:

```typescript
const validationCache = new Map<string, PathValidationResult>();

async function cachedValidatePath(root: string, path: string, config?: PathSecurityConfig) {
  const cacheKey = `${root}:${path}:${JSON.stringify(config)}`;

  if (validationCache.has(cacheKey)) {
    return validationCache.get(cacheKey)!;
  }

  const result = await validatePath(root, path, config);
  validationCache.set(cacheKey, result);

  // Clear cache after 5 minutes
  setTimeout(() => validationCache.delete(cacheKey), 5 * 60 * 1000);

  return result;
}
```

### Batch Validation

When validating multiple paths, use batch operations:

```typescript
// Instead of:
for (const path of paths) {
  await validatePath(root, path);
}

// Use:
const results = await validatePaths(root, paths);
const invalidPaths = results.filter((r) => !r.isValid).map((r) => r.error);

if (invalidPaths.length > 0) {
  throw new Error(`Invalid paths: ${invalidPaths.join(', ')}`);
}
```

## Troubleshooting

### Common Issues

1. **"Path outside root" errors**

   - Check if the root path is correctly resolved
   - Verify the input path doesn't contain traversal sequences

2. **"Symbolic links are not allowed" errors**

   - Set `allowSymlinks: true` if symlinks are needed
   - Ensure symlink targets are within the root directory

3. **Performance issues**
   - Use batch validation for multiple paths
   - Consider caching validation results
   - Adjust `maxDepth` to reasonable values

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
const debugResult = await validatePath(root, path, {
  ...config,
  // Add debug logging
});

console.log('Validation result:', debugResult);
```

This integration guide provides a comprehensive approach to securing file operations across the Promethean Framework.
