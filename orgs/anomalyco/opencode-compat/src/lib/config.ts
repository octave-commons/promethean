import { z } from "zod";

import type { CompatLogLevel } from "./types.js";

const EnvSchema = z.object({
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(4096),
  PUBLIC_BASE_URL: z.string().url().default("http://127.0.0.1:4096"),
  OPENCODE_COMPAT_API_KEY: z.string().trim().optional().transform((value) => (value ? value : undefined)),
  DATABASE_URL: z.string().trim().optional().transform((value) => (value ? value : undefined)),
  DEFAULT_DIRECTORY: z.string().default("/workspace/default"),
  DEFAULT_PROVIDER: z.string().default("compat"),
  DEFAULT_MODEL: z.string().default("stub-1"),
  DEFAULT_AGENT: z.string().default("general"),
  LOG_LEVEL: z.enum(["DEBUG", "INFO", "WARN", "ERROR"]).default("INFO")
});

export type CompatRuntimeConfig = {
  host: string;
  port: number;
  publicBaseUrl: string;
  apiKey?: string;
  databaseUrl?: string;
  defaultDirectory: string;
  defaultProvider: string;
  defaultModel: string;
  defaultAgent: string;
  logLevel: CompatLogLevel;
  version: string;
};

export function loadConfig(): CompatRuntimeConfig {
  const env = EnvSchema.parse(process.env);
  return {
    host: env.HOST,
    port: env.PORT,
    publicBaseUrl: env.PUBLIC_BASE_URL,
    apiKey: env.OPENCODE_COMPAT_API_KEY,
    databaseUrl: env.DATABASE_URL,
    defaultDirectory: env.DEFAULT_DIRECTORY,
    defaultProvider: env.DEFAULT_PROVIDER,
    defaultModel: env.DEFAULT_MODEL,
    defaultAgent: env.DEFAULT_AGENT,
    logLevel: env.LOG_LEVEL,
    version: "0.1.0"
  };
}
