# Pantheon MCP (Model Context Protocol)

## Overview

`@promethean-os/pantheon-mcp` provides a Model Context Protocol (MCP) tool adapter for the Pantheon Agent Management Framework. It enables standardized AI agent interfaces through tool registration, execution, and schema validation.

## Key Features

- **MCP Compliance**: Full support for Model Context Protocol standards
- **Tool Registration**: Dynamic tool registration and management
- **Schema Validation**: JSON Schema validation for tool parameters
- **Error Handling**: Comprehensive error handling and result formatting
- **Predefined Tools**: Built-in tools for common Pantheon operations
- **Extensible Design**: Easy to add custom tools

## Installation

```bash
pnpm add @promethean-os/pantheon-mcp
```

## Core Concepts

### MCP Tool Interface

The MCP adapter extends the standard ToolPort interface with MCP-specific functionality:

```typescript
import { makeMCPToolAdapter, MCPTool, MCPToolResult } from '@promethean-os/pantheon-mcp';

// Create MCP adapter
const mcpAdapter = makeMCPToolAdapter();

// Define a custom tool
const weatherTool: MCPTool = {
  name: 'get_weather',
  description: 'Gets current weather information for a location',
  inputSchema: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'The location to get weather for',
      },
      units: {
        type: 'string',
        enum: ['metric', 'imperial'],
        default: 'metric',
        description: 'Temperature units',
      },
    },
    required: ['location'],
  },
  handler: async (args) => {
    const { location, units = 'metric' } = args;

    // Simulate weather API call
    const weatherData = {
      temperature: units === 'metric' ? 22 : 72,
      condition: 'sunny',
      humidity: 65,
      location,
    };

    return {
      success: true,
      data: weatherData,
      formatted: `Weather in ${location}: ${weatherData.temperature}°${units === 'metric' ? 'C' : 'F'}, ${weatherData.condition}`,
    };
  },
};

// Register the tool
mcpAdapter.register?.(weatherTool);
```

### Tool Execution

```typescript
// Execute a registered tool
try {
  const result = await mcpAdapter.execute('get_weather', {
    location: 'New York',
    units: 'metric',
  });

  console.log('Weather result:', result);
  // Output: Weather result: { success: true, data: {...}, formatted: "..." }
} catch (error) {
  console.error('Tool execution failed:', error);
}
```

### Tool Discovery

```typescript
// List all registered tools
const toolNames = await mcpAdapter.list?.();
console.log('Available tools:', toolNames);
// Output: Available tools: ['get_weather', 'create_actor', 'tick_actor', ...]

// Get tool schema
const weatherSchema = await mcpAdapter.getSchema?.('get_weather');
console.log('Weather tool schema:', weatherSchema);
```

## Predefined Tools

The MCP adapter comes with predefined tools for common Pantheon operations:

### create_actor Tool

Creates a new actor in the Pantheon system.

```typescript
const createActorResult = await mcpAdapter.execute('create_actor', {
  name: 'customer-service-agent',
  type: 'llm',
  config: {
    model: 'gpt-3.5-turbo',
    systemPrompt: 'You are a helpful customer service agent.',
    temperature: 0.7,
  },
});

console.log(createActorResult);
// Output: { actorId: "actor_1234567890_abcd", name: "customer-service-agent", type: "llm", status: "created" }
```

### tick_actor Tool

Executes a tick on an existing actor.

```typescript
const tickResult = await mcpAdapter.execute('tick_actor', {
  actorId: 'actor_1234567890_abcd',
  message: 'Help me track my order',
});

console.log(tickResult);
// Output: { actorId: "actor_1234567890_abcd", ticked: true, timestamp: 1699123456789 }
```

### compile_context Tool

Compiles context from various sources.

```typescript
const contextResult = await mcpAdapter.execute('compile_context', {
  sources: ['sessions', 'agent-tasks', 'user-preferences'],
  text: 'User wants to check order status and return policy',
});

console.log(contextResult);
// Output: { contextId: "ctx_1234567890_efgh", sources: [...], compiled: true, timestamp: 1699123456789 }
```

## Advanced Usage

### Custom Tool Development

Create sophisticated tools with complex logic:

```typescript
import { MCPTool } from '@promethean-os/pantheon-mcp';

const dataAnalysisTool: MCPTool = {
  name: 'analyze_data',
  description: 'Performs comprehensive data analysis with multiple visualization options',
  inputSchema: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: { type: 'object' },
        description: 'Array of data objects to analyze',
      },
      analysisType: {
        type: 'string',
        enum: ['statistical', 'trend', 'correlation', 'distribution'],
        default: 'statistical',
        description: 'Type of analysis to perform',
      },
      options: {
        type: 'object',
        properties: {
          includeVisualization: {
            type: 'boolean',
            default: true,
          },
          confidenceLevel: {
            type: 'number',
            minimum: 0.8,
            maximum: 0.99,
            default: 0.95,
          },
          outputFormat: {
            type: 'string',
            enum: ['json', 'csv', 'html'],
            default: 'json',
          },
        },
      },
    },
    required: ['data'],
  },
  handler: async (args) => {
    const { data, analysisType = 'statistical', options = {} } = args;

    try {
      // Perform data validation
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Data must be a non-empty array');
      }

      // Perform analysis based on type
      let analysisResult;

      switch (analysisType) {
        case 'statistical':
          analysisResult = await performStatisticalAnalysis(data, options);
          break;
        case 'trend':
          analysisResult = await performTrendAnalysis(data, options);
          break;
        case 'correlation':
          analysisResult = await performCorrelationAnalysis(data, options);
          break;
        case 'distribution':
          analysisResult = await performDistributionAnalysis(data, options);
          break;
        default:
          throw new Error(`Unsupported analysis type: ${analysisType}`);
      }

      // Generate visualization if requested
      if (options.includeVisualization) {
        analysisResult.visualization = await generateVisualization(
          analysisResult,
          options.outputFormat,
        );
      }

      return {
        success: true,
        analysisType,
        result: analysisResult,
        metadata: {
          dataPoints: data.length,
          analysisTime: Date.now(),
          confidence: options.confidenceLevel || 0.95,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          timestamp: Date.now(),
        },
      };
    }
  },
};

// Helper functions (implementations would go here)
async function performStatisticalAnalysis(data: any[], options: any) {
  // Implementation for statistical analysis
  return {
    mean: calculateMean(data),
    median: calculateMedian(data),
    standardDeviation: calculateStdDev(data),
    percentiles: calculatePercentiles(data),
  };
}

async function generateVisualization(result: any, format: string) {
  // Implementation for visualization generation
  switch (format) {
    case 'html':
      return generateHTMLChart(result);
    case 'json':
      return generateJSONChart(result);
    default:
      return result;
  }
}
```

### Tool Composition

Create tools that use other tools:

```typescript
const comprehensiveReportTool: MCPTool = {
  name: 'generate_comprehensive_report',
  description: 'Generates a comprehensive report using multiple analysis tools',
  inputSchema: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: { type: 'object' },
        description: 'Data to analyze',
      },
      reportSections: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['summary', 'trends', 'correlations', 'distributions', 'recommendations'],
        },
        default: ['summary', 'trends'],
      },
    },
    required: ['data'],
  },
  handler: async (args, context) => {
    const { data, reportSections = ['summary', 'trends'] } = args;

    // Use other tools to generate report sections
    const report = {
      title: 'Comprehensive Data Analysis Report',
      generatedAt: new Date().toISOString(),
      sections: {},
    };

    // Generate summary
    if (reportSections.includes('summary')) {
      const summaryResult = await context.execute('analyze_data', {
        data,
        analysisType: 'statistical',
        options: { includeVisualization: false },
      });
      report.sections.summary = summaryResult.result;
    }

    // Generate trends
    if (reportSections.includes('trends')) {
      const trendResult = await context.execute('analyze_data', {
        data,
        analysisType: 'trend',
        options: { includeVisualization: true },
      });
      report.sections.trends = trendResult.result;
    }

    // Generate correlations
    if (reportSections.includes('correlations')) {
      const correlationResult = await context.execute('analyze_data', {
        data,
        analysisType: 'correlation',
        options: { confidenceLevel: 0.99 },
      });
      report.sections.correlations = correlationResult.result;
    }

    return {
      success: true,
      report,
    };
  },
};
```

### Error Handling and Validation

Implement robust error handling and input validation:

```typescript
const robustTool: MCPTool = {
  name: 'secure_file_operation',
  description: 'Performs secure file operations with validation',
  inputSchema: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['read', 'write', 'append', 'delete'],
        description: 'File operation to perform',
      },
      filePath: {
        type: 'string',
        pattern: '^/safe/directory/.*\\.(txt|json|csv)$',
        description: 'Safe file path (restricted to specific directory)',
      },
      content: {
        type: 'string',
        maxLength: 10000,
        description: 'Content to write (for write/append operations)',
      },
      options: {
        type: 'object',
        properties: {
          createBackup: {
            type: 'boolean',
            default: true,
          },
          encoding: {
            type: 'string',
            enum: ['utf8', 'ascii', 'base64'],
            default: 'utf8',
          },
        },
      },
    },
    required: ['operation', 'filePath'],
  },
  handler: async (args) => {
    const { operation, filePath, content, options = {} } = args;

    try {
      // Validate file path security
      if (!filePath.startsWith('/safe/directory/')) {
        throw new Error('Access denied: File path outside allowed directory');
      }

      // Check for path traversal attempts
      if (filePath.includes('..')) {
        throw new Error('Security violation: Path traversal detected');
      }

      // Perform operation
      let result;
      switch (operation) {
        case 'read':
          result = await secureReadFile(filePath, options);
          break;
        case 'write':
          if (!content) {
            throw new Error('Content is required for write operation');
          }
          result = await secureWriteFile(filePath, content, options);
          break;
        case 'append':
          if (!content) {
            throw new Error('Content is required for append operation');
          }
          result = await secureAppendFile(filePath, content, options);
          break;
        case 'delete':
          result = await secureDeleteFile(filePath, options);
          break;
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      return {
        success: true,
        operation,
        filePath,
        result,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation,
        filePath,
        timestamp: Date.now(),
      };
    }
  },
};

// Secure file operation implementations
async function secureReadFile(filePath: string, options: any) {
  // Implementation with security checks
  const fs = await import('fs/promises');
  return await fs.readFile(filePath, options.encoding || 'utf8');
}

async function secureWriteFile(filePath: string, content: string, options: any) {
  // Implementation with backup creation
  const fs = await import('fs/promises');

  if (options.createBackup) {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    await fs.copyFile(filePath, backupPath);
  }

  return await fs.writeFile(filePath, content, options.encoding || 'utf8');
}
```

## Integration with Pantheon

### Using MCP Adapter in Orchestrator

```typescript
import { makeOrchestrator } from '@promethean-os/pantheon-core';
import { makeMCPAdapterWithDefaults } from '@promethean-os/pantheon-mcp';

// Create MCP adapter with default tools
const mcpAdapter = makeMCPAdapterWithDefaults();

// Register custom tools
mcpAdapter.register?.(weatherTool);
mcpAdapter.register?.(dataAnalysisTool);

// Create orchestrator with MCP adapter
const orchestrator = makeOrchestrator({
  now: () => Date.now(),
  log: console.log,
  context: contextAdapter,
  tools: mcpAdapter, // Use MCP adapter as tool port
  llm: llmAdapter,
  bus: messageBus,
  schedule: scheduler,
  state: actorStateAdapter,
});
```

### Actor Tool Usage

Actors can use MCP tools through their behaviors:

```typescript
const dataAnalystBehavior: Behavior = {
  name: 'analyze-dataset',
  description: 'Analyzes datasets using MCP tools',
  mode: 'active',
  plan: async ({ goal, context }) => {
    // Extract data from context or goal
    const dataset = extractDatasetFromContext(context);

    // Use MCP tool for analysis
    const analysisResult = await toolPort.invoke('analyze_data', {
      data: dataset,
      analysisType: 'statistical',
      options: {
        includeVisualization: true,
        confidenceLevel: 0.95,
      },
    });

    return {
      actions: [
        {
          type: 'message',
          content: `Analysis complete: ${JSON.stringify(analysisResult, null, 2)}`,
          target: 'user',
        },
      ],
    };
  },
};
```

## Configuration

### MCP Adapter Configuration

```typescript
interface MCPAdapterConfig {
  maxConcurrentExecutions: number;
  defaultTimeout: number;
  enableLogging: boolean;
  allowedTools: string[];
  security: {
    enableInputValidation: boolean;
    maxPayloadSize: number;
    allowedSchemas: string[];
  };
}

const config: MCPAdapterConfig = {
  maxConcurrentExecutions: 10,
  defaultTimeout: 30000,
  enableLogging: true,
  allowedTools: ['*'], // Allow all tools, or specify array
  security: {
    enableInputValidation: true,
    maxPayloadSize: 1024 * 1024, // 1MB
    allowedSchemas: ['*'], // Allow all schemas
  },
};
```

### Environment Variables

```bash
# MCP Configuration
MCP_MAX_CONCURRENT_EXECUTIONS=10
MCP_DEFAULT_TIMEOUT=30000
MCP_ENABLE_LOGGING=true
MCP_MAX_PAYLOAD_SIZE=1048576

# Security
MCP_ENABLE_INPUT_VALIDATION=true
MCP_ALLOWED_TOOLS=create_actor,tick_actor,analyze_data
```

## Testing

### Unit Testing MCP Tools

```typescript
import test from 'ava';
import { makeMCPToolAdapter } from '@promethean-os/pantheon-mcp';

test('MCP tool execution', async (t) => {
  const adapter = makeMCPToolAdapter();

  const testTool: MCPTool = {
    name: 'echo',
    description: 'Echoes the input',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
      required: ['message'],
    },
    handler: async (args) => ({ echo: args.message }),
  };

  adapter.register?.(testTool);

  const result = await adapter.execute('echo', { message: 'Hello World' });

  t.deepEqual(result, { echo: 'Hello World' });
});

test('MCP tool error handling', async (t) => {
  const adapter = makeMCPToolAdapter();

  const errorTool: MCPTool = {
    name: 'error_tool',
    description: 'Always throws an error',
    inputSchema: { type: 'object' },
    handler: async () => {
      throw new Error('Test error');
    },
  };

  adapter.register?.(errorTool);

  const result = await adapter.execute('error_tool', {});

  t.is(result.success, false);
  t.is(result.error, 'Test error');
});
```

### Integration Testing

```typescript
test('MCP adapter with orchestrator', async (t) => {
  const mcpAdapter = makeMCPAdapterWithDefaults();
  const orchestrator = makeOrchestrator({
    // ... other dependencies
    tools: mcpAdapter,
  });

  // Create actor that uses MCP tools
  const actor = createActorWithMCPTools();

  // Execute actor and verify MCP tool usage
  await orchestrator.tickActor(actor);

  // Assert results
  t.pass();
});
```

## Performance Considerations

### Tool Execution Optimization

```typescript
// Implement caching for expensive operations
const cache = new Map<string, any>();

const cachedAnalysisTool: MCPTool = {
  name: 'cached_analysis',
  description: 'Analysis tool with caching',
  inputSchema: {
    type: 'object',
    properties: {
      data: { type: 'array' },
      analysisType: { type: 'string' },
    },
    required: ['data', 'analysisType'],
  },
  handler: async (args) => {
    const cacheKey = `${args.analysisType}_${JSON.stringify(args.data)}`;

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    // Perform expensive analysis
    const result = await performExpensiveAnalysis(args);

    // Cache result with TTL
    cache.set(cacheKey, result);
    setTimeout(() => cache.delete(cacheKey), 300000); // 5 minutes

    return result;
  },
};
```

### Concurrent Execution Control

```typescript
// Limit concurrent tool executions
class ConcurrencyLimiter {
  private running = 0;
  private queue: Array<() => void> = [];

  constructor(private limit: number) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const run = async () => {
        this.running++;
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          this.processQueue();
        }
      };

      if (this.running < this.limit) {
        run();
      } else {
        this.queue.push(run);
      }
    });
  }

  private processQueue() {
    if (this.queue.length > 0 && this.running < this.limit) {
      const next = this.queue.shift()!;
      next();
    }
  }
}

const limiter = new ConcurrencyLimiter(5);

const rateLimitedTool: MCPTool = {
  name: 'rate_limited_operation',
  description: 'Operation with rate limiting',
  inputSchema: { type: 'object' },
  handler: async (args) => {
    return await limiter.execute(async () => {
      // Perform rate-limited operation
      return await performOperation(args);
    });
  },
};
```

## Security Considerations

### Input Sanitization

```typescript
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const secureTool: MCPTool = {
  name: 'secure_html_processor',
  description: 'Processes HTML content securely',
  inputSchema: {
    type: 'object',
    properties: {
      htmlContent: { type: 'string' },
    },
    required: ['htmlContent'],
  },
  handler: async (args) => {
    // Sanitize HTML content
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);

    const cleanHtml = purify.sanitize(args.htmlContent, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
      ALLOWED_ATTR: [],
    });

    return {
      originalLength: args.htmlContent.length,
      sanitizedLength: cleanHtml.length,
      sanitizedContent: cleanHtml,
    };
  },
};
```

### Access Control

```typescript
interface AccessControlledTool extends MCPTool {
  requiredPermissions: string[];
}

const adminTool: AccessControlledTool = {
  name: 'admin_operation',
  description: 'Administrative operation requiring special permissions',
  requiredPermissions: ['admin', 'system.write'],
  inputSchema: { type: 'object' },
  handler: async (args, context) => {
    // Check permissions
    const userPermissions = context.user?.permissions || [];
    const hasPermission = this.requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new Error('Insufficient permissions for this operation');
    }

    // Perform admin operation
    return await performAdminOperation(args);
  },
};
```

## Related Documentation

- [[pantheon-core]]: Core framework concepts
- [[api-reference.md|API Reference]]: Complete API documentation
- [[integration-guide.md|Integration Guide]]: Integration patterns
- [[troubleshooting-faq.md|Troubleshooting]]: Common issues and solutions

## File Locations

- **MCP Adapter**: `/packages/pantheon-mcp/src/index.ts`
- **Tool Types**: `/packages/pantheon-mcp/src/types.ts`
- **Predefined Tools**: `/packages/pantheon-mcp/src/tools.ts`
- **Tests**: `/packages/pantheon-mcp/src/tests/`

---

Pantheon MCP provides a robust, standards-compliant interface for tool integration in AI agents, with comprehensive error handling, security features, and performance optimizations.
