import { z } from "zod";

const ToolId = z.string();
const Config = z.object({
  transport: z.enum(["stdio", "http"]).default("http"),
  tools: z.array(ToolId),
});

export type AppConfig = z.infer<typeof Config>;

export const loadConfig = (env: NodeJS.ProcessEnv): AppConfig => {
  const raw = env.MCP_CONFIG_JSON ? JSON.parse(env.MCP_CONFIG_JSON) : {};
  return Config.parse(raw);
};
