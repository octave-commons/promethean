import 'dotenv/config';
import { type AppConfig } from './config/load-config.js';
import type { ToolFactory } from './core/types.js';
import { type EndpointDefinition } from './core/resolve-config.js';
import { type StdioServerSpec } from './proxy/config.js';
export * as githubConflicts from './github/conflicts/index.js';
export * as ollama from './ollama/index.js';
declare const toolCatalog: Map<string, ToolFactory>;
export type HttpTransportConfig = Readonly<{
    endpoints: readonly EndpointDefinition[];
    inlineProxySpecs: readonly StdioServerSpec[];
    legacyProxySpecs: readonly StdioServerSpec[];
}>;
export declare const loadHttpTransportConfig: (cfg: Readonly<AppConfig>) => Promise<HttpTransportConfig>;
export declare const main: () => Promise<void>;
export { toolCatalog };
//# sourceMappingURL=index.d.ts.map