import type { AppConfig } from "../config/load-config.js";

const ensureLeadingSlash = (path: string): string =>
  path.startsWith("/") ? path : `/${path}`;

export type EndpointDefinition = Readonly<{
  path: string;
  tools: readonly string[];
}>;

export const resolveHttpEndpoints = (
  config: AppConfig,
): readonly EndpointDefinition[] => {
  const entries = Object.entries(config.endpoints ?? {});
  if (entries.length === 0) {
    return [
      {
        path: "/mcp",
        tools: config.tools,
      },
    ];
  }

  const resolved = entries.map(([path, cfg]) => ({
    path: ensureLeadingSlash(path),
    tools: cfg.tools,
  }));

  const shouldIncludeLegacyEndpoint =
    config.tools.length > 0 &&
    resolved.every((endpoint) => endpoint.path !== "/mcp");

  if (shouldIncludeLegacyEndpoint) {
    resolved.unshift({
      path: "/mcp",
      tools: config.tools,
    });
  }

  return resolved;
};

export const resolveStdioTools = (config: AppConfig): readonly string[] => {
  if (config.tools.length > 0) return config.tools;

  const collected = new Set<string>();
  for (const endpoint of Object.values(config.endpoints ?? {})) {
    for (const tool of endpoint.tools) {
      collected.add(tool);
    }
  }

  return [...collected];
};
