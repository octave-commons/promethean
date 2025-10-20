/**
 * MCP (Model Context Protocol) Tool Adapter for Pantheon
 *
 * This adapter provides MCP tool interfaces that can be used by LLMs
 * to interact with the Pantheon Agent Management Framework.
 */

// Extended ToolPort interface for MCP functionality
export interface ToolPort {
  execute(command: string, args?: Record<string, unknown>): Promise<unknown>;
  list?(): Promise<string[]>;
  register?(tool: MCPTool): void;
  getSchema?(toolName: string): Promise<any>;
}

export type MCPTool = {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (args: any) => Promise<any>;
};

export type MCPToolResult = {
  success: boolean;
  result?: any;
  error?: string;
};

export function makeMCPToolAdapter(): ToolPort {
  const tools = new Map<string, MCPTool>();

  return {
    async execute(toolName: string, args: Record<string, any>): Promise<any> {
      const tool = tools.get(toolName);
      if (!tool) {
        throw new Error(`Tool ${toolName} not found`);
      }

      try {
        const result = await tool.handler(args);
        return {
          success: true,
          result,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },

    async list(): Promise<string[]> {
      return Array.from(tools.keys());
    },

    register(tool: MCPTool): void {
      tools.set(tool.name, tool);
    },

    async getSchema(toolName: string): Promise<any> {
      const tool = tools.get(toolName);
      if (!tool) {
        throw new Error(`Tool ${toolName} not found`);
      }
      return tool.inputSchema;
    },
  };
}

// Predefined MCP tools for Pantheon operations
export const createActorTool: MCPTool = {
  name: 'create_actor',
  description: 'Create a new actor in the Pantheon system',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of the actor',
      },
      type: {
        type: 'string',
        description: 'Type of actor (e.g., "llm", "tool", "workflow")',
      },
      config: {
        type: 'object',
        description: 'Configuration object for the actor',
      },
    },
    required: ['name', 'type'],
  },
  handler: async (args) => {
    // This would integrate with the ActorPort to create an actor
    const { name, type, config } = args;
    return {
      actorId: `actor_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name,
      type,
      config,
      status: 'created',
    };
  },
};

export const tickActorTool: MCPTool = {
  name: 'tick_actor',
  description: 'Execute a tick on an actor',
  inputSchema: {
    type: 'object',
    properties: {
      actorId: {
        type: 'string',
        description: 'ID of the actor to tick',
      },
    },
    required: ['actorId'],
  },
  handler: async (args) => {
    const { actorId } = args;
    // This would integrate with the ActorPort to tick an actor
    return {
      actorId,
      ticked: true,
      timestamp: Date.now(),
    };
  },
};

export const compileContextTool: MCPTool = {
  name: 'compile_context',
  description: 'Compile context from various sources',
  inputSchema: {
    type: 'object',
    properties: {
      sources: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of context sources',
      },
      text: {
        type: 'string',
        description: 'Text to compile into context',
      },
    },
    required: ['sources'],
  },
  handler: async (args) => {
    const { sources, text = '' } = args;
    // This would integrate with the ContextPort to compile context
    return {
      contextId: `ctx_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      sources,
      text,
      compiled: true,
      timestamp: Date.now(),
    };
  },
};

// Factory function to create MCP adapter with default tools
export function makeMCPAdapterWithDefaults(): ToolPort {
  const adapter = makeMCPToolAdapter();

  adapter.register?.(createActorTool);
  adapter.register?.(tickActorTool);
  adapter.register?.(compileContextTool);

  return adapter;
}
