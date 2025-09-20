import { loadConfig } from "./config/load-config.js";
import { buildRegistry } from "./core/registry.js";
import { createMcpServer } from "./core/mcp-server.js";
import { fastifyTransport } from "./core/transports/fastify.js";
import { stdioTransport } from "./core/transports/stdio.js";
import { githubRequestTool } from "./tools/github/request.js";
import { githubGraphqlTool } from "./tools/github/graphql.js";
import { githubRateLimitTool } from "./tools/github/rate-limit.js";

const toolCatalog = new Map<string, any>([
  ["github.request", githubRequestTool],
  ["github.graphql", githubGraphqlTool],
  ["github.rate-limit", githubRateLimitTool],
]);

const env = process.env;
const mkCtx = () => ({
  env,
  fetch: global.fetch.bind(global),
  now: () => new Date(),
});

const main = async () => {
  const cfg = loadConfig(env);
  const ctx = mkCtx();

  const factories = cfg.tools.map((id) => toolCatalog.get(id)).filter(Boolean);
  const registry = buildRegistry(factories, ctx as any);
  const server = createMcpServer(registry.list());

  const transport =
    cfg.transport === "stdio" ? stdioTransport() : fastifyTransport();
  await transport.start(server as any);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
