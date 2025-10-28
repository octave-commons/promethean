import type { AppConfig } from '../config/load-config.js';
export type ToolsetMeta = Readonly<{
    title?: string;
    description?: string;
    workflow?: readonly string[];
    expectations?: Readonly<{
        usage?: readonly string[];
        pitfalls?: readonly string[];
        prerequisites?: readonly string[];
    }>;
}>;
export type EndpointDefinition = Readonly<{
    path: string;
    tools: readonly string[];
    includeHelp?: boolean;
    meta?: ToolsetMeta;
}>;
export declare const resolveHttpEndpoints: (config: AppConfig) => readonly EndpointDefinition[];
export declare const resolveStdioTools: (config: AppConfig) => readonly string[];
//# sourceMappingURL=resolve-config.d.ts.map