import fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import edn from 'jsedn';
const hasMcpServers = (value) => value !== null &&
    typeof value === 'object' &&
    Object.prototype.hasOwnProperty.call(value, 'mcp-servers');
const normalize = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => normalize(item));
    }
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value !== 'object') {
        return value;
    }
    return Object.fromEntries(Object.entries(value).map(([rawKey, rawValue]) => {
        const key = typeof rawKey === 'string' ? rawKey.replace(/^:/, '') : String(rawKey);
        return [key, normalize(rawValue)];
    }));
};
const loadEdn = async (filePath) => {
    const content = await readFile(filePath, 'utf8');
    return normalize(edn.toJS(edn.parse(content)));
};
const ensureLeadingSlash = (segment) => segment.startsWith('/') ? segment : `/${segment}`;
const expandHome = (input, home) => {
    if (!input)
        return input;
    if (input.startsWith('~')) {
        return path.join(home, input.slice(1));
    }
    return input;
};
const expandEnvVars = (input, env) => input.replace(/\$(\w+)|\$\{([^}]+)\}/g, (match, simple, braced) => {
    const key = (simple ?? braced);
    const value = env[key];
    return typeof value === 'string' ? value : match;
});
const looksLikeScopedPackage = (value) => value.startsWith('@') && value.includes('/');
const resolvePath = (raw, baseDir) => {
    const home = os.homedir();
    const expandedHome = expandHome(raw, home);
    const expanded = expandEnvVars(expandedHome, process.env);
    if (expanded.startsWith('./') || expanded.startsWith('../')) {
        return path.resolve(baseDir, expanded);
    }
    if (path.isAbsolute(expanded)) {
        return expanded;
    }
    if (expanded.includes(path.sep) && !looksLikeScopedPackage(expanded)) {
        const candidate = path.resolve(baseDir, expanded);
        return fs.existsSync(candidate) ? candidate : expanded;
    }
    return expanded;
};
const normalizeArgs = (raw, baseDir) => {
    if (raw === null || raw === undefined)
        return [];
    if (!Array.isArray(raw)) {
        throw new Error(`Expected :args to be a vector of strings, got ${typeof raw}`);
    }
    return raw.map((value) => {
        if (typeof value !== 'string') {
            throw new Error(`Expected :args to contain strings, got ${typeof value}`);
        }
        return resolvePath(value, baseDir);
    });
};
const normalizeEnv = (raw) => {
    if (raw === null || raw === undefined)
        return {};
    if (typeof raw !== 'object' || Array.isArray(raw)) {
        throw new Error(`Expected :env to be a map of string -> string, got ${typeof raw}`);
    }
    const entries = Object.entries(raw).map(([key, value]) => {
        if (typeof value !== 'string') {
            throw new Error(`Expected :env entries to be strings, got ${typeof value}`);
        }
        return [key, value];
    });
    return Object.fromEntries(entries);
};
const coerceBoolean = (value) => Boolean(value);
const deriveHttpPath = (name, rawPath) => {
    if (typeof rawPath === 'string' && rawPath.trim().length > 0) {
        return ensureLeadingSlash(rawPath.trim());
    }
    return ensureLeadingSlash(`${name}/mcp`);
};
const parseServer = (name, raw, baseDir) => {
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new Error(`Expected server definition for ${name} to be a map`);
    }
    const data = raw;
    if (coerceBoolean(data.disabled)) {
        return null;
    }
    const commandRaw = data.command;
    if (typeof commandRaw !== 'string' || commandRaw.trim().length === 0) {
        throw new Error(`Missing :command for MCP server ${name}`);
    }
    const cwdRaw = data.cwd;
    const cwd = typeof cwdRaw === 'string' && cwdRaw.trim().length > 0
        ? resolvePath(cwdRaw.trim(), baseDir)
        : undefined;
    const command = resolvePath(commandRaw.trim(), baseDir);
    const args = normalizeArgs(data.args, baseDir);
    const env = normalizeEnv(data.env);
    const httpPath = deriveHttpPath(name, data['http-path'] ?? data['httpPath']);
    // Allow explicit proxy implementation selection
    const proxyRaw = data.proxy;
    let proxy;
    if (typeof proxyRaw === 'string') {
        if (proxyRaw === 'manual' || proxyRaw === 'sdk') {
            proxy = proxyRaw;
        }
        else {
            throw new Error(`Invalid proxy implementation "${proxyRaw}" for server ${name}. Must be "manual" or "sdk".`);
        }
    }
    return {
        name,
        command,
        args,
        env,
        cwd,
        httpPath,
        proxy,
    };
};
export const loadStdioServerSpecs = async (filePath) => {
    const resolvedPath = path.resolve(filePath);
    const baseDir = path.dirname(resolvedPath);
    const parsed = await loadEdn(resolvedPath);
    if (!hasMcpServers(parsed)) {
        throw new Error(`Expected top-level :mcp-servers map in ${filePath}`);
    }
    const servers = parsed['mcp-servers'];
    if (servers === null || typeof servers !== 'object' || Array.isArray(servers)) {
        throw new Error(`Expected :mcp-servers to be a map in ${filePath}`);
    }
    const entries = Object.entries(servers)
        .map(([name, raw]) => parseServer(name, raw, baseDir))
        .filter((spec) => Boolean(spec));
    if (entries.length === 0) {
        throw new Error(`No MCP servers found in ${filePath}`);
    }
    return entries;
};
//# sourceMappingURL=config.js.map