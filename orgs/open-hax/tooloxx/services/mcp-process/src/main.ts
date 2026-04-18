import { pathToFileURL } from "node:url";

import { startFamilyProxyServer } from "@workspace/hermes";

const PORT = Number.parseInt(process.env.PORT ?? "4013", 10);
const LEGACY_MCP_URL = (process.env.LEGACY_MCP_URL ?? "http://127.0.0.1:4020").replace(/\/$/, "");
const ALLOW_UNAUTH_LOCAL = process.env.ALLOW_UNAUTH_LOCAL === "true";
const MCP_INTERNAL_SHARED_SECRET = (process.env.MCP_INTERNAL_SHARED_SECRET ?? "").trim();

const PROCESS_TOOLS = [
  "process_get_task_runner_config",
  "process_update_task_runner_config",
  "process_enqueue_task",
  "process_stop",
  "process_get_queue",
  "process_get_stdout",
  "process_get_stderr",
] as const;

export function startServer(port = PORT): void {
  startFamilyProxyServer(
    {
      serviceName: "mcp-process",
      legacyMcpUrl: LEGACY_MCP_URL,
      allowedTools: PROCESS_TOOLS,
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
