# Package Consolidation Migration Guide

## Overview

This guide helps migrate existing packages to use the new centralized configuration and common types system.

## Phase 1: Build Configuration Migration

### 1.1 Update package.json Scripts

Replace your existing scripts with centralized configurations:

```json
{
  "scripts": {
    "build": "tsc",
    "clean": "rimraf dist",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "pnpm run build && ava --config ../../config/ava.config.mjs",
    "lint": "pnpm exec eslint .",
    "format": "pnpm exec prettier --write ."
  }
}
```

### 1.2 Update TypeScript Configuration

Replace your `tsconfig.json` with:

```json
{
  "extends": "@promethean-os/build-config/typescript",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "**/*.test.ts"]
}
```

For strict type checking:

```json
{
  "extends": "@promethean-os/build-config/typescript/strict",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### 1.3 Update Dependencies

Add to your package.json:

```json
{
  "devDependencies": {
    "@promethean-os/build-config": "workspace:*"
  }
}
```

## Phase 2: Type Safety Migration

### 2.1 Replace `any` Types

Install common types:

```json
{
  "dependencies": {
    "@promethean-os/common-types": "workspace:*"
  }
}
```

Replace `any` usage with proper types:

```typescript
// Before
import { McpTool } from './types';
const handler = (args: any) => Promise<any>;

// After
import { McpTool, McpContext, McpToolResult } from '@promethean-os/common-types/mcp';
const handler = (args: unknown, context: McpContext): Promise<McpToolResult> => {
  // Implementation with proper typing
};
```

### 2.2 MCP Package Migration

```typescript
// Before
export interface Tool {
  name: string;
  handler: (args: any) => Promise<any>;
}

// After
import { McpTool, ToolHandler } from '@promethean-os/common-types/mcp';
export interface Tool extends McpTool {
  // Additional tool-specific properties
}
```

### 2.3 Kanban Package Migration

```typescript
// Before
export interface Task {
  uuid: string;
  status: string; // Any string allowed
  metadata: any;
}

// After
import { TaskContext, TaskStatus } from '@promethean-os/common-types/kanban';
export interface Task extends TaskContext {
  // Additional task-specific properties
}
```

### 2.4 Event System Migration

```typescript
// Before
export interface EventHandler {
  (event: any): void;
}

// After
import { EventHandler, Event } from '@promethean-os/common-types/events';
export interface MyEventHandler extends EventHandler<string> {
  // Typed event handling
}
```

## Phase 3: Validation Migration

### 3.1 Replace Manual Validation

```typescript
// Before
function validateTask(data: any): boolean {
  return typeof data.uuid === 'string' && typeof data.title === 'string';
}

// After
import { createSchemaValidator } from '@promethean-os/common-types/validation';
import { TaskContextSchema } from '@promethean-os/common-types/kanban';

const taskValidator = createSchemaValidator(TaskContextSchema);
const isValid = taskValidator.validate(data);
```

## Phase 4: Configuration Examples

### 4.1 Standard Package Configuration

```json
{
  "name": "@promethean-os/my-package",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "clean": "rimraf dist",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "pnpm run build && ava --config ../../config/ava.config.mjs",
    "lint": "pnpm exec eslint .",
    "format": "pnpm exec prettier --write ."
  },
  "dependencies": {
    "@promethean-os/common-types": "workspace:*"
  },
  "devDependencies": {
    "@promethean-os/build-config": "workspace:*"
  }
}
```

```json
{
  "extends": "@promethean-os/build-config/typescript",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "**/*.test.ts"]
}
```

### 4.2 Test Package Configuration

```json
{
  "extends": "@promethean-os/build-config/typescript/test",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*", "**/*.test.ts"],
  "exclude": ["dist", "node_modules"]
}
```

## Phase 5: Migration Checklist

### 5.1 Pre-Migration

- [ ] Backup current package configuration
- [ ] Document current type usage patterns
- [ ] Identify all `any` type usages
- [ ] List custom validation logic

### 5.2 Migration Steps

- [ ] Add build-config and common-types dependencies
- [ ] Update tsconfig.json to extend base configuration
- [ ] Replace `any` types with proper interfaces
- [ ] Update validation to use Zod schemas
- [ ] Replace manual error handling with common patterns
- [ ] Update test files to use new types

### 5.3 Post-Migration

- [ ] Run `pnpm build` and verify no errors
- [ ] Run `pnpm typecheck` and verify strict compliance
- [ ] Run `pnpm lint` and fix any new issues
- [ ] Run `pnpm test` and ensure all tests pass
- [ ] Verify package functionality unchanged

## Phase 6: Common Migration Patterns

### 6.1 MCP Tools

```typescript
// Migration pattern for MCP tools
import { McpTool, McpContext, McpToolResult } from '@promethean-os/common-types/mcp';

export const myTool: McpTool = {
  name: 'my-tool',
  description: 'Description of my tool',
  parameters: {
    input: { type: 'string', description: 'Input parameter' },
  },
  handler: async (args: unknown, context: McpContext): Promise<McpToolResult> => {
    try {
      const validated = validateArgs(args);
      return { success: true, result: processInput(validated) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};
```

### 6.2 Kanban Integration

```typescript
// Migration pattern for Kanban extensions
import {
  TaskContext,
  TransitionRule,
  TransitionContext,
  TaskTransitionHandler,
} from '@promethean-os/common-types/kanban';

export const myTransitionRule: TransitionRule = {
  from: 'ready',
  to: 'in-progress',
  condition: (task: TaskContext, context: TransitionContext): boolean => {
    return task.assignee === context.actor;
  },
  action: async (task: TaskContext, context: TransitionContext): Promise<void> => {
    await notifyAssignment(task, context);
  },
};
```

### 6.3 Event Handling

```typescript
// Migration pattern for event systems
import { Event, EventHandler, EventContext, EventBus } from '@promethean-os/common-types/events';

export const myEventHandler: EventHandler<string> = {
  eventType: 'my-event',
  handler: async (event: Event<string>, context: EventContext): Promise<void> => {
    console.log(`Processing event ${event.id} with data: ${event.data}`);
  },
};
```

## Troubleshooting

### Common Issues

1. **TypeScript Compilation Errors**

   - Ensure all dependencies are installed
   - Check for conflicting type definitions
   - Verify tsconfig.json extends correctly

2. **Import Resolution Issues**

   - Use full import paths: `@promethean-os/common-types/mcp`
   - Verify workspace dependencies are properly linked
   - Check package.json exports configuration

3. **Validation Errors**
   - Ensure Zod schemas match data structures
   - Use proper validation error handling
   - Test validation with edge cases

### Getting Help

- Check existing migrated packages for examples
- Review build-config package documentation
- Consult common-types package API reference
- Use TypeScript compiler output for debugging

## Benefits of Migration

1. **Type Safety**: Eliminate runtime errors with proper typing
2. **Consistency**: Standardized patterns across all packages
3. **Maintainability**: Centralized configuration reduces duplication
4. **Developer Experience**: Better IDE support and autocomplete
5. **Testing**: Easier to write and maintain type-safe tests
