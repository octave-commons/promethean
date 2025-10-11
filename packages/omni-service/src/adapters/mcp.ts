import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { UserContext } from '../auth/types.js';

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
 * MCP adapter class
 */
class MCPAdapter {
  private app: FastifyInstance;
  private options: MCPAdapterOptions;
  private tools: Map<string, MCPTool> = new Map();
  private resources: Map<string, any> = new Map();

  constructor(app: FastifyInstance, options: MCPAdapterOptions) {
    this.app = app;
    this.options = options;

    // Register default tools
    defaultTools.forEach((tool) => {
      this.tools.set(tool.name, tool);
    });
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
    this.app.get(`${fullPrefix}/health`, (request, reply) => {
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
      (request, reply) => {
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
      (request, reply) => {
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
      (request, reply) => {
        reply.send(this.getCapabilities());
      },
    );

    // Add documentation endpoint
    this.app.get(
      `${fullPrefix}/docs`,
      {
        preHandler: this.createAuthMiddleware(),
      },
      (request, reply) => {
        reply.send(this.getDocumentation());
      },
    );

    this.app.log.info(`MCP adapter mounted at ${fullPrefix}`);
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
    this.app.get(`${prefix}`, (request, reply) => {
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

    switch (method) {
      case 'initialize':
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
        return await this.listFiles(args.path, args.recursive || false);

      case 'read_file':
        return await this.readFile(args.path, args.encoding || 'utf8');

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
      return await this.readFile(filePath);
    }

    return resource;
  }

  /**
   * List files (mock implementation)
   */
  private async listFiles(path: string, recursive: boolean = false): Promise<any> {
    // Mock file listing
    const mockFiles = [
      {
        name: 'README.md',
        path: 'README.md',
        type: 'file',
        size: 1024,
        modified: new Date().toISOString(),
      },
      {
        name: 'package.json',
        path: 'package.json',
        type: 'file',
        size: 2048,
        modified: new Date().toISOString(),
      },
    ];

    if (recursive) {
      mockFiles.push({
        name: 'src',
        path: 'src',
        type: 'directory',
        size: 4096,
        modified: new Date().toISOString(),
      });
    }

    return {
      path,
      recursive,
      files: mockFiles,
    };
  }

  /**
   * Read file (mock implementation)
   */
  private async readFile(path: string, encoding: string = 'utf8'): Promise<any> {
    // Mock file reading
    const mockFiles: Record<string, string> = {
      'README.md': '# README\nThis is a mock README file for the MCP adapter.',
      'package.json': JSON.stringify(
        {
          name: '@promethean/omni-service',
          version: '1.0.0',
          description: 'Omni Service with MCP support',
        },
        null,
        2,
      ),
    };

    const content = mockFiles[path];
    if (content === undefined) {
      throw new Error(`File not found: ${path}`);
    }

    return {
      path,
      encoding,
      content,
      size: content.length,
    };
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
      return undefined;
    }

    return authManager.createAuthMiddleware({
      required: this.options.enableAuth,
    });
  }
}

/**
 * Mount MCP adapter with authentication integration
 */
export function mountMCPAdapter(
  app: FastifyInstance,
  options: MCPAdapterOptions,
  authManager?: any,
): void {
  const mcpAdapter = new MCPAdapter(app, options);

  // Store adapter instance in app for access
  (app as any).mcpAdapter = mcpAdapter;

  // Mount the adapter
  mcpAdapter.mount();
}

export default MCPAdapter;
