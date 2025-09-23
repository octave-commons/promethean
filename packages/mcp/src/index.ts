import {
  tddScaffoldTest,
  tddChangedFiles,
  tddRunTests,
  tddStartWatch,
  tddGetWatchChanges,
  tddStopWatch,
  tddCoverage,
  tddPropertyCheck,
  tddMutationScore,
} from "./tools/tdd.js";
import { loadConfig } from "./config/load-config.js";
import { buildRegistry } from "./core/registry.js";
import { createMcpServer } from "./core/mcp-server.js";
import { fastifyTransport } from "./core/transports/fastify.js";
import { stdioTransport } from "./core/transports/stdio.js";
import { githubRequestTool } from "./tools/github/request.js";
import { githubGraphqlTool } from "./tools/github/graphql.js";
import { githubRateLimitTool } from "./tools/github/rate-limit.js";
import {
  filesListDirectory,
  filesTreeDirectory,
  filesViewFile,
  filesWriteFileContent,
  filesWriteFileLines,
} from "./tools/files.js";
import { filesSearch } from "./tools/search.js";
import type { ToolFactory } from "./core/types.js";

const toolCatalog = new Map<string, ToolFactory>([
  ["github.request", githubRequestTool],
  ["github.graphql", githubGraphqlTool],
  ["github.rate-limit", githubRateLimitTool],
  ["files.list-directory", filesListDirectory],
  ["files.tree-directory", filesTreeDirectory],
  ["files.view-file", filesViewFile],
  ["files.write-content", filesWriteFileContent],
  ["files.write-lines", filesWriteFileLines],
  ["files.search", filesSearch],
  ["tdd.scaffoldTest", tddScaffoldTest],
  ["tdd.changedFiles", tddChangedFiles],
  ["tdd.runTests", tddRunTests],
  ["tdd.startWatch", tddStartWatch],
  ["tdd.getWatchChanges", tddGetWatchChanges],
  ["tdd.stopWatch", tddStopWatch],
  ["tdd.coverage", tddCoverage],
  ["tdd.propertyCheck", tddPropertyCheck],
  ["tdd.mutationScore", tddMutationScore],
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

  const factories = cfg.tools
    .map((id) => {
      const factory = toolCatalog.get(id);
      if (!factory) {
        console.warn(`[mcp] Unknown tool id in config: ${id}`);
      }
      return factory;
    })
    .filter((factory): factory is ToolFactory => Boolean(factory));
  const registry = buildRegistry(factories, ctx);
  const server = createMcpServer(registry.list());

  const transport =
    cfg.transport === "stdio" ? stdioTransport() : fastifyTransport();
  console.log(`[mcp] transport = ${cfg.transport ?? "http"}`);
  await transport.start(server);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
