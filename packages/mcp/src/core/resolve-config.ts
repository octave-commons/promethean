import type { AppConfig } from '../config/load-config.js';
import { normalizeToolIds } from './tool-ids.js';

const ensureLeadingSlash = (path: string): string => (path.startsWith('/') ? path : `/${path}`);

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

export const resolveHttpEndpoints = (config: AppConfig): readonly EndpointDefinition[] => {
  const topLevelTools = normalizeToolIds(config.tools);
  const endpoints = config.endpoints ?? {};
  const mapped = Object.entries(endpoints).map(([path, cfg]) => {
    const includeHelp = cfg.includeHelp;
    const meta = cfg.meta;
    return {
      path: ensureLeadingSlash(path),
      tools: normalizeToolIds(cfg.tools ?? []),
      ...(includeHelp === undefined ? {} : { includeHelp }),
      ...(meta === undefined ? {} : { meta }),
    };
  });

  if (mapped.length === 0) {
    const includeHelp = config.includeHelp;
    const meta = config.stdioMeta;
    return [
      {
        path: '/mcp',
        tools: topLevelTools,
        ...(includeHelp === undefined ? {} : { includeHelp }),
        ...(meta === undefined ? {} : { meta }),
      },
    ];
  }

  const shouldIncludeLegacyEndpoint =
    topLevelTools.length > 0 && mapped.every((endpoint) => endpoint.path !== '/mcp');

  const legacyEndpoint = shouldIncludeLegacyEndpoint
    ? [
        {
          path: '/mcp',
          tools: topLevelTools,
          ...(config.includeHelp === undefined ? {} : { includeHelp: config.includeHelp }),
          ...(config.stdioMeta === undefined ? {} : { meta: config.stdioMeta }),
        },
      ]
    : [];

  return [...legacyEndpoint, ...mapped];
};

export const resolveStdioTools = (config: AppConfig): readonly string[] => {
  if (config.tools.length > 0) return normalizeToolIds(config.tools);

  const endpoints = config.endpoints ?? {};
  return Array.from(
    new Set(Object.values(endpoints).flatMap((endpoint) => normalizeToolIds(endpoint.tools ?? []))),
  );
};
