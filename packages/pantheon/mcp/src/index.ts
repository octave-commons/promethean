/**
 * MCP (Model Context Protocol) Tool Adapter for Pantheon
 *
 * This adapter provides MCP tool interfaces that can be used by LLMs
 * to interact with the Pantheon Agent Management Framework.
 */

import type { ToolPort, ToolSpec } from '@promethean-os/pantheon-core';

// Extended ToolPort interface for MCP functionality
export interface MCPToolPort extends ToolPort {
  list(): Promise<string[]>;
  getSchema(toolName: string): Promise<any>;
  execute(command: string, args?: Record<string, unknown>): Promise<unknown>;
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

export function makeMCPToolAdapter(): MCPToolPort {
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

    register(tool: ToolSpec): void {
      // Convert ToolSpec to MCPTool format
      const mcpTool: MCPTool = {
        name: tool.name,
        description: tool.description,
        inputSchema: {
          type: 'object',
          properties: (tool as any).parameters || {},
          required: (tool as any).required || [],
        },
        handler: (tool as any).handler || async () => ({ result: 'Tool executed' }),
      };
      tools.set(tool.name, mcpTool);
    },

    async getSchema(toolName: string): Promise<any> {
      const tool = tools.get(toolName);
      if (!tool) {
        throw new Error(`Tool ${toolName} not found`);
      }
      return tool.inputSchema;
    },

    async invoke(name: string, args: Record<string, unknown>): Promise<unknown> {
      const tool = tools.get(name);
      if (!tool) {
        throw new Error(`Tool '${name}' not found`);
      }

      try {
        return await tool.handler(args);
      } catch (error) {
        throw new Error(
          `Tool '${name}' execution failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
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
export function makeMCPAdapterWithDefaults(): MCPToolPort {
  const adapter = makeMCPToolAdapter();

  // Register predefined tools as ToolSpec
  adapter.register({
    name: createActorTool.name,
    description: createActorTool.description,
    parameters: createActorTool.inputSchema.properties,
    runtime: 'local',
  } as ToolSpec);

  adapter.register({
    name: tickActorTool.name,
    description: tickActorTool.description,
    parameters: tickActorTool.inputSchema.properties,
    runtime: 'local',
  } as ToolSpec);

  adapter.register({
    name: compileContextTool.name,
    description: compileContextTool.description,
    parameters: compileContextTool.inputSchema.properties,
    runtime: 'local',
  } as ToolSpec);

  return adapter;
}