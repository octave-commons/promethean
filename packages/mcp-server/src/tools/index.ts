import type { JsonSchema7Type } from 'zod-to-json-schema';
import { searchTool } from './search.js';

export interface ToolDescriptor {
    name: string;
    description: string;
    inputSchema: JsonSchema7Type;
}

export const tools: ToolDescriptor[] = [
    {
        name: searchTool.name,
        description: searchTool.description,
        inputSchema: searchTool.jsonSchema as JsonSchema7Type,
    },
];

export function getToolSchema(name: string): JsonSchema7Type | undefined {
    return tools.find((t) => t.name === name)?.inputSchema;
}
