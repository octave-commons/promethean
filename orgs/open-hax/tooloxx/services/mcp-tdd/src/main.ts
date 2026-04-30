import { pathToFileURL } from "node:url";

import { startFamilyProxyServer } from "@workspace/hermes";

const PORT = Number.parseInt(process.env.PORT ?? "4015", 10);
const LEGACY_MCP_URL = (process.env.LEGACY_MCP_URL ?? "http://127.0.0.1:4020").replace(/\/$/, "");
const ALLOW_UNAUTH_LOCAL = process.env.ALLOW_UNAUTH_LOCAL === "true";
const MCP_INTERNAL_SHARED_SECRET = (process.env.MCP_INTERNAL_SHARED_SECRET ?? "").trim();

const TDD_TOOLS = [
  "tdd_scaffold_test",
  "tdd_changed_files",
  "tdd_run_tests",
  "tdd_start_watch",
  "tdd_get_watch_changes",
  "tdd_stop_watch",
  "tdd_coverage",
  "tdd_property_check",
  "tdd_mutation_score",
] as const;

export function startServer(port = PORT): void {
  startFamilyProxyServer(
    {
      serviceName: "mcp-tdd",
      legacyMcpUrl: LEGACY_MCP_URL,
      allowedTools: TDD_TOOLS,
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
