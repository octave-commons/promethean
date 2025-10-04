import type { AppConfig } from "../config/load-config.js";

const ensureLeadingSlash = (path: string): string =>
  path.startsWith("/") ? path : `/${path}`;

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

export const resolveHttpEndpoints = (
  config: AppConfig,
): readonly EndpointDefinition[] => {
  const entries = Object.entries(config.endpoints ?? {});
  if (entries.length === 0) {
    const includeHelp = (config as any).includeHelp;
    const meta = (config as any).stdioMeta;
    return [
      {
        path: "/mcp",
        tools: config.tools,
        ...(includeHelp === undefined ? {} : { includeHelp }),
        ...(meta === undefined ? {} : { meta }),
      },
    ];
  }

  const resolved = entries.map(([path, cfg]: any) => {
    const includeHelp = cfg.includeHelp;
    const meta = cfg.meta;
    return {
      path: ensureLeadingSlash(path),
      tools: cfg.tools,
      ...(includeHelp === undefined ? {} : { includeHelp }),
      ...(meta === undefined ? {} : { meta }),
    };
  });

  const shouldIncludeLegacyEndpoint =
    config.tools.length > 0 &&
    resolved.every((endpoint) => endpoint.path !== "/mcp");

  if (shouldIncludeLegacyEndpoint) {
    const includeHelp = (config as any).includeHelp;
    const meta = (config as any).stdioMeta;
    resolved.unshift({
      path: "/mcp",
      tools: config.tools,
      ...(includeHelp === undefined ? {} : { includeHelp }),
      ...(meta === undefined ? {} : { meta }),
    });
  }

  return resolved;
};

export const resolveStdioTools = (config: AppConfig): readonly string[] => {
  if (config.tools.length > 0) return config.tools;

  const collected = new Set<string>();
  for (const endpoint of Object.values(config.endpoints ?? {})) {
    for (const tool of (endpoint as any).tools) {
      collected.add(tool);
    }
  }

  return [...collected];
};
