import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

export const CONFIG_FILE_NAME = "promethean.mcp.json";

const ToolId = z.string();
const EndpointConfig = z.object({
  tools: z.array(ToolId).default([]),
});
const Config = z.object({
  transport: z.enum(["stdio", "http"]).default("http"),
  tools: z.array(ToolId).default([]),
  endpoints: z.record(EndpointConfig).default({}),
  stdioProxyConfig: z.string().min(1).nullable().default(null),
});

export const ConfigSchema = Config;

export type AppConfig = z.infer<typeof Config>;

export type ConfigSource =
  | Readonly<{ type: "file"; path: string }>
  | Readonly<{ type: "env" }>
  | Readonly<{ type: "default" }>;

export type LoadedConfig = Readonly<{
  config: AppConfig;
  source: ConfigSource;
}>;

const readJsonFileSync = (p: string): unknown => {
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
};

const findUpSync = (start: string, fileName: string): string | null => {
  let dir = path.resolve(start);
  const root = path.parse(dir).root;
  // safety cap to avoid infinite loops in weird envs
  for (let i = 0; i < 100; i++) {
    const candidate = path.join(dir, fileName);
    try {
      const st = fs.statSync(candidate);
      if (st.isFile()) return candidate;
    } catch {
      /* ignore */
    }
    if (dir === root) break;
    dir = path.dirname(dir);
  }
  return null;
};

const getArgValue = (
  argv: string[],
  flag: string,
  short: string,
): string | undefined => {
  const idx = argv.indexOf(flag);
  if (idx >= 0 && argv[idx + 1]) return argv[idx + 1];
  const sidx = argv.indexOf(short);
  if (sidx >= 0 && argv[sidx + 1]) return argv[sidx + 1];
  // support --config=path
  const eq = argv.find((a) => a.startsWith(`${flag}=`));
  if (eq) return eq.split("=", 2)[1];
  return undefined;
};

const normalizeConfig = (input: unknown): AppConfig =>
  Config.parse(input ?? {});

export const findConfigPath = (cwd: string = process.cwd()): string | null =>
  findUpSync(cwd, CONFIG_FILE_NAME);

const loadConfigFromFile = (filePath: string): AppConfig => {
  const raw = readJsonFileSync(filePath);
  return normalizeConfig(raw);
};

export const createDefaultConfig = (): AppConfig => normalizeConfig({});

const ensureDirectory = (filePath: string): void => {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
};

export const saveConfigFile = (
  filePath: string,
  config: AppConfig,
): AppConfig => {
  const normalized = normalizeConfig(config);
  ensureDirectory(filePath);
  fs.writeFileSync(filePath, JSON.stringify(normalized, null, 2), "utf8");
  return normalized;
};

export const loadConfigWithSource = (
  env: NodeJS.ProcessEnv,
  argv: string[] = process.argv,
  cwd: string = process.cwd(),
): LoadedConfig => {
  const fromFile = (filePath: string): LoadedConfig => ({
    config: loadConfigFromFile(filePath),
    source: { type: "file", path: filePath },
  });

  // 1) explicit file
  const explicit = getArgValue(argv, "--config", "-c");
  if (explicit) {
    const abs = path.resolve(cwd, explicit);
    return fromFile(abs);
  }

  // 2) auto-detect file
  const auto = findConfigPath(cwd);
  if (auto) {
    return fromFile(auto);
  }

  // 3) legacy env
  if (env.MCP_CONFIG_JSON) {
    try {
      const raw = JSON.parse(env.MCP_CONFIG_JSON);
      return {
        config: normalizeConfig(raw),
        source: { type: "env" },
      };
    } catch (e) {
      throw new Error("Invalid MCP_CONFIG_JSON: " + (e as Error).message);
    }
  }

  // 4) defaults
  return {
    config: createDefaultConfig(),
    source: { type: "default" },
  };
};

/**
 * Load config synchronously with the following precedence:
 * 1) --config / -c path (relative to cwd)
 * 2) nearest promethean.mcp.json from cwd upward
 * 3) legacy env MCP_CONFIG_JSON (object)
 * 4) defaults
 */
export const loadConfig = (
  env: NodeJS.ProcessEnv,
  argv: string[] = process.argv,
  cwd: string = process.cwd(),
): AppConfig => loadConfigWithSource(env, argv, cwd).config;
