import { pathToFileURL } from "node:url";

import { createFamilyProxyApp, startFamilyProxyServer } from "@workspace/hermes";

const PORT = Number.parseInt(process.env.PORT ?? "4012", 10);
const LEGACY_MCP_URL = (process.env.LEGACY_MCP_URL ?? "http://127.0.0.1:4020").replace(/\/$/, "");
const ALLOW_UNAUTH_LOCAL = process.env.ALLOW_UNAUTH_LOCAL === "true";
const MCP_INTERNAL_SHARED_SECRET = (process.env.MCP_INTERNAL_SHARED_SECRET ?? "").trim();

const GITHUB_TOOLS = [
  "github_request",
  "github_graphql",
  "github_rate_limit",
  "github_contents_write",
  "github_workflow_get_run_logs",
  "github_workflow_get_job_logs",
  "github_apply_patch",
  "github_pr_get",
  "github_pr_files",
  "github_pr_resolve_position",
  "github_pr_review_start",
  "github_pr_review_comment_inline",
  "github_pr_review_submit",
  "github_review_open_pull_request",
  "github_review_get_comments",
  "github_review_get_review_comments",
  "github_review_submit_comment",
  "github_review_request_changes_from_codex",
  "github_review_submit_review",
  "github_review_get_action_status",
  "github_review_commit",
  "github_review_push",
  "github_review_checkout_branch",
  "github_review_create_branch",
  "github_review_revert_commits",
] as const;

export function startServer(port = PORT): void {
  startFamilyProxyServer(
    {
      serviceName: "mcp-github",
      legacyMcpUrl: LEGACY_MCP_URL,
      allowedTools: GITHUB_TOOLS,
      allowUnauthLocal: ALLOW_UNAUTH_LOCAL,
      sharedSecret: MCP_INTERNAL_SHARED_SECRET,
    },
    port,
  );
}

export function createApp(): any {
  return createFamilyProxyApp({
    serviceName: "mcp-github",
    legacyMcpUrl: LEGACY_MCP_URL,
    allowedTools: GITHUB_TOOLS,
    allowUnauthLocal: ALLOW_UNAUTH_LOCAL,
    sharedSecret: MCP_INTERNAL_SHARED_SECRET,
  });
}

const entryArg = process.argv[1];
if (entryArg && import.meta.url === pathToFileURL(entryArg).href) {
  startServer();
}
