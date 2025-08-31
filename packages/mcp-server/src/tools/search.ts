import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const searchArgsSchema = z.object({
    query: z.string(),
    topK: z.number().int().positive().optional(),
    includeMeta: z.boolean().optional(),
});

export const searchArgsJsonSchema = zodToJsonSchema(searchArgsSchema, 'search.query');

export type SearchArgs = z.infer<typeof searchArgsSchema>;

export const searchTool = {
    name: 'search.query',
    description: 'Search dual-store (Chroma/Mongo) for documents matching a query',
    schema: searchArgsSchema,
    jsonSchema: searchArgsJsonSchema,
};
