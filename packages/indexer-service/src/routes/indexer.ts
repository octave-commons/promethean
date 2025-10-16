import path from 'node:path';

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { IndexerManager } from '@promethean/indexer-core';
type PathBody = { path?: string | string[] };

/**
 * Secure error handler that prevents information disclosure
 */
function handleSecureError(reply: FastifyReply, error: Error, statusCode: number = 500): void {
  // Log the full error for debugging purposes
  reply.log.error({ err: error }, 'Indexer operation failed');

  // Send generic error message to client
  const genericMessages = {
    400: 'Invalid request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not found',
    409: 'Conflict',
    429: 'Too many requests',
    500: 'Internal server error',
    503: 'Service unavailable',
  };

  const message =
    genericMessages[statusCode as keyof typeof genericMessages] || 'Internal server error';

  reply.code(statusCode).send({
    ok: false,
    error: message,
    // Include request ID for tracing in production
    ...(reply.request.id && { requestId: reply.request.id }),
  });
}

/**
 * Validates basic path properties: type, length, null bytes, and whitespace
 */
function validateBasicPathProperties(rel: string): boolean {
  if (typeof rel !== 'string') {
    return false;
  }

  if (rel.length === 0 || rel.length > 256) {
    return false;
  }

  if (rel.includes('\0')) {
    return false;
  }

  const trimmed = rel.trim();
  if (trimmed !== rel) {
    return false;
  }

  return true;
}

/**
 * Detects path traversal attempts through ".." components and absolute paths
 */
function detectPathTraversal(trimmed: string): boolean {
  const pathComponents = trimmed.split(/[\\/]/);
  if (pathComponents.includes('..') || pathComponents.includes('.')) {
    return true;
  }

  if (path.isAbsolute(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Filters dangerous characters that could lead to command injection
 */
function containsDangerousCharacters(trimmed: string): boolean {
  const dangerousChars = ['<', '>', '|', '&', ';', '`', '$', '"', "'"];
  return dangerousChars.some((char) => trimmed.includes(char));
}

/**
 * Validates Windows-specific path attack prevention
 */
function validateWindowsPathSecurity(trimmed: string): boolean {
  // Block drive letters (C:, D:, etc.)
  if (/^[a-zA-Z]:/.test(trimmed)) {
    return false;
  }

  // Block UNC paths
  if (trimmed.startsWith('\\\\')) {
    return false;
  }

  // Block Windows-style backslash paths
  if (trimmed.includes('\\')) {
    return false;
  }

  // Block reserved device names
  const reservedNames = [
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'COM2',
    'COM3',
    'COM4',
    'COM5',
    'COM6',
    'COM7',
    'COM8',
    'COM9',
    'LPT1',
    'LPT2',
    'LPT3',
    'LPT4',
    'LPT5',
    'LPT6',
    'LPT7',
    'LPT8',
    'LPT9',
  ];
  const baseName = path.basename(trimmed).toUpperCase();
  if (reservedNames.includes(baseName)) {
    return false;
  }

  return true;
}

/**
 * Validates Unix-specific path attack prevention
 */
function validateUnixPathSecurity(trimmed: string): boolean {
  if (process.platform !== 'win32') {
    // Block device paths
    if (trimmed.startsWith('/dev/')) {
      return false;
    }
    // Block proc filesystem
    if (trimmed.startsWith('/proc/')) {
      return false;
    }
    // Block sys filesystem
    if (trimmed.startsWith('/sys/')) {
      return false;
    }
  }
  return true;
}

/**
 * Validates path normalization and resolution
 */
function validatePathNormalization(trimmed: string): boolean {
  try {
    const normalized = path.normalize(trimmed);
    if (path.isAbsolute(normalized) || normalized.includes('..')) {
      return false;
    }

    // Additional check: resolve against a fake root to ensure no traversal
    const fakeRoot = '/fake/root';
    const resolved = path.resolve(fakeRoot, normalized);
    if (!resolved.startsWith(fakeRoot)) {
      return false;
    }
  } catch {
    return false;
  }
  return true;
}

/**
 * Detects glob pattern attack patterns
 */
function containsGlobAttackPatterns(trimmed: string): boolean {
  const attackPatterns = [
    /\*\*.*\.\./, // ** followed by ..
    /\.\.\/\*\*/, // ../**
    /\{\.\./, // {.. in brace expansion
    /\.\.\}/, // ..} in brace expansion
  ];

  return attackPatterns.some((pattern) => pattern.test(trimmed));
}

/**
 * Comprehensive path traversal prevention for single files and globs
 *
 * Security checks performed:
 * 1. Type and length validation
 * 2. Null byte injection prevention
 * 3. Path traversal detection (.. components)
 * 4. Absolute path rejection
 * 5. Dangerous character filtering
 * 6. Path normalization and resolution validation
 * 7. Windows-specific path attack prevention
 * 8. Unix-specific path attack prevention
 * 9. Glob pattern attack prevention
 */
function isSafeRelPath(rel: string): boolean {
  if (!validateBasicPathProperties(rel)) {
    return false;
  }

  const trimmed = rel.trim();

  if (detectPathTraversal(trimmed)) {
    return false;
  }

  if (containsDangerousCharacters(trimmed)) {
    return false;
  }

  if (!validateWindowsPathSecurity(trimmed)) {
    return false;
  }

  if (!validateUnixPathSecurity(trimmed)) {
    return false;
  }

  if (!validatePathNormalization(trimmed)) {
    return false;
  }

  if (containsGlobAttackPatterns(trimmed)) {
    return false;
  }

  return true;
}

function registerStatusRoute(app: FastifyInstance, manager: IndexerManager): void {
  app.get('/indexer/status', async (_req, reply: FastifyReply) => {
    reply.send({ ok: true, status: manager.status() });
  });
}

function registerResetRoute(app: FastifyInstance, manager: IndexerManager, rootPath: string): void {
  app.post('/indexer/reset', async (_req: FastifyRequest, reply: FastifyReply) => {
    try {
      if (manager.isBusy()) {
        reply.code(409).send({ ok: false, error: 'Indexer busy' });
        return;
      }
      await manager.resetAndBootstrap(rootPath);
      reply.send({ ok: true });
    } catch (error: unknown) {
      handleSecureError(reply, error as Error);
    }
  });
}

function registerReindexRoute(app: FastifyInstance, manager: IndexerManager): void {
  app.post('/indexer/reindex', async (_req: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await manager.scheduleReindexAll();
      reply.send(result);
    } catch (error: unknown) {
      handleSecureError(reply, error as Error);
    }
  });
}

function validatePathArray(globs: string | string[] | undefined): {
  valid: boolean;
  error?: string;
} {
  if (!globs) {
    return { valid: false, error: "Missing 'path'" };
  }

  if (typeof globs === 'string') {
    if (!isSafeRelPath(globs)) {
      return { valid: false, error: 'Invalid path' };
    }
  } else if (Array.isArray(globs)) {
    for (const glob of globs) {
      if (!isSafeRelPath(glob)) {
        return { valid: false, error: 'Invalid path' };
      }
    }
  } else {
    return { valid: false, error: 'Invalid path format' };
  }

  return { valid: true };
}

function registerReindexFilesRoute(app: FastifyInstance, manager: IndexerManager): void {
  app.post(
    '/indexer/files/reindex',
    async (request: FastifyRequest<{ Body: PathBody }>, reply: FastifyReply) => {
      const globs = request.body?.path;
      const validation = validatePathArray(globs);

      if (!validation.valid) {
        reply.code(400).send({ ok: false, error: validation.error });
        return;
      }

      try {
        const result = await manager.scheduleReindexSubset(globs!);
        reply.send(result);
      } catch (error: unknown) {
        handleSecureError(reply, error as Error);
      }
    },
  );
}

function registerIndexRoute(app: FastifyInstance, manager: IndexerManager): void {
  app.post(
    '/indexer/index',
    async (request: FastifyRequest<{ Body: PathBody }>, reply: FastifyReply) => {
      const validation = validatePathArray(request.body?.path);

      if (!validation.valid) {
        handleSecureError(reply, new Error(validation.error || 'Invalid path'), 400);
        return;
      }

      // Only accept single paths for this endpoint
      if (Array.isArray(request.body?.path)) {
        handleSecureError(reply, new Error('Array input not allowed for this endpoint'), 400);
        return;
      }

      try {
        const result = await manager.scheduleIndexFile(request.body!.path as string);
        reply.send(result);
      } catch (error: unknown) {
        handleSecureError(reply, error as Error);
      }
    },
  );
}

function registerRemoveRoute(app: FastifyInstance, manager: IndexerManager): void {
  app.post(
    '/indexer/remove',
    async (request: FastifyRequest<{ Body: PathBody }>, reply: FastifyReply) => {
      const validation = validatePathArray(request.body?.path);

      if (!validation.valid) {
        handleSecureError(reply, new Error(validation.error || 'Invalid path'), 400);
        return;
      }

      // Only accept single paths for this endpoint
      if (Array.isArray(request.body?.path)) {
        handleSecureError(reply, new Error('Array input not allowed for this endpoint'), 400);
        return;
      }

      try {
        const result = await manager.removeFile(request.body!.path as string);
        reply.send(result);
      } catch (error: unknown) {
        handleSecureError(reply, error as Error);
      }
    },
  );
}

export function registerIndexerRoutes(
  app: FastifyInstance,
  manager: IndexerManager,
  rootPath: string,
): void {
  registerStatusRoute(app, manager);
  registerResetRoute(app, manager, rootPath);
  registerReindexRoute(app, manager);
  registerReindexFilesRoute(app, manager);
  registerIndexRoute(app, manager);
  registerRemoveRoute(app, manager);
}
