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
  githubReviewCheckoutBranch,
  githubReviewCommit,
  githubReviewCreateBranch,
  githubReviewGetActionStatus,
  githubReviewGetComments,
  githubReviewGetReviewComments,
  githubReviewOpenPullRequest,
  githubReviewPush,
  githubReviewRevertCommits,
  githubReviewSubmitComment,
  githubReviewSubmitReview,
} from "./tools/github/code-review.js";
import {
  filesListDirectory,
  filesTreeDirectory,
  filesViewFile,
  filesWriteFileContent,
  filesWriteFileLines,
} from "./tools/files.js";
import { filesSearch } from "./tools/search.js";
import {
  processEnqueueTask,
  processGetQueue,
  processGetStderr,
  processGetStdout,
  processGetTaskRunnerConfig,
  processStopTask,
  processUpdateTaskRunnerConfig,
} from "./tools/process-manager.js";
import type { ToolFactory } from "./core/types.js";
import {
  resolveHttpEndpoints,
  resolveStdioTools,
} from "./core/resolve-config.js";

const toolCatalog = new Map<string, ToolFactory>([
  ["github.request", githubRequestTool],
  ["github.graphql", githubGraphqlTool],
  ["github.rate-limit", githubRateLimitTool],
  ["github.review.openPullRequest", githubReviewOpenPullRequest],
  ["github.review.getComments", githubReviewGetComments],
  ["github.review.getReviewComments", githubReviewGetReviewComments],
  ["github.review.submitComment", githubReviewSubmitComment],
  ["github.review.submitReview", githubReviewSubmitReview],
  ["github.review.getActionStatus", githubReviewGetActionStatus],
  ["github.review.commit", githubReviewCommit],
  ["github.review.push", githubReviewPush],
  ["github.review.checkoutBranch", githubReviewCheckoutBranch],
  ["github.review.createBranch", githubReviewCreateBranch],
  ["github.review.revertCommits", githubReviewRevertCommits],
  ["files.list-directory", filesListDirectory],
  ["files.tree-directory", filesTreeDirectory],
  ["files.view-file", filesViewFile],
  ["files.write-content", filesWriteFileContent],
  ["files.write-lines", filesWriteFileLines],
  ["files.search", filesSearch],
  ["process.getTaskRunnerConfig", processGetTaskRunnerConfig],
  ["process.updateTaskRunnerConfig", processUpdateTaskRunnerConfig],
  ["process.enqueueTask", processEnqueueTask],
  ["process.stop", processStopTask],
  ["process.getQueue", processGetQueue],
  ["process.getStdout", processGetStdout],
  ["process.getStderr", processGetStderr],
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

const selectFactories = (toolIds: readonly string[]): readonly ToolFactory[] =>
  toolIds
    .map((id) => {
      const factory = toolCatalog.get(id);
      if (!factory) {
        console.warn(`[mcp] Unknown tool id in config: ${id}`);
      }
      return factory;
    })
    .filter((factory): factory is ToolFactory => Boolean(factory));

const main = async () => {
  const cfg = loadConfig(env);
  const ctx = mkCtx();

  if (cfg.transport === "http") {
    const endpoints = resolveHttpEndpoints(cfg);
    const servers = new Map<string, ReturnType<typeof createMcpServer>>();
    for (const endpoint of endpoints) {
      const factories = selectFactories(endpoint.tools);
      const registry = buildRegistry(factories, ctx);
      servers.set(endpoint.path, createMcpServer(registry.list()));
    }

    const transport = fastifyTransport();
    console.log(
      `[mcp] transport = http (${endpoints.length} endpoint${
        endpoints.length === 1 ? "" : "s"
      })`,
    );
    await transport.start(servers);
    return;
  }

  const toolIds = resolveStdioTools(cfg);
  const factories = selectFactories(toolIds);
  const registry = buildRegistry(factories, ctx);
  const server = createMcpServer(registry.list());
  const transport = stdioTransport();
  console.log("[mcp] transport = stdio");
  await transport.start(server);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
