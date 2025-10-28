import { ZodError } from 'zod';
import type { EndpointDefinition } from './resolve-config.js';
import type { Tool } from './types.js';
declare const OPENAPI_VERSION: "3.1.0";
type ExampleCollection = Readonly<Record<string, Readonly<{
    summary?: string;
    value: Readonly<Record<string, unknown>>;
}>>>;
export type ActionDefinition = Readonly<{
    name: string;
    description?: string;
    stability: string;
    since: string | null;
    requestSchema: Readonly<Record<string, unknown>>;
    requiresBody: boolean;
    requestExamples?: ExampleCollection;
    successExample?: Readonly<Record<string, unknown>>;
}>;
export declare const toolToActionDefinition: (tool: Tool) => ActionDefinition;
type PathItemObject = Readonly<Record<string, unknown>>;
export type OpenApiDocument = Readonly<{
    openapi: typeof OPENAPI_VERSION;
    info: Readonly<{
        title: string;
        version: string;
        description?: string;
    }>;
    servers: readonly Readonly<{
        url: string;
    }>[];
    paths: Readonly<Record<string, PathItemObject>>;
    components?: Readonly<{
        schemas?: Record<string, unknown>;
    }>;
}>;
export declare const createEndpointOpenApiDocument: (endpoint: EndpointDefinition, actions: readonly ActionDefinition[], serverUrl: string) => OpenApiDocument;
export declare const encodeActionPathSegment: (name: string) => string;
export declare const isZodValidationError: (error: unknown) => error is ZodError;
export {};
//# sourceMappingURL=openapi.d.ts.map