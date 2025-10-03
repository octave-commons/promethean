import { readFileSync, statSync } from "fs";
import os from "os";
import path from "path";

export type McpServerSpec = {
  command: string;
  args?: string[];
  cwd?: string;
};

type McpConfig = {
  servers: Map<string, McpServerSpec>;
};

type CacheEntry = {
  path: string;
  mtimeMs: number;
  config: McpConfig;
};

let cache: CacheEntry | null = null;

function getConfigPath(): string {
  const override = process.env.MCP_STDIO_CONFIG;
  if (override && override.trim()) return path.resolve(override);
  return path.join(os.homedir(), ".config", "mcp", "config.json");
}

function parseConfig(raw: unknown): McpConfig {
  const servers = new Map<string, McpServerSpec>();
  if (
    raw &&
    typeof raw === "object" &&
    "mcpServers" in raw &&
    raw.mcpServers &&
    typeof raw.mcpServers === "object"
  ) {
    const entries = Object.entries(raw.mcpServers as Record<string, any>);
    for (const [name, spec] of entries) {
      if (!spec || typeof spec !== "object") continue;
      const command = spec.command;
      if (typeof command !== "string" || command.length === 0) continue;
      const serverSpec: McpServerSpec = { command };
      if (Array.isArray(spec.args)) {
        serverSpec.args = spec.args.map((arg: unknown) => String(arg));
      }
      if (spec.cwd && typeof spec.cwd === "string" && spec.cwd.trim()) {
        serverSpec.cwd = spec.cwd;
      }
      servers.set(name, serverSpec);
    }
  }
  return { servers };
}

export function clearConfigCacheForTesting() {
  cache = null;
}

export function loadConfig(): McpConfig {
  const configPath = getConfigPath();
  try {
    const stat = statSync(configPath);
    if (cache && cache.path === configPath && cache.mtimeMs === stat.mtimeMs) {
      return cache.config;
    }
    const raw = readFileSync(configPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    const config = parseConfig(parsed);
    cache = { path: configPath, mtimeMs: stat.mtimeMs, config };
    return config;
  } catch {
    cache = null;
    return { servers: new Map() };
  }
}

export function getServerSpec(name: string): McpServerSpec | undefined {
  return loadConfig().servers.get(name);
}
