import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import edn from "jsedn";

export type StdioServerSpec = Readonly<{
  name: string;
  command: string;
  args: readonly string[];
  env: Readonly<Record<string, string>>;
  cwd?: string;
  httpPath: string;
}>;

type UnknownRecord = Record<string, unknown>;

const hasMcpServers = (
  value: unknown,
): value is UnknownRecord & { "mcp-servers": unknown } =>
  value !== null &&
  typeof value === "object" &&
  Object.prototype.hasOwnProperty.call(value, "mcp-servers");

const normalize = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => normalize(item));
  }

  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as UnknownRecord).map(([rawKey, rawValue]) => {
      const key =
        typeof rawKey === "string" ? rawKey.replace(/^:/, "") : String(rawKey);
      return [key, normalize(rawValue)];
    }),
  );
};

const loadEdn = async (filePath: string): Promise<unknown> => {
  const content = await readFile(filePath, "utf8");
  return normalize(edn.toJS(edn.parse(content)));
};

const ensureLeadingSlash = (segment: string): string =>
  segment.startsWith("/") ? segment : `/${segment}`;

const expandHome = (input: string, home: string): string => {
  if (!input) return input;
  if (input.startsWith("~")) {
    return path.join(home, input.slice(1));
  }
  return input;
};

const looksLikeScopedPackage = (value: string): boolean =>
  value.startsWith("@") && value.includes("/");

const resolvePath = (raw: string, baseDir: string): string => {
  const home = os.homedir();
  const expanded = expandHome(raw, home);
  if (expanded.startsWith("./") || expanded.startsWith("../")) {
    return path.resolve(baseDir, expanded);
  }
  if (path.isAbsolute(expanded)) {
    return expanded;
  }
  if (expanded.includes(path.sep) && !looksLikeScopedPackage(expanded)) {
    return path.resolve(baseDir, expanded);
  }
  return expanded;
};

const normalizeArgs = (raw: unknown, baseDir: string): readonly string[] => {
  if (raw === null || raw === undefined) return [];
  if (!Array.isArray(raw)) {
    throw new Error(
      `Expected :args to be a vector of strings, got ${typeof raw}`,
    );
  }
  return raw.map((value) => {
    if (typeof value !== "string") {
      throw new Error(`Expected :args to contain strings, got ${typeof value}`);
    }
    return resolvePath(value, baseDir);
  });
};

const normalizeEnv = (raw: unknown): Readonly<Record<string, string>> => {
  if (raw === null || raw === undefined) return {};
  if (typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(
      `Expected :env to be a map of string -> string, got ${typeof raw}`,
    );
  }
  const entries = Object.entries(raw as UnknownRecord).map(([key, value]) => {
    if (typeof value !== "string") {
      throw new Error(
        `Expected :env entries to be strings, got ${typeof value}`,
      );
    }
    return [key, value] as const;
  });
  return Object.fromEntries(entries);
};

const coerceBoolean = (value: unknown): boolean => Boolean(value);

const deriveHttpPath = (name: string, rawPath: unknown): string => {
  if (typeof rawPath === "string" && rawPath.trim().length > 0) {
    return ensureLeadingSlash(rawPath.trim());
  }
  return ensureLeadingSlash(`${name}/mcp`);
};

const parseServer = (
  name: string,
  raw: unknown,
  baseDir: string,
): StdioServerSpec | null => {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`Expected server definition for ${name} to be a map`);
  }
  const data = raw as UnknownRecord;

  if (coerceBoolean(data.disabled)) {
    return null;
  }

  const commandRaw = data.command;
  if (typeof commandRaw !== "string" || commandRaw.trim().length === 0) {
    throw new Error(`Missing :command for MCP server ${name}`);
  }

  const cwdRaw = data.cwd;
  const cwd =
    typeof cwdRaw === "string" && cwdRaw.trim().length > 0
      ? resolvePath(cwdRaw.trim(), baseDir)
      : undefined;

  const command = resolvePath(commandRaw.trim(), baseDir);
  const args = normalizeArgs(data.args, baseDir);
  const env = normalizeEnv(data.env);
  const httpPath = deriveHttpPath(name, data["http-path"] ?? data["httpPath"]);

  return {
    name,
    command,
    args,
    env,
    cwd,
    httpPath,
  };
};

export const loadStdioServerSpecs = async (
  filePath: string,
): Promise<readonly StdioServerSpec[]> => {
  const resolvedPath = path.resolve(filePath);
  const baseDir = path.dirname(resolvedPath);
  const parsed = await loadEdn(resolvedPath);

  if (!hasMcpServers(parsed)) {
    throw new Error(`Expected top-level :mcp-servers map in ${filePath}`);
  }

  const servers = parsed["mcp-servers"];
  if (
    servers === null ||
    typeof servers !== "object" ||
    Array.isArray(servers)
  ) {
    throw new Error(`Expected :mcp-servers to be a map in ${filePath}`);
  }

  const entries = Object.entries(servers as UnknownRecord)
    .map(([name, raw]) => parseServer(name, raw, baseDir))
    .filter((spec): spec is StdioServerSpec => Boolean(spec));

  if (entries.length === 0) {
    throw new Error(`No MCP servers found in ${filePath}`);
  }

  return entries;
};
