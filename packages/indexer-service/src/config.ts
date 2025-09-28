import path from "node:path";

export type ServiceConfig = Readonly<{
  rootPath: string;
  cachePath: string;
  port: number;
  host: string;
  logLevel: string;
  enableDocs: boolean;
  enableRateLimit: boolean;
}>;

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

export function loadConfig(): ServiceConfig {
  const rootPath = path.resolve(
    requireEnv("INDEX_ROOT", requireEnv("ROOT_PATH", process.cwd())),
  );
  const cachePath = path.resolve(
    process.env.INDEX_CACHE_PATH ||
      process.env.INDEXER_CACHE_PATH ||
      path.join(rootPath, ".cache/indexer-service"),
  );
  const port = Number(process.env.PORT || 4260);
  const host = process.env.HOST || "0.0.0.0";
  const logLevel = process.env.LOG_LEVEL || "info";
  const enableDocs =
    String(process.env.ENABLE_DOCS || "true").toLowerCase() !== "false";
  const enableRateLimit =
    String(process.env.ENABLE_RATE_LIMIT || "true").toLowerCase() !== "false";

  return {
    rootPath,
    cachePath,
    port: Number.isFinite(port) && port > 0 ? port : 4260,
    host,
    logLevel,
    enableDocs,
    enableRateLimit,
  };
}
