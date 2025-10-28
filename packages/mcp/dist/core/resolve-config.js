import { normalizeToolIds } from './tool-ids.js';
const ensureLeadingSlash = (path) => (path.startsWith('/') ? path : `/${path}`);
export const resolveHttpEndpoints = (config) => {
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
    const shouldIncludeLegacyEndpoint = topLevelTools.length > 0 && mapped.every((endpoint) => endpoint.path !== '/mcp');
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
export const resolveStdioTools = (config) => {
    if (config.tools.length > 0)
        return normalizeToolIds(config.tools);
    const endpoints = config.endpoints ?? {};
    return Array.from(new Set(Object.values(endpoints).flatMap((endpoint) => normalizeToolIds(endpoint.tools ?? []))));
};
//# sourceMappingURL=resolve-config.js.map