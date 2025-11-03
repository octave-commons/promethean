import { z } from 'zod';

export interface McpTool {
  readonly name: string;
  readonly description: string;
  readonly parameters: Readonly<Record<string, unknown>>;
  readonly handler: (args: unknown) => Promise<unknown>;
}

export interface McpToolResult {
  readonly success: boolean;
  readonly result?: unknown;
  readonly error?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface McpContext {
  readonly requestId?: string;
  readonly sessionId?: string;
  readonly userId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface McpRequest {
  readonly id: string | number;
  readonly method: string;
  readonly params?: Readonly<Record<string, unknown>>;
  readonly context?: McpContext;
}

export interface McpResponse {
  readonly id: string | number;
  readonly result?: unknown;
  readonly error?: {
    readonly code: number;
    readonly message: string;
    readonly data?: unknown;
  };
}

export const McpToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.unknown()),
  handler: z.function(),
});

export const McpContextSchema = z.object({
  requestId: z.string().optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const McpRequestSchema = z.object({
  id: z.union([z.string(), z.number()]),
  method: z.string(),
  params: z.record(z.unknown()).optional(),
  context: McpContextSchema.optional(),
});

export const McpResponseSchema = z.object({
  id: z.union([z.string(), z.number()]),
  result: z.unknown().optional(),
  error: z
    .object({
      code: z.number(),
      message: z.string(),
      data: z.unknown().optional(),
    })
    .optional(),
});

export type ToolHandler = (args: unknown, context: McpContext) => Promise<McpToolResult>;
export type MiddlewareFunction = (
  request: McpRequest,
  next: () => Promise<McpResponse>,
) => Promise<McpResponse>;
