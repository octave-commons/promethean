import { pathToFileURL } from "node:url";

import { startFamilyProxyServer } from "@workspace/hermes";

const PORT = Number.parseInt(process.env.PORT ?? "4017", 10);
const LEGACY_MCP_URL = (process.env.LEGACY_MCP_URL ?? "http://127.0.0.1:4020").replace(/\/$/, "");
const ALLOW_UNAUTH_LOCAL = process.env.ALLOW_UNAUTH_LOCAL === "true";
const MCP_INTERNAL_SHARED_SECRET = (process.env.MCP_INTERNAL_SHARED_SECRET ?? "").trim();

const OLLAMA_TOOLS = [
  "ollama_pull",
  "ollama_list_models",
  "ollama_list_templates",
  "ollama_create_template",
  "ollama_enqueue_generate_job",
  "ollama_enqueue_chat_completion",
  "ollama_enqueue_job_from_template",
  "ollama_start_conversation",
  "ollama_get_queue",
  "ollama_remove_job",
] as const;

export function startServer(port = PORT): void {
  startFamilyProxyServer(
    {
      serviceName: "mcp-ollama",
      legacyMcpUrl: LEGACY_MCP_URL,
      allowedTools: OLLAMA_TOOLS,
      allowUnauthLocal: ALLOW_UNAUTH_LOCAL,
      sharedSecret: MCP_INTERNAL_SHARED_SECRET,
    },
    port,
  );
}

const entryArg = process.argv[1];
if (entryArg && import.meta.url === pathToFileURL(entryArg).href) {
  startServer();
}
