import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

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

export type AppConfig = z.infer<typeof Config>;

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
): AppConfig => {
  // 1) explicit file
  const explicit = getArgValue(argv, "--config", "-c");
  if (explicit) {
    const abs = path.resolve(cwd, explicit);
    const raw = readJsonFileSync(abs);
    return Config.parse(raw);
  }

  // 2) auto-detect file
  const auto = findUpSync(cwd, "promethean.mcp.json");
  if (auto) {
    const raw = readJsonFileSync(auto);
    return Config.parse(raw);
  }

  // 3) legacy env
  if (env.MCP_CONFIG_JSON) {
    try {
      const raw = JSON.parse(env.MCP_CONFIG_JSON);
      return Config.parse(raw);
    } catch (e) {
      throw new Error("Invalid MCP_CONFIG_JSON: " + (e as Error).message);
    }
  }

  // 4) defaults
  return Config.parse({});
};
