import type { FastifyInstance, FastifyRequest } from 'fastify';
import * as path from 'node:path';
import { promises as fs } from 'node:fs';

/**
 * MCP (Model Context Protocol) message types
 */
interface MCPMessage {
  jsonrpc: '2.0';
  id?: string | number;
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

/**
 * MCP tool definition
 */
interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * MCP capability information
 */
interface MCPCapabilities {
  tools: {
    list: boolean;
    subscribe: boolean;
    listChanges?: boolean;
  };
  resources: {
    subscribe: boolean;
    list: boolean;
  };
  prompts: {
    create: boolean;
    list: boolean;
  };
}

/**
 * MCP adapter options
 */
interface MCPAdapterOptions {
  prefix: string;
  enableAuth?: boolean;
  enableTools?: boolean;
  enableResources?: boolean;
  enablePrompts?: boolean;
  allowedBasePaths?: string[];
  maxFileSize?: number;
  enableSecurityLogging?: boolean;
  enableAuditLogging?: boolean;
  enableRateLimit?: boolean;
  rateLimitWindow?: number; // in seconds
  rateLimitMax?: number; // max requests per window
}

// ============================================================================
// Security Validation Constants (from indexer-service)
// ============================================================================

const DANGEROUS_CHARS = ['<', '>', '|', '&', ';', '`', '$', '"', "'", '\r', '\n'];
const WINDOWS_RESERVED_NAMES = [
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

const GLOB_ATTACK_PATTERNS = [
  /\*\*.*\.\./, // ** followed by ..
  /\.\.\/\*\*/, // ../**
  /\{\.\./, // {.. in brace expansion
  /\.\.\}/, // ..} in brace expansion
];

const UNIX_DANGEROUS_PATHS = ['/dev/', '/proc/', '/sys/', '/etc/', '/root/', '/var/log/'];

// Dangerous path patterns including tilde expansion
const DANGEROUS_PATH_PATTERNS = [
  /^~\//, // Home directory access
  /^~[^\/]/, // Other user home directories
  /\.ssh\//, // SSH directory access
  /\.gnupg\//, // GPG directory access
  /\/\.ssh\//, // SSH paths anywhere
  /\/\.gnupg\//, // GPG paths anywhere
];

// ============================================================================
// Security Validation Functions (from indexer-service)
// ============================================================================

/**
 * Validates basic path properties
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
 * Detects path traversal attempts with Unicode normalization protection
 */
function detectPathTraversal(trimmed: string): boolean {
  // Normalize Unicode first to prevent homograph attacks
  const normalized = trimmed.normalize('NFKC');

  const pathComponents = normalized.split(/[\\/]/);
  if (pathComponents.includes('..') || pathComponents.includes('.')) {
    return true;
  }

  if (path.isAbsolute(normalized)) {
    return true;
  }

  // Check for Unicode homograph attacks that can normalize to traversal
  // Expanded to catch more Unicode variants
  if (/[‥﹒．．．]/.test(normalized) || /[‥﹒．]/.test(trimmed)) {
    return true;
  }

  // Check for encoded traversal attempts
  if (/%2e%2e/i.test(normalized) || /%2e%2e%2f/i.test(normalized)) {
    return true;
  }

  return false;
}

/**
 * Checks for dangerous characters
 */
function containsDangerousCharacters(trimmed: string): boolean {
  return DANGEROUS_CHARS.some((char) => trimmed.includes(char));
}

/**
 * Validates Windows-specific path security
 */
function validateWindowsPathSecurity(trimmed: string): boolean {
  // Block drive letters
  if (/^[a-zA-Z]:/.test(trimmed)) {
    return false;
  }

  // Block UNC paths
  if (trimmed.startsWith('\\\\')) {
    return false;
  }

  // Block backslash paths
  if (trimmed.includes('\\')) {
    return false;
  }

  // Block reserved device names
  const baseName = path.basename(trimmed).toUpperCase();
  if (WINDOWS_RESERVED_NAMES.includes(baseName)) {
    return false;
  }

  return true;
}

/**
 * Validates Unix-specific path security
 */
function validateUnixPathSecurity(trimmed: string): boolean {
  if (process.platform !== 'win32') {
    // Block dangerous system paths
    if (UNIX_DANGEROUS_PATHS.some((dangerous) => trimmed.startsWith(dangerous))) {
      return false;
    }

    // Block dangerous path patterns including tilde expansion
    if (DANGEROUS_PATH_PATTERNS.some((pattern) => pattern.test(trimmed))) {
      return false;
    }
  }
  return true;
}

/**
 * Validates path normalization
 */
function validatePathNormalization(trimmed: string): boolean {
  try {
    const normalized = path.normalize(trimmed);
    if (path.isAbsolute(normalized) || normalized.includes('..')) {
      return false;
    }

    // Additional check: resolve against a fake root
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
 * Detects glob pattern attacks
 */
function containsGlobAttackPatterns(trimmed: string): boolean {
  return GLOB_ATTACK_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Comprehensive path security validation - isSafeRelPath() implementation
 * This is the critical security function that prevents path traversal attacks
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

/**
 * Validates and sanitizes file path input
 */
function validateFilePath(
  inputPath: unknown,
  allowedBasePaths: string[] = [],
): { valid: boolean; sanitizedPath?: string; error?: string } {
  if (typeof inputPath !== 'string') {
    return { valid: false, error: 'Path must be a string' };
  }

  // Apply comprehensive security validation
  if (!isSafeRelPath(inputPath)) {
    return { valid: false, error: 'Invalid or unsafe path' };
  }

  const sanitizedPath = inputPath.trim();

  // If allowed base paths are specified, ensure the path is within bounds
  if (allowedBasePaths.length > 0) {
    const isWithinAllowedPath = allowedBasePaths.some((basePath) => {
      const resolvedBase = path.resolve(basePath);
      const resolvedPath = path.resolve(basePath, sanitizedPath);
      return resolvedPath.startsWith(resolvedBase);
    });

    if (!isWithinAllowedPath) {
      return { valid: false, error: 'Path outside allowed directories' };
    }
  }

  return { valid: true, sanitizedPath };
}

/**
 * Checks if file extension is allowed for reading
 */
function isAllowedFileExtension(filePath: string): boolean {
  const allowedExtensions = [
    '.txt',
    '.md',
    '.json',
    '.js',
    '.ts',
    '.jsx',
    '.tsx',
    '.html',
    '.css',
    '.xml',
    '.yaml',
    '.yml',
    '.toml',
    '.ini',
    '.log',
    '.csv',
    '.env',
    '.gitignore',
    '.eslintrc',
    '.prettierrc',
  ];

  const ext = path.extname(filePath).toLowerCase();

  // Block dangerous files without extensions
  const dangerousFiles = [
    'rootkit',
    'backdoor',
    'payload',
    'exploit',
    'malware',
    'virus',
    'trojan',
    'keylogger',
  ];

  const baseName = path.basename(filePath).toLowerCase();
  if (dangerousFiles.includes(baseName)) {
    return false;
  }

  return allowedExtensions.includes(ext) || ext === '';
}

/**
 * Mock MCP tools
 */
const defaultTools: MCPTool[] = [
  {
    name: 'echo',
    description: 'Echo back the provided text',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to echo back',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'get_time',
    description: 'Get the current server time',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_user_info',
    description: 'Get information about the current user (requires authentication)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_files',
    description: 'List files in a directory',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Directory path to list',
        },
        recursive: {
          type: 'boolean',
          description: 'List files recursively',
          default: false,
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'read_file',
    description: 'Read the contents of a file',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'File path to read',
        },
        encoding: {
          type: 'string',
          description: 'File encoding',
          default: 'utf8',
        },
      },
      required: ['path'],
    },
  },
];

/**
 * Security audit log entry
 */
interface SecurityAuditLog {
  timestamp: Date;
  userId?: string;
  role?: string;
  action: string;
  resource: string;
  result: 'allowed' | 'denied';
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
}

/**
 * Rate limit entry
 */
interface RateLimitEntry {
  count: number;
  windowStart: Date;
  blocked: boolean;
}

/**
 * MCP adapter class
 */
class MCPAdapter {
  private app: FastifyInstance;
  private options: MCPAdapterOptions;
  private tools: Map<string, MCPTool> = new Map();
  private resources: Map<string, any> = new Map();
  private auditLog: SecurityAuditLog[] = [];
  private rateLimitMap: Map<string, RateLimitEntry> = new Map();
  private readonly maxAuditLogSize = 10000;

  constructor(app: FastifyInstance, options: MCPAdapterOptions) {
    this.app = app;

    // Apply secure defaults
    this.options = {
      enableAuth: true, // Secure by default
      enableSecurityLogging: true, // Enable security logging by default
      enableAuditLogging: true, // Enable audit logging by default
      enableRateLimit: true, // Enable rate limiting by default
      rateLimitWindow: 60, // 1 minute window
      rateLimitMax: 100, // 100 requests per minute
      maxFileSize: 1024 * 1024, // 1MB default file size limit
      allowedBasePaths: options.allowedBasePaths?.length
        ? options.allowedBasePaths
        : [path.resolve(__dirname, '../../..')], // Safe default base path
      ...options, // Allow overrides but with secure defaults
    };

    // Register default tools
    defaultTools.forEach((tool) => {
      this.tools.set(tool.name, tool);
    });
  }

  /**
   * Log security events
   */
  private logSecurityEvent(entry: Omit<SecurityAuditLog, 'timestamp'>): void {
    if (!this.options.enableSecurityLogging && !this.options.enableAuditLogging) {
      return;
    }

    const logEntry: SecurityAuditLog = {
      timestamp: new Date(),
      ...entry,
    };

    // Add to in-memory log
    this.auditLog.push(logEntry);

    // Trim log if too large
    if (this.auditLog.length > this.maxAuditLogSize) {
      this.auditLog = this.auditLog.slice(-this.maxAuditLogSize);
    }

    // Log to console for immediate visibility
    const level = entry.result === 'denied' ? 'WARN' : 'INFO';
    const message = `[MCP-SECURITY:${level}] ${logEntry.timestamp.toISOString()} ${entry.userId || 'anonymous'}:${entry.role || 'guest'} ${entry.action} on ${entry.resource} - ${entry.result}${entry.reason ? ` (${entry.reason})` : ''}`;

    if (entry.result === 'denied') {
      this.app.log.warn(message);
    } else {
      this.app.log.info(message);
    }
  }

  /**
   * Check rate limits
   */
  private checkRateLimit(request: FastifyRequest): { allowed: boolean; remaining?: number } {
    if (!this.options.enableRateLimit) {
      return { allowed: true };
    }

    const clientId =
      (request.headers['x-forwarded-for'] as string) ||
      (request.headers['x-real-ip'] as string) ||
      request.ip ||
      'unknown';

    const now = new Date();
    const windowMs = (this.options.rateLimitWindow || 60) * 1000;
    const maxRequests = this.options.rateLimitMax || 100;

    let entry = this.rateLimitMap.get(clientId);

    if (!entry || now.getTime() - entry.windowStart.getTime() > windowMs) {
      // New window
      entry = {
        count: 1,
        windowStart: now,
        blocked: false,
      };
      this.rateLimitMap.set(clientId, entry);
      return { allowed: true, remaining: maxRequests - 1 };
    }

    if (entry.blocked) {
      // Still in blocked period
      return { allowed: false, remaining: 0 };
    }

    entry.count++;

    if (entry.count > maxRequests) {
      // Block for the remainder of the window
      entry.blocked = true;
      this.logSecurityEvent({
        userId: this.extractUserId(request),
        action: 'rate_limit_exceeded',
        resource: 'mcp_adapter',
        result: 'denied',
        reason: `Too many requests: ${entry.count}/${maxRequests}`,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        details: { clientId, requestCount: entry.count, maxRequests },
      });
      return { allowed: false, remaining: 0 };
    }

    return { allowed: true, remaining: maxRequests - entry.count };
  }

  /**
   * Extract user ID from request
   */
  private extractUserId(request: FastifyRequest): string | undefined {
    const user = (request as any).user;
    return user?.id || user?.userId;
  }

  /**
   * Extract user role from request
   */
  private extractUserRole(request: FastifyRequest): string {
    const user = (request as any).user;
    return user?.role || user?.userType || 'guest';
  }

  /**
   * Validate tool access based on user role
   */
  private validateToolAccess(
    toolName: string,
    request: FastifyRequest,
  ): { allowed: boolean; reason?: string } {
    if (!this.options.enableAuth) {
      return { allowed: true };
    }

    const userRole = this.extractUserRole(request);
    const userId = this.extractUserId(request);

    // Define role-based tool permissions
    const rolePermissions: Record<string, string[]> = {
      guest: ['echo', 'get_time', 'ping'],
      user: ['echo', 'get_time', 'get_user_info', 'ping', 'list_files', 'read_file'],
      developer: ['echo', 'get_time', 'get_user_info', 'ping', 'list_files', 'read_file'],
      admin: Array.from(this.tools.keys()), // All tools
    };

    const allowedTools = rolePermissions[userRole] || [];

    if (!allowedTools.includes(toolName)) {
      this.logSecurityEvent({
        userId,
        role: userRole,
        action: 'tool_access_denied',
        resource: toolName,
        result: 'denied',
        reason: `Role '${userRole}' not authorized for tool '${toolName}'`,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return {
        allowed: false,
        reason: `Role '${userRole}' not authorized for tool '${toolName}'`,
      };
    }

    this.logSecurityEvent({
      userId,
      role: userRole,
      action: 'tool_access_granted',
      resource: toolName,
      result: 'allowed',
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    return { allowed: true };
  }

  /**
   * Mount MCP adapter on Fastify instance
   */
  mount(): void {
    const fullPrefix = this.options.prefix;

    // Initialize default resources
    this.resources.set('server://status', {
      name: 'Server Status',
      description: 'Current server status and information',
      mimeType: 'application/json',
    });

    // Register MCP endpoints
    this.registerMCEndpoints(fullPrefix);

    // Add health check
    this.app.get(`${fullPrefix}/health`, (_request, reply) => {
      const healthStatus = {
        status: 'ok',
        adapter: 'mcp',
        timestamp: new Date().toISOString(),
        prefix: fullPrefix,
        capabilities: this.getCapabilities(),
        stats: this.getStats(),
      };

      reply.send(healthStatus);
    });

    // Add tool listing endpoint
    this.app.get(
      `${fullPrefix}/tools`,
      {
        preHandler: this.createAuthMiddleware(),
      },
      (_request, reply) => {
        reply.send({
          tools: Array.from(this.tools.values()).map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
          })),
        });
      },
    );

    // Add resource listing endpoint
    this.app.get(
      `${fullPrefix}/resources`,
      {
        preHandler: this.createAuthMiddleware(),
      },
      (_request, reply) => {
        reply.send({
          resources: Array.from(this.resources.entries()).map(([uri, resource]) => ({
            uri,
            ...resource,
          })),
        });
      },
    );

    // Add capabilities endpoint
    this.app.get(
      `${fullPrefix}/capabilities`,
      {
        preHandler: this.createAuthMiddleware(),
      },
      (_request, reply) => {
        reply.send(this.getCapabilities());
      },
    );

    // Add documentation endpoint
    this.app.get(
      `${fullPrefix}/docs`,
      {
        preHandler: this.createAuthMiddleware(),
      },
      (_request, reply) => {
        reply.send(this.getDocumentation());
      },
    );

    this.app.log.debug(`MCP adapter mounted at ${fullPrefix}`);
  }

  /**
   * Register MCP endpoints
   */
  private registerMCEndpoints(prefix: string): void {
    // Main MCP endpoint for JSON-RPC
    this.app.post(
      `${prefix}`,
      {
        preHandler: this.createAuthMiddleware(),
      },
      async (request, reply) => {
        try {
          const mcpMessage: MCPMessage = request.body as MCPMessage;

          // Validate JSON-RPC format
          if (!mcpMessage.jsonrpc || mcpMessage.jsonrpc !== '2.0') {
            throw new Error("Invalid JSON-RPC version. Must be '2.0'");
          }

          // Handle the request
          const result = await this.handleMCPRequest(mcpMessage, request);

          reply.send(result);
        } catch (error) {
          const mcpError: MCPMessage = {
            jsonrpc: '2.0',
            id: (request.body as MCPMessage).id,
            error: {
              code: -32603,
              message: error instanceof Error ? error.message : 'Internal server error',
            },
          };

          reply.status(500).send(mcpError);
        }
      },
    );

    // Optional GET endpoint for discovery
    this.app.get(`${prefix}`, (_request, reply) => {
      reply.send({
        name: 'Promethean Omni Service MCP',
        version: '1.0.0',
        jsonrpc: '2.0',
        prefix,
        capabilities: this.getCapabilities(),
        endpoints: {
          rpc: `${prefix}`,
          health: `${prefix}/health`,
          tools: `${prefix}/tools`,
          resources: `${prefix}/resources`,
          capabilities: `${prefix}/capabilities`,
          docs: `${prefix}/docs`,
        },
      });
    });
  }

  /**
   * Handle MCP JSON-RPC requests
   */
  private async handleMCPRequest(
    message: MCPMessage,
    request: FastifyRequest,
  ): Promise<MCPMessage> {
    const { method, params, id } = message;

    // Rate limiting check
    const rateLimitResult = this.checkRateLimit(request);
    if (!rateLimitResult.allowed) {
      this.logSecurityEvent({
        userId: this.extractUserId(request),
        role: this.extractUserRole(request),
        action: 'request_rate_limited',
        resource: 'mcp_endpoint',
        result: 'denied',
        reason: 'Rate limit exceeded',
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        details: { method, params },
      });

      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32000,
          message: 'Rate limit exceeded. Please try again later.',
          data: { remaining: rateLimitResult.remaining },
        },
      };
    }

    switch (method) {
      case 'initialize':
        this.logSecurityEvent({
          userId: this.extractUserId(request),
          role: this.extractUserRole(request),
          action: 'mcp_initialize',
          resource: 'mcp_session',
          result: 'allowed',
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        });

        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: this.getCapabilities(),
            serverInfo: {
              name: 'Promethean Omni Service',
              version: '1.0.0',
            },
          },
        };

      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            tools: Array.from(this.tools.values()).map((tool) => ({
              name: tool.name,
              description: tool.description,
              inputSchema: tool.inputSchema,
            })),
          },
        };

      case 'tools/call':
        if (!params?.name) {
          throw new Error('Tool name is required');
        }

        // Validate tool access
        const toolAccess = this.validateToolAccess(params.name, request);
        if (!toolAccess.allowed) {
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32001,
              message: toolAccess.reason || 'Tool access denied',
            },
          };
        }

        return {
          jsonrpc: '2.0',
          id,
          result: await this.callTool(params.name, params.arguments || {}, request),
        };

      case 'resources/list':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            resources: Array.from(this.resources.entries()).map(([uri, resource]) => ({
              uri,
              ...resource,
            })),
          },
        };

      case 'resources/read':
        if (!params?.uri) {
          throw new Error('Resource URI is required');
        }

        return {
          jsonrpc: '2.0',
          id,
          result: await this.readResource(params.uri, request),
        };

      case 'ping':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            message: 'pong',
            timestamp: new Date().toISOString(),
          },
        };

      case 'get_user_info':
        const user = (request as any).user;
        if (!user) {
          throw new Error('Authentication required for user info');
        }

        return {
          jsonrpc: '2.0',
          id,
          result: {
            id: user.id,
            username: user.username,
            email: user.email,
            roles: user.roles,
            permissions: Array.from(user.permissions),
            tokenType: user.tokenType,
          },
        };

      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  /**
   * Call an MCP tool
   */
  private async callTool(toolName: string, args: any, request: FastifyRequest): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    // Validate arguments against tool schema
    this.validateToolArgs(tool.inputSchema, args);

    switch (toolName) {
      case 'echo':
        return {
          result: args.text,
          timestamp: new Date().toISOString(),
        };

      case 'get_time':
        return {
          timestamp: new Date().toISOString(),
          iso: new Date().toISOString(),
          epoch: Math.floor(Date.now() / 1000),
          iso8601: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

      case 'get_user_info':
        const user = (request as any).user;
        if (!user) {
          throw new Error('Authentication required for user info');
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles,
          permissions: Array.from(user.permissions),
          tokenType: user.tokenType,
        };

      case 'list_files':
        return await this.listFiles(args.path, args.recursive || false, request);

      case 'read_file':
        return await this.readFile(args.path, args.encoding || 'utf8', request);

      default:
        throw new Error(`Tool ${toolName} not implemented`);
    }
  }

  /**
   * Read MCP resource
   */
  private async readResource(uri: string, request: FastifyRequest): Promise<any> {
    const resource = this.resources.get(uri);
    if (!resource) {
      throw new Error(`Resource not found: ${uri}`);
    }

    // For file resources, read the actual file
    if (uri.startsWith('file://')) {
      const filePath = uri.substring(7); // Remove "file://" prefix
      return await this.readFile(filePath, 'utf8', request);
    }

    return resource;
  }

  /**
   * List files with comprehensive security validation
   */
  private async listFiles(
    filePath: string,
    recursive: boolean = false,
    request: FastifyRequest,
  ): Promise<any> {
    // Authentication check
    if (this.options.enableAuth && !(request as any).user) {
      throw new Error('Authentication required for file operations');
    }

    // Validate and sanitize the path
    const pathValidation = validateFilePath(filePath, this.options.allowedBasePaths || []);
    if (!pathValidation.valid) {
      throw new Error(`Invalid path: ${pathValidation.error}`);
    }

    const safePath = pathValidation.sanitizedPath!;

    try {
      // For security, we'll implement a restricted file listing
      // Only allow listing within configured base paths or current working directory
      const basePath = this.options.allowedBasePaths?.[0] || process.cwd();
      const fullPath = path.resolve(basePath, safePath);

      // Additional security: ensure we're still within bounds after resolution
      if (!fullPath.startsWith(path.resolve(basePath))) {
        throw new Error('Path traversal attempt detected');
      }

      // Check if path exists and is accessible
      let stats;
      try {
        stats = await fs.stat(fullPath);
      } catch {
        stats = null;
      }
      if (!stats) {
        throw new Error(`Path not found: ${safePath}`);
      }

      if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${safePath}`);
      }

      // List directory contents with security restrictions
      const entries = await fs.readdir(fullPath, { withFileTypes: true });

      const files = entries
        .filter((entry) => {
          // Filter out hidden files and system files for security
          return !entry.name.startsWith('.') && entry.name !== 'node_modules';
        })
        .map((entry) => ({
          name: entry.name,
          path: path.join(safePath, entry.name).replace(/\\/g, '/'),
          type: entry.isDirectory() ? 'directory' : 'file',
          size: 0, // Will be populated for files only if needed
          modified: new Date().toISOString(), // Simplified for security
        }));

      return {
        path: safePath,
        recursive,
        files,
        securityValidated: true,
      };
    } catch (error) {
      // Log security violations without exposing sensitive information
      this.app.log.warn(`Security violation in listFiles: ${safePath}`);

      if (error instanceof Error) {
        throw new Error(`File listing failed: ${error.message}`);
      }
      throw new Error('File listing failed');
    }
  }

  /**
   * Read file with comprehensive security validation
   */
  private async readFile(
    filePath: string,
    encoding: string = 'utf8',
    request: FastifyRequest,
  ): Promise<any> {
    // Authentication check
    if (this.options.enableAuth && !(request as any).user) {
      throw new Error('Authentication required for file operations');
    }

    // Validate and sanitize the path
    const pathValidation = validateFilePath(filePath, this.options.allowedBasePaths || []);
    if (!pathValidation.valid) {
      throw new Error(`Invalid path: ${pathValidation.error}`);
    }

    const safePath = pathValidation.sanitizedPath!;

    // Additional security: check file extension
    if (!isAllowedFileExtension(safePath)) {
      throw new Error('File type not allowed for reading');
    }

    try {
      // Resolve the full path within allowed boundaries
      const basePath = this.options.allowedBasePaths?.[0] || process.cwd();
      const fullPath = path.resolve(basePath, safePath);

      // Security: ensure we're still within bounds after resolution
      if (!fullPath.startsWith(path.resolve(basePath))) {
        throw new Error('Path traversal attempt detected');
      }

      // Check if path exists and is a file
      const stats = await fs.stat(fullPath).catch(() => null);
      if (!stats) {
        throw new Error(`File not found: ${safePath}`);
      }

      if (!stats.isFile()) {
        throw new Error(`Path is not a file: ${safePath}`);
      }

      // Validate file size
      const maxSize = this.options.maxFileSize || 1024 * 1024; // 1MB default
      if (stats.size > maxSize) {
        throw new Error(`File too large: ${stats.size} bytes (max: ${maxSize})`);
      }

      // Read file content
      const content = await fs.readFile(fullPath, encoding as BufferEncoding);

      return {
        path: safePath,
        encoding,
        content: content.toString(),
        size: stats.size,
        securityValidated: true,
      };
    } catch (error) {
      // Log security violations without exposing sensitive information
      this.app.log.warn(`Security violation in readFile: ${safePath}`);

      if (error instanceof Error) {
        throw new Error(`File read failed: ${error.message}`);
      }
      throw new Error('File read failed');
    }
  }

  /**
   * Validate tool arguments against schema
   */
  private validateToolArgs(schema: any, args: any): void {
    if (schema.type !== 'object') {
      return;
    }

    // Check required properties
    if (schema.required) {
      for (const requiredProp of schema.required) {
        if (!(requiredProp in args)) {
          throw new Error(`Missing required argument: ${requiredProp}`);
        }
      }
    }

    // Check property types
    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        if (propName in args) {
          const value = args[propName];
          const propType = (propSchema as any).type;

          // Simple type checking
          if (propType === 'string' && typeof value !== 'string') {
            throw new Error(`Argument ${propName} must be a string`);
          }
          if (propType === 'number' && typeof value !== 'number') {
            throw new Error(`Argument ${propName} must be a number`);
          }
          if (propType === 'boolean' && typeof value !== 'boolean') {
            throw new Error(`Argument ${propName} must be a boolean`);
          }
        }
      }
    }
  }

  /**
   * Get MCP capabilities
   */
  private getCapabilities(): MCPCapabilities {
    return {
      tools: {
        listChanges: false,
        subscribe: false,
        list: true,
      },
      resources: {
        subscribe: false,
        list: true,
      },
      prompts: {
        create: false,
        list: false,
      },
    };
  }

  /**
   * Get adapter statistics
   */
  private getStats(): any {
    return {
      toolsCount: this.tools.size,
      resourcesCount: this.resources.size,
      supportedMethods: [
        'initialize',
        'tools/list',
        'tools/call',
        'resources/list',
        'resources/read',
        'ping',
        'get_user_info',
      ],
    };
  }

  /**
   * Get MCP documentation
   */
  private getDocumentation(): any {
    return {
      title: 'MCP (Model Context Protocol) Documentation',
      version: '1.0.0',
      description: 'MCP server implementation for the Omni Service',
      protocol: 'JSON-RPC 2.0',
      capabilities: this.getCapabilities(),
      tools: Array.from(this.tools.values()).map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        example: this.getToolExample(tool.name),
      })),
      methods: {
        initialize: {
          description: 'Initialize the MCP session',
          params: {},
          result: {
            protocolVersion: '2024-11-05',
            capabilities: 'Capabilities object',
            serverInfo: 'Server information',
          },
        },
        'tools/list': {
          description: 'List available tools',
          params: {},
          result: {
            tools: 'Array of tool definitions',
          },
        },
        'tools/call': {
          description: 'Execute a tool',
          params: {
            name: 'Tool name (string)',
            arguments: 'Tool arguments (object)',
          },
          result: 'Tool execution result',
        },
        'resources/list': {
          description: 'List available resources',
          params: {},
          result: {
            resources: 'Array of resource definitions',
          },
        },
        'resources/read': {
          description: 'Read a resource',
          params: {
            uri: 'Resource URI (string)',
          },
          result: 'Resource content',
        },
        ping: {
          description: 'Test connection',
          params: {},
          result: {
            message: 'pong',
            timestamp: 'ISO timestamp',
          },
        },
        get_user_info: {
          description: 'Get current user information',
          params: {},
          result: {
            id: 'User ID',
            username: 'Username',
            email: 'Email',
            roles: 'User roles',
            permissions: 'User permissions',
          },
        },
      },
      examples: {
        initialize: {
          request: {
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {},
          },
          response: {
            jsonrpc: '2.0',
            id: 1,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {},
              serverInfo: {},
            },
          },
        },
        echo: {
          request: {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/call',
            params: {
              name: 'echo',
              arguments: {
                text: 'Hello, MCP!',
              },
            },
          },
          response: {
            jsonrpc: '2.0',
            id: 2,
            result: {
              result: 'Hello, MCP!',
              timestamp: '2025-06-20T18:45:00.000Z',
            },
          },
        },
      },
      authentication: {
        type: 'JWT Bearer Token',
        header: 'Authorization: Bearer <jwt_token>',
        apikey: 'x-api-key: <api_key>',
      },
    };
  }

  /**
   * Get tool usage example
   */
  private getToolExample(toolName: string): any {
    switch (toolName) {
      case 'echo':
        return {
          request: {
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
              name: 'echo',
              arguments: {
                text: 'Hello from MCP!',
              },
            },
          },
          response: {
            jsonrpc: '2.0',
            id: 3,
            result: {
              result: 'Hello from MCP!',
              timestamp: '2025-06-20T18:45:00.000Z',
            },
          },
        };

      case 'get_time':
        return {
          request: {
            jsonrpc: '2.0',
            id: 4,
            method: 'tools/call',
            params: {
              name: 'get_time',
              arguments: {},
            },
          },
          response: {
            jsonrpc: '2.0',
            id: 4,
            result: {
              timestamp: '2025-06-20T18:45:00.000Z',
              iso: '2025-06-20T18:45:00.000Z',
              epoch: 1650482700,
              iso8601: '2025-06-20T18:45:00.000Z',
              timezone: 'UTC',
            },
          },
        };

      default:
        return {
          request: {
            jsonrpc: '2.0',
            id: 5,
            method: 'tools/call',
            params: {
              name: toolName,
              arguments: {},
            },
          },
          response: {
            jsonrpc: '2.0',
            id: 5,
            result: 'Tool execution result',
          },
        };
    }
  }

  /**
   * Create authentication middleware
   */
  private createAuthMiddleware() {
    const authManager = (this.app as any).authManager;
    if (!authManager) {
      throw new Error('[SECURITY] AuthManager is required when enableAuth=true');
    }

    return authManager.createAuthMiddleware({
      required: true, // Always require authentication for security
    });
  }
}

/**
 * Mount MCP adapter with authentication integration
 */
export function mountMCPAdapter(
  app: FastifyInstance,
  options: MCPAdapterOptions,
  _authManager?: any,
): void {
  const mcpAdapter = new MCPAdapter(app, options);

  // Store adapter instance in app for access
  (app as any).mcpAdapter = mcpAdapter;

  // Mount the adapter
  mcpAdapter.mount();
}

export { MCPAdapter };
export default MCPAdapter;
