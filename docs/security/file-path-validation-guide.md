# Comprehensive File Path Validation Implementation Guide

**Version**: 1.0  
**Last Updated**: 2025-10-16  
**Package**: `@promethean/security`  
**Security Classification**: Internal Documentation

---

## 📋 Overview

This guide provides comprehensive documentation for implementing secure file path validation in the Promethean framework. The file path validation system is designed to prevent common security vulnerabilities including path traversal attacks, unauthorized file access, and malicious file operations.

### 🎯 Objectives

- **Prevent Path Traversal**: Block attempts to access files outside designated directories
- **Validate File Operations**: Ensure all file operations are within allowed boundaries
- **Sanitize Input**: Clean and normalize file paths to prevent injection attacks
- **Provide Secure APIs**: Offer safe alternatives to dangerous file system operations
- **Enable Auditing**: Track and log file access attempts for security monitoring

### 🏗️ Architecture

```
@promethean/security
├── src/
│   ├── path-validation.ts          # Core validation engine
│   ├── secure-file-operations.ts   # Safe file operation wrappers
│   ├── policy.ts                   # Security policy framework
│   └── testing/
│       ├── path-validation.test.ts
│       ├── secure-file-operations.test.ts
│       └── integration-security-comprehensive.test.ts
```

---

## 🔧 Technical Implementation

### Core Components

#### 1. Path Validation Engine (`path-validation.ts`)

The validation engine provides comprehensive path security checks:

```typescript
import { validatePath, PathSecurityConfig, PathValidationResult } from '@promethean/security';

// Basic validation
const result = await validatePath('/safe/root', '../etc/passwd');
if (!result.isValid) {
  console.error('Path validation failed:', result.error);
}

// With custom configuration
const config: PathSecurityConfig = {
  maxDepth: 10,
  allowSymlinks: false,
  blockedExtensions: ['.exe', '.bat', '.sh'],
  maxFileSize: 50 * 1024 * 1024, // 50MB
};

const secureResult = await validatePath('/safe/root', 'user/file.txt', config);
```

#### 2. Secure File Operations (`secure-file-operations.ts`)

Safe wrappers for common file operations:

```typescript
import { 
  secureReadFile, 
  secureWriteFile, 
  secureDeleteFile,
  SecureFileOptions 
} from '@promethean/security';

const options: SecureFileOptions = {
  createParents: true,
  overwrite: false,
  mode: 0o644,
  maxFileSize: 10 * 1024 * 1024,
};

// Secure file read
const readResult = await secureReadFile('/data', 'documents/report.txt', options);
if (readResult.success) {
  console.log('File content:', readResult.content);
}

// Secure file write
const writeResult = await secureWriteFile('/data', 'documents/new.txt', 'content', options);
if (writeResult.success) {
  console.log('File written to:', writeResult.absolutePath);
}
```

#### 3. Security Policy Framework (`policy.ts`)

Policy-based access control for file operations:

```typescript
import { makePolicy, PolicyConfig } from '@promethean/security';

const policyConfig: PolicyConfig = {
  permissionGate: async (subject, action) => {
    // Implement your permission logic here
    return subject.startsWith('user:') && ['read', 'write'].includes(action);
  },
  rules: [
    async ({ subject, action, resource }) => {
      // Custom validation rules
      if (resource?.includes('sensitive') && action === 'write') {
        throw new NotAllowedError('Cannot write to sensitive resources');
      }
    }
  ]
};

const policy = makePolicy(policyConfig);
await policy.assertAllowed('user:123', 'read', '/data/documents');
```

---

## 🛡️ Security Features

### 1. Path Traversal Prevention

The system prevents various path traversal attacks:

```typescript
// Blocked patterns
const dangerousPaths = [
  '../../../etc/passwd',           // Classic traversal
  '..\\..\\windows\\system32',     // Windows traversal
  '/etc/passwd',                   // Absolute path escape
  'folder/../../../secret',        // Traversal in middle
  'normal/..\\..\\etc/passwd',     // Mixed path separators
];

// All will be blocked
for (const path of dangerousPaths) {
  const result = await validatePath('/safe/root', path);
  console.log(`${path}: ${result.isValid ? 'ALLOWED' : 'BLOCKED'}`);
}
```

### 2. File Extension Control

Control allowed and blocked file types:

```typescript
const config: PathSecurityConfig = {
  // Block dangerous executables
  blockedExtensions: ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'],
  
  // Allow only specific document types
  allowedExtensions: ['.txt', '.md', '.json', '.csv'],
  
  // Or allow everything except blocked
  allowedExtensions: [], // Empty means allow all non-blocked
};
```

### 3. Symbolic Link Security

Prevent symlink-based attacks:

```typescript
const secureConfig: PathSecurityConfig = {
  allowSymlinks: false, // Default: false for security
};

// With symlinks allowed (use with caution)
const symlinkConfig: PathSecurityConfig = {
  allowSymlinks: true,
  // The system will validate the entire symlink chain
};

// Symlink chain validation prevents:
// /safe/root/link -> /etc/passwd
// /safe/root/link -> /tmp/link2 -> /etc/passwd
// Circular symlinks
```

### 4. File Size Limits

Prevent resource exhaustion:

```typescript
const sizeConfig: PathSecurityConfig = {
  maxFileSize: 100 * 1024 * 1024, // 100MB default
};

// The system checks file size during:
// - File write operations
// - File read operations (for existing files)
// - File copy operations
```

### 5. Dangerous Name Detection

Block problematic file names:

```typescript
// Automatically blocked names
const dangerousNames = [
  'CON', 'PRN', 'AUX', 'NUL',           // Windows reserved
  'COM1', 'COM2', 'LPT1', 'LPT2',       // Windows device names
  '.htaccess', '.htpasswd',             // Web server configs
  'web.config', 'php.ini',              // Server configs
];

// These are automatically blocked regardless of extension
```

---

## 📚 API Documentation

### Core Functions

#### `validatePath(rootPath, inputPath, config?)`

Validates and normalizes a file path within a root directory.

**Parameters:**
- `rootPath: string` - The secure root directory
- `inputPath: string` - The user-provided path to validate
- `config?: PathSecurityConfig` - Optional security configuration

**Returns:** `Promise<PathValidationResult>`

```typescript
interface PathValidationResult {
  isValid: boolean;           // Whether validation passed
  normalizedPath?: string;    // Absolute, normalized path
  relativePath?: string;      // Path relative to root
  error?: string;             // Error message if failed
  warnings?: string[];        // Security warnings
}
```

**Example:**
```typescript
const result = await validatePath('/data/uploads', 'user/documents/file.txt');

if (result.isValid) {
  console.log('Safe path:', result.normalizedPath);
  console.log('Relative path:', result.relativePath);
} else {
  console.error('Unsafe path:', result.error);
}
```

#### `sanitizeFileName(fileName)`

Cleans a file name by removing dangerous characters.

**Parameters:**
- `fileName: string` - The file name to sanitize

**Returns:** `string` - The sanitized file name

**Example:**
```typescript
const cleanName = sanitizeFileName('file<script>.txt');
console.log(cleanName); // 'file_script_.txt'

const cleanName2 = sanitizeFileName('   .hidden   ');
console.log(cleanName2); // 'hidden'
```

#### `createSecurePath(directory, fileName)`

Creates a secure file path by combining directory and sanitized filename.

**Parameters:**
- `directory: string` - The directory path
- `fileName: string` - The file name to sanitize and join

**Returns:** `string` - The secure path

**Example:**
```typescript
const securePath = createSecurePath('/uploads', 'user file.txt');
console.log(securePath); // '/uploads/user_file.txt'
```

### Secure File Operations

#### `secureReadFile(rootPath, filePath, options?)`

Safely reads a file within the root directory.

**Returns:** `Promise<SecureFileResult & { content?: string }>`

```typescript
interface SecureFileResult {
  success: boolean;
  absolutePath?: string;
  relativePath?: string;
  error?: string;
  metadata?: {
    size?: number;
    created?: boolean;
    modified?: boolean;
  };
}
```

#### `secureWriteFile(rootPath, filePath, content, options?)`

Safely writes a file within the root directory.

**Parameters:**
- `content: string` - The file content to write
- `options?: SecureFileOptions` - Additional security options

#### `secureDeleteFile(rootPath, filePath, options?)`

Safely deletes a file within the root directory.

#### `secureListDirectory(rootPath, dirPath, options?)`

Safely lists directory contents.

**Returns:** `Promise<SecureFileResult & { entries?: DirectoryEntry[] }>`

```typescript
interface DirectoryEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
}
```

---

## 🔒 Security Policies

### Configuration Options

#### `PathSecurityConfig`

```typescript
interface PathSecurityConfig {
  maxDepth?: number;              // Maximum directory depth (default: 20)
  allowSymlinks?: boolean;        // Allow symbolic links (default: false)
  blockedExtensions?: string[];   // Blocked file extensions
  allowedExtensions?: string[];   // Allowed file extensions (empty = allow all)
  maxFileSize?: number;           // Maximum file size in bytes (default: 100MB)
  checkDangerousNames?: boolean;  // Check for dangerous names (default: true)
}
```

#### `SecureFileOptions`

```typescript
interface SecureFileOptions extends PathSecurityConfig {
  createParents?: boolean;        // Create parent directories (default: false)
  overwrite?: boolean;            // Overwrite existing files (default: false)
  mode?: number;                  // File permissions (octal)
}
```

### Policy Examples

#### Strict Document Repository

```typescript
const documentRepoConfig: PathSecurityConfig = {
  maxDepth: 5,
  allowSymlinks: false,
  allowedExtensions: ['.pdf', '.doc', '.docx', '.txt', '.md'],
  blockedExtensions: ['.exe', '.bat', '.cmd', '.scr'],
  maxFileSize: 50 * 1024 * 1024, // 50MB
  checkDangerousNames: true,
};
```

#### Media Upload Service

```typescript
const mediaUploadConfig: PathSecurityConfig = {
  maxDepth: 3,
  allowSymlinks: false,
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov'],
  maxFileSize: 500 * 1024 * 1024, // 500MB for media
  checkDangerousNames: true,
};
```

#### Temporary File Storage

```typescript
const tempStorageConfig: PathSecurityConfig = {
  maxDepth: 2,
  allowSymlinks: false,
  allowedExtensions: ['.tmp', '.temp', '.cache'],
  maxFileSize: 10 * 1024 * 1024, // 10MB for temp files
  checkDangerousNames: false, // More permissive for temp files
};
```

---

## 🧪 Testing Documentation

### Unit Testing

#### Path Validation Tests

```typescript
import { validatePath } from '@promethean/security';

describe('Path Validation Security', () => {
  describe('Path Traversal Prevention', () => {
    it('should block classic traversal attacks', async () => {
      const attacks = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32',
        '/etc/passwd',
        'folder/../../../secret',
      ];

      for (const attack of attacks) {
        const result = await validatePath('/safe/root', attack);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('dangerous pattern');
      }
    });

    it('should allow safe relative paths', async () => {
      const safePaths = [
        'documents/file.txt',
        'user/data/report.pdf',
        'images/photo.jpg',
      ];

      for (const path of safePaths) {
        const result = await validatePath('/safe/root', path);
        expect(result.isValid).toBe(true);
      }
    });
  });

  describe('File Extension Validation', () => {
    it('should block dangerous extensions', async () => {
      const config = {
        blockedExtensions: ['.exe', '.bat', '.cmd']
      };

      const dangerousFiles = [
        'malware.exe',
        'script.bat',
        'command.cmd',
      ];

      for (const file of dangerousFiles) {
        const result = await validatePath('/safe/root', file, config);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('not allowed');
      }
    });
  });

  describe('Symbolic Link Security', () => {
    it('should block symlinks when disabled', async () => {
      const config = { allowSymlinks: false };
      
      // This would need to be tested with actual symlink files
      // The test should verify that symlinks are rejected
    });
  });
});
```

#### Secure File Operations Tests

```typescript
import { secureWriteFile, secureReadFile, secureDeleteFile } from '@promethean/security';

describe('Secure File Operations', () => {
  const testRoot = '/tmp/test-secure-ops';
  const testFile = 'test.txt';
  const testContent = 'Hello, secure world!';

  beforeEach(async () => {
    // Setup test directory
    await fs.mkdir(testRoot, { recursive: true });
  });

  afterEach(async () => {
    // Cleanup test directory
    await fs.rm(testRoot, { recursive: true, force: true });
  });

  it('should securely write and read files', async () => {
    const writeResult = await secureWriteFile(testRoot, testFile, testContent);
    expect(writeResult.success).toBe(true);
    expect(writeResult.metadata?.created).toBe(true);

    const readResult = await secureReadFile(testRoot, testFile);
    expect(readResult.success).toBe(true);
    expect(readResult.content).toBe(testContent);
  });

  it('should prevent overwriting when disabled', async () => {
    // Create initial file
    await secureWriteFile(testRoot, testFile, 'original');

    // Try to overwrite without permission
    const result = await secureWriteFile(testRoot, testFile, 'new content', {
      overwrite: false
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
  });
});
```

### Integration Testing

#### End-to-End Security Tests

```typescript
describe('File Path Security Integration', () => {
  it('should handle complete file workflow securely', async () => {
    const root = '/tmp/integration-test';
    const config = {
      maxDepth: 5,
      allowedExtensions: ['.txt', '.json'],
      maxFileSize: 1024 * 1024,
    };

    // Test complete workflow
    const filePath = 'documents/test.txt';
    const content = 'Test content';

    // Write file
    const writeResult = await secureWriteFile(root, filePath, content, config);
    expect(writeResult.success).toBe(true);

    // Read file
    const readResult = await secureReadFile(root, filePath, config);
    expect(readResult.success).toBe(true);
    expect(readResult.content).toBe(content);

    // List directory
    const listResult = await secureListDirectory(root, 'documents', config);
    expect(listResult.success).toBe(true);
    expect(listResult.entries).toContainEqual(
      expect.objectContaining({ name: 'test.txt', type: 'file' })
    );

    // Delete file
    const deleteResult = await secureDeleteFile(root, filePath, config);
    expect(deleteResult.success).toBe(true);
  });
});
```

### Security Testing Procedures

#### 1. Fuzzing Tests

```typescript
describe('Path Validation Fuzzing', () => {
  const fuzzingInputs = [
    // Unicode attacks
    'ice\u200bbox',           // Zero-width space
    'i𝚌ebox',                // Mathematical bold
    'ｉncebox',               // Full-width characters
    
    // Control characters
    'file\x00name',          // Null byte
    'file\x1Fname',          // Control character
    'file\x7Fname',          // Delete character
    
    // Long paths
    'a'.repeat(1000),        // Very long filename
    '/'.repeat(100),         // Very deep path
    
    // Special characters
    'file<name>.txt',        // HTML characters
    'file|name.txt',         // Pipe character
    'file?name.txt',         // Question mark
  ];

  it('should handle fuzzing inputs safely', async () => {
    for (const input of fuzzingInputs) {
      const result = await validatePath('/safe/root', input);
      
      // Should either be valid (if safe) or have a proper error
      if (!result.isValid) {
        expect(result.error).toBeDefined();
        expect(result.error).not.toContain('undefined');
        expect(result.error).not.toContain('null');
      }
    }
  });
});
```

#### 2. Performance Tests

```typescript
describe('Performance Tests', () => {
  it('should handle large numbers of validations efficiently', async () => {
    const paths = Array.from({ length: 1000 }, (_, i) => `file${i}.txt`);
    const startTime = Date.now();

    const results = await validatePaths('/safe/root', paths);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should complete within reasonable time (adjust as needed)
    expect(duration).toBeLessThan(5000); // 5 seconds
    expect(results).toHaveLength(1000);
  });
});
```

---

## 👨‍💻 Developer Guidelines

### 1. Integration Steps

#### Step 1: Install Security Package

```bash
pnpm add @promethean/security
```

#### Step 2: Replace Unsafe File Operations

```typescript
// Before (unsafe)
import { promises as fs } from 'node:fs';
import path from 'node:path';

async function unsafeReadUserFile(userId: string, filename: string) {
  const filePath = path.join('/data/users', userId, filename);
  return await fs.readFile(filePath, 'utf8');
}

// After (secure)
import { secureReadFile } from '@promethean/security';

async function safeReadUserFile(userId: string, filename: string) {
  const result = await secureReadFile('/data/users', `${userId}/${filename}`, {
    maxDepth: 3,
    allowedExtensions: ['.txt', '.json', '.csv'],
    maxFileSize: 10 * 1024 * 1024,
  });

  if (!result.success) {
    throw new Error(`File access denied: ${result.error}`);
  }

  return result.content;
}
```

#### Step 3: Configure Security Policies

```typescript
// config/security.ts
export const fileSecurityConfig = {
  userFiles: {
    maxDepth: 5,
    allowSymlinks: false,
    allowedExtensions: ['.txt', '.md', '.json', '.csv'],
    maxFileSize: 10 * 1024 * 1024,
  },
  uploads: {
    maxDepth: 3,
    allowSymlinks: false,
    allowedExtensions: ['.jpg', '.png', '.pdf', '.doc'],
    maxFileSize: 50 * 1024 * 1024,
  },
  temp: {
    maxDepth: 2,
    allowSymlinks: false,
    allowedExtensions: ['.tmp', '.temp'],
    maxFileSize: 5 * 1024 * 1024,
  },
};
```

#### Step 4: Implement Error Handling

```typescript
import { secureWriteFile, SecureFileResult } from '@promethean/security';

class FileOperationError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly path: string,
    public readonly securityError?: string
  ) {
    super(message);
    this.name = 'FileOperationError';
  }
}

async function handleFileWrite(
  rootPath: string,
  filePath: string,
  content: string
): Promise<string> {
  const result: SecureFileResult = await secureWriteFile(rootPath, filePath, content);

  if (!result.success) {
    throw new FileOperationError(
      `Failed to write file: ${result.error}`,
      'write',
      filePath,
      result.error
    );
  }

  return result.absolutePath!;
}
```

### 2. Best Practices

#### ✅ DO

1. **Always validate paths before file operations**
   ```typescript
   const validation = await validatePath(root, userPath);
   if (!validation.isValid) {
     throw new Error(`Invalid path: ${validation.error}`);
   }
   ```

2. **Use appropriate security configurations for different contexts**
   ```typescript
   const userConfig = { /* strict settings */ };
   const tempConfig = { /* permissive settings */ };
   ```

3. **Implement proper error handling and logging**
   ```typescript
   try {
     const result = await secureReadFile(root, path);
   } catch (error) {
     logger.warn('File access attempt', { path, error: error.message });
     throw error;
   }
   ```

4. **Set reasonable file size limits**
   ```typescript
   const config = {
     maxFileSize: isImageUpload ? 50 * 1024 * 1024 : 1024 * 1024
   };
   ```

5. **Use allowlists for file extensions when possible**
   ```typescript
   const config = {
     allowedExtensions: ['.jpg', '.png', '.gif'] // Instead of just blocking
   };
   ```

#### ❌ DON'T

1. **Don't use direct file system operations with user input**
   ```typescript
   // BAD
   const fullPath = path.join(baseDir, userInput);
   await fs.readFile(fullPath);
   
   // GOOD
   const result = await secureReadFile(baseDir, userInput);
   ```

2. **Don't ignore validation errors**
   ```typescript
   // BAD
   const validation = await validatePath(root, path);
   // Continue even if validation fails
   
   // GOOD
   if (!validation.isValid) {
     throw new Error(`Security violation: ${validation.error}`);
   }
   ```

3. **Don't allow symlinks unless absolutely necessary**
   ```typescript
   // BAD
   const config = { allowSymlinks: true }; // Default is false for security
   
   // GOOD
   const config = { allowSymlinks: false }; // Keep symlinks disabled
   ```

4. **Don't use overly permissive configurations**
   ```typescript
   // BAD
   const config = {
     allowedExtensions: [], // Allows everything
     maxFileSize: Number.MAX_SAFE_INTEGER
   };
   
   // GOOD
   const config = {
     allowedExtensions: ['.txt', '.json'], // Specific allowed types
     maxFileSize: 10 * 1024 * 1024 // Reasonable limit
   };
   ```

### 3. Common Pitfalls and Solutions

#### Pitfall 1: Path Normalization Issues

**Problem**: Different path separators and normalization can bypass validation.

**Solution**: Always use the validation functions which handle cross-platform issues:

```typescript
// Problematic
const userInput = '..\\..\\secret';
const normalized = userInput.replace(/\\/g, '/');
// Can still be bypassed

// Safe
const result = await validatePath(root, userInput);
// Handles all normalization securely
```

#### Pitfall 2: Race Conditions

**Problem**: Time-of-check to time-of-use (TOCTOU) race conditions.

**Solution**: Use atomic operations when possible:

```typescript
// Problematic
const validation = await validatePath(root, path);
if (validation.isValid) {
  // File could be changed between validation and operation
  await fs.writeFile(validation.normalizedPath, content);
}

// Better
const result = await secureWriteFile(root, path, content);
// Validation and operation are atomic
```

#### Pitfall 3: Incomplete Error Handling

**Problem**: Not handling all security validation errors properly.

**Solution**: Implement comprehensive error handling:

```typescript
async function robustFileOperation(root: string, path: string, content: string) {
  try {
    const result = await secureWriteFile(root, path, content, {
      createParents: true,
      overwrite: false,
    });
    
    if (!result.success) {
      // Log security violations
      if (result.error?.includes('dangerous')) {
        logger.error('Security violation detected', { path, error: result.error });
      }
      
      throw new Error(`File operation failed: ${result.error}`);
    }
    
    return result.absolutePath;
  } catch (error) {
    // Ensure all errors are properly handled
    logger.error('File operation error', { 
      path, 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
}
```

---

## 🔍 Integration Guidelines

### 1. Package Integration

#### For New Packages

1. **Add dependency**:
   ```json
   {
     "dependencies": {
       "@promethean/security": "workspace:*"
     }
   }
   ```

2. **Create security configuration**:
   ```typescript
   // src/config/security.ts
   export const securityConfig = {
     // Your package-specific security settings
   };
   ```

3. **Implement secure file operations**:
   ```typescript
   // src/utils/file-operations.ts
   import { secureReadFile, secureWriteFile } from '@promethean/security';
   import { securityConfig } from '../config/security.js';
   
   export async function readConfigFile(path: string) {
     return await secureReadFile('/config', path, securityConfig.config);
   }
   ```

#### For Existing Packages

1. **Audit current file operations**:
   ```bash
   # Find all file system operations
   grep -r "fs\." packages/your-package/src/
   grep -r "readFile\|writeFile" packages/your-package/src/
   ```

2. **Replace unsafe operations**:
   ```typescript
   // Before
   import { readFile } from 'node:fs/promises';
   
   // After
   import { secureReadFile } from '@promethean/security';
   ```

3. **Add security tests**:
   ```typescript
   // src/tests/security.test.ts
   describe('File Security', () => {
     // Add security-specific tests
   });
   ```

### 2. Framework Integration

#### Express.js Integration

```typescript
import express from 'express';
import { secureWriteFile, secureReadFile } from '@promethean/security';

const app = express();

app.post('/upload', async (req, res) => {
  try {
    const { filename, content } = req.body;
    
    const result = await secureWriteFile('/uploads', filename, content, {
      allowedExtensions: ['.txt', '.json'],
      maxFileSize: 10 * 1024 * 1024,
    });
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json({ path: result.relativePath });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});
```

#### Fastify Integration

```typescript
import fastify from 'fastify';
import { secureReadFile } from '@promethean/security';

const app = fastify();

app.get('/files/:filename', async (request, reply) => {
  try {
    const { filename } = request.params as { filename: string };
    
    const result = await secureReadFile('/public', filename, {
      allowedExtensions: ['.html', '.css', '.js'],
    });
    
    if (!result.success) {
      return reply.status(404).send({ error: 'File not found' });
    }
    
    reply.type('text/plain').send(result.content);
  } catch (error) {
    reply.status(500).send({ error: 'Server error' });
  }
});
```

### 3. Database Integration

#### File Metadata Storage

```typescript
interface FileMetadata {
  id: string;
  originalName: string;
  storedPath: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  securityValidated: boolean;
}

class FileService {
  async storeFile(
    userId: string,
    originalName: string,
    content: Buffer
  ): Promise<FileMetadata> {
    // Validate and store file securely
    const result = await secureWriteFile(
      '/uploads',
      `${userId}/${Date.now()}_${originalName}`,
      content.toString(),
      {
        allowedExtensions: ['.jpg', '.png', '.pdf'],
        maxFileSize: 50 * 1024 * 1024,
      }
    );

    if (!result.success) {
      throw new Error(`File storage failed: ${result.error}`);
    }

    // Store metadata in database
    const metadata: FileMetadata = {
      id: generateId(),
      originalName,
      storedPath: result.relativePath!,
      size: result.metadata!.size!,
      mimeType: getMimeType(originalName),
      uploadedBy: userId,
      uploadedAt: new Date(),
      securityValidated: true,
    };

    await this.db.collection('files').insertOne(metadata);
    return metadata;
  }
}
```

---

## 📊 Monitoring and Auditing

### 1. Security Event Logging

#### Log Security Violations

```typescript
import logger from './logger';

async function logSecurityViolation(
  operation: string,
  path: string,
  reason: string,
  userId?: string
) {
  logger.warn('File security violation', {
    operation,
    path,
    reason,
    userId,
    timestamp: new Date().toISOString(),
    ip: getCurrentUserIP(),
  });
}

// Usage in validation
if (!validation.isValid) {
  await logSecurityViolation('read', inputPath, validation.error!, userId);
  throw new Error(`Access denied: ${validation.error}`);
}
```

#### Track File Access Patterns

```typescript
class FileAccessMonitor {
  private accessLog = new Map<string, number>();

  async recordAccess(userId: string, filePath: string) {
    const key = `${userId}:${filePath}`;
    const count = this.accessLog.get(key) || 0;
    this.accessLog.set(key, count + 1);

    // Alert on suspicious patterns
    if (count > 100) { // Accessing same file 100+ times
      logger.warn('Suspicious file access pattern', { userId, filePath, count });
    }
  }

  async getAccessStats(userId: string) {
    const userStats = Array.from(this.accessLog.entries())
      .filter(([key]) => key.startsWith(`${userId}:`))
      .map(([key, count]) => ({
        file: key.split(':')[1],
        accessCount: count,
      }));

    return userStats;
  }
}
```

### 2. Performance Monitoring

#### Track Validation Performance

```typescript
class ValidationMetrics {
  private metrics = {
    totalValidations: 0,
    failedValidations: 0,
    averageTime: 0,
    slowValidations: 0,
  };

  async recordValidation(duration: number, success: boolean) {
    this.metrics.totalValidations++;
    
    if (!success) {
      this.metrics.failedValidations++;
    }
    
    if (duration > 100) { // Slow validation (>100ms)
      this.metrics.slowValidations++;
    }
    
    // Update rolling average
    this.metrics.averageTime = 
      (this.metrics.averageTime * (this.metrics.totalValidations - 1) + duration) / 
      this.metrics.totalValidations;
  }

  getMetrics() {
    return { ...this.metrics };
  }
}
```

### 3. Alerting

#### Security Alert Configuration

```typescript
interface SecurityAlert {
  type: 'path_traversal' | 'extension_violation' | 'size_exceeded' | 'symlink_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  path: string;
  details: string;
  timestamp: Date;
}

class SecurityAlertManager {
  async sendAlert(alert: SecurityAlert) {
    // Log the alert
    logger.error('Security alert', alert);

    // Send to monitoring system
    if (alert.severity === 'critical') {
      await this.sendImmediateNotification(alert);
    }

    // Update metrics
    await this.updateSecurityMetrics(alert);
  }

  private async sendImmediateNotification(alert: SecurityAlert) {
    // Integration with your monitoring/alerting system
    // Example: Slack, PagerDuty, email, etc.
  }
}
```

---

## 🚀 Migration Guide

### From Insecure File Operations

#### Step 1: Identify Current Usage

```bash
# Find all file system operations
find packages/ -name "*.ts" -exec grep -l "fs\." {} \;
find packages/ -name "*.ts" -exec grep -l "readFile\|writeFile" {} \;
```

#### Step 2: Create Migration Plan

```typescript
// migration-plan.ts
interface FileOperationMigration {
  file: string;
  line: number;
  operation: 'read' | 'write' | 'delete' | 'list';
  currentCode: string;
  secureReplacement: string;
  priority: 'high' | 'medium' | 'low';
}

const migrations: FileOperationMigration[] = [
  {
    file: 'src/services/user-service.ts',
    line: 45,
    operation: 'read',
    currentCode: 'await fs.readFile(userPath)',
    secureReplacement: 'await secureReadFile("/data/users", userId)',
    priority: 'high',
  },
  // ... more migrations
];
```

#### Step 3: Implement Secure Replacements

```typescript
// Before migration
class UserService {
  async getUserData(userId: string): Promise<string> {
    const userPath = path.join('/data/users', userId, 'data.json');
    return await fs.readFile(userPath, 'utf8');
  }
}

// After migration
class UserService {
  async getUserData(userId: string): Promise<string> {
    const result = await secureReadFile('/data/users', `${userId}/data.json`, {
      maxDepth: 3,
      allowedExtensions: ['.json'],
      maxFileSize: 1024 * 1024, // 1MB
    });

    if (!result.success) {
      throw new Error(`Cannot access user data: ${result.error}`);
    }

    return result.content;
  }
}
```

#### Step 4: Add Comprehensive Tests

```typescript
// tests/user-service-security.test.ts
describe('UserService Security', () => {
  describe('getUserData', () => {
    it('should prevent path traversal attacks', async () => {
      const maliciousInputs = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32\\config',
        '/etc/shadow',
      ];

      for (const input of maliciousInputs) {
        await expect(userService.getUserData(input))
          .rejects.toThrow('Cannot access user data');
      }
    });

    it('should only allow JSON files', async () => {
      await expect(userService.getUserData('user/data.exe'))
        .rejects.toThrow('Cannot access user data');
    });
  });
});
```

### Validation Checklist

#### Pre-Migration Checklist

- [ ] Identify all file system operations
- [ ] Categorize by risk level (user input vs system paths)
- [ ] Create security configurations for each use case
- [ ] Plan migration order (high risk first)
- [ ] Prepare rollback strategy

#### Post-Migration Checklist

- [ ] All file operations use secure APIs
- [ ] Security configurations are appropriate for each context
- [ ] Error handling is comprehensive
- [ ] Security tests are in place
- [ ] Performance impact is acceptable
- [ ] Monitoring and alerting are configured

---

## 📖 References and Resources

### Security Standards

- [OWASP Path Traversal Prevention](https://owasp.org/www-community/attacks/Path_Traversal)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CWE-22: Path Traversal](https://cwe.mitre.org/data/definitions/22.html)

### Related Documentation

- [Promethean Security Package](../packages/security/README.md)
- [Security Testing Guidelines](security-testing-procedures.md)
- [API Security Best Practices](api-security-best-practices.md)

### Tools and Utilities

- [Security Testing Framework](../packages/security/src/testing/)
- [Vulnerability Scanner](../tools/security-scanner/)
- [Compliance Checker](../tools/compliance-checker/)

---

## 📞 Support and Contributing

### Getting Help

- **Security Issues**: Report to security@promethean.dev
- **Documentation Issues**: Create GitHub issue in `docs` repository
- **Implementation Questions**: Use `#security` channel in team chat

### Contributing

1. **Security Changes**: Must be reviewed by security team
2. **Documentation Updates**: Follow documentation standards
3. **Test Coverage**: Maintain 100% coverage for security code
4. **Performance**: Ensure no performance regressions

### Review Process

1. **Code Review**: All security changes require peer review
2. **Security Review**: Critical changes require security team review
3. **Testing**: Comprehensive test coverage required
4. **Documentation**: Update relevant documentation

---

**Document Classification**: Internal - Restricted  
**Next Review Date**: 2026-01-16  
**Maintainer**: Security Team  
**Approved By**: Security Lead