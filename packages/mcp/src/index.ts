import fs from "node:fs";
import path from "node:path";

import { applyPatchTool } from "./tools/apply-patch.js";
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
import type { AppConfig } from "./config/load-config.js";
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
import { execRunTool, execListTool } from "./tools/exec.js";
import {
  kanbanFindTaskById,
  kanbanFindTaskByTitle,
  kanbanGetBoard,
  kanbanGetColumn,
  kanbanMoveTask,
  kanbanSearchTasks,
  kanbanSyncBoard,
  kanbanUpdateStatus,
} from "./tools/kanban.js";
import {
  pnpmAdd,
  pnpmInstall,
  pnpmRemove,
  pnpmRunScript,
} from "./tools/pnpm.js";
import { nxGeneratePackage } from "./tools/nx.js";
import type { ToolFactory } from "./core/types.js";
import type { HttpEndpointDescriptor } from "./core/transports/fastify.js";
import {
  resolveHttpEndpoints,
  resolveStdioTools,
  type EndpointDefinition,
} from "./core/resolve-config.js";
import { discordSendMessage, discordListMessages } from "./tools/discord.js";
import { loadStdioServerSpecs } from "./proxy/config.js";
import type { StdioServerSpec } from "./proxy/config.js";
import { StdioHttpProxy } from "./proxy/stdio-proxy.js";
import { loadStdioServerSpecs, type StdioServerSpec } from "./proxy/config.js";
import { StdioHttpProxy } from "./proxy/stdio-proxy.js";
import { pathToFileURL } from "node:url";

const toolCatalog = new Map<string, ToolFactory>([
  ["apply_patch", applyPatchTool],
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
  ["exec.run", execRunTool],
  ["exec.list", execListTool],
  ["pnpm.install", pnpmInstall],
  ["pnpm.add", pnpmAdd],
  ["pnpm.remove", pnpmRemove],
  ["pnpm.runScript", pnpmRunScript],
  ["nx.generatePackage", nxGeneratePackage],
  ["tdd.scaffoldTest", tddScaffoldTest],
  ["tdd.changedFiles", tddChangedFiles],
  ["tdd.runTests", tddRunTests],
  ["tdd.startWatch", tddStartWatch],
  ["tdd.getWatchChanges", tddGetWatchChanges],
  ["tdd.stopWatch", tddStopWatch],
  ["tdd.coverage", tddCoverage],
  ["tdd.propertyCheck", tddPropertyCheck],
  ["tdd.mutationScore", tddMutationScore],
  ["kanban.get-board", kanbanGetBoard],
  ["kanban.get-column", kanbanGetColumn],
  ["kanban.find-task", kanbanFindTaskById],
  ["kanban.find-task-by-title", kanbanFindTaskByTitle],
  ["kanban.update-status", kanbanUpdateStatus],
  ["kanban.move-task", kanbanMoveTask],
  ["kanban.sync-board", kanbanSyncBoard],
  ["kanban.search", kanbanSearchTasks],
  ["discord.send-message", discordSendMessage],
  ["discord.list-messages", discordListMessages],
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

const DEFAULT_PROXY_CONFIG = "config/mcp_servers.edn";

const isFile = (candidate: string): boolean => {
  try {
    return fs.statSync(candidate).isFile();
  } catch {
    return false;
  }
};

const findProxyConfigPath = (cwd: string): string | null => {
  let dir = path.resolve(cwd);
  const root = path.parse(dir).root;

  for (let i = 0; i < 100; i += 1) {
    const candidate = path.join(dir, DEFAULT_PROXY_CONFIG);
    if (isFile(candidate)) {
      return candidate;
    }
    if (dir === root) break;
    dir = path.dirname(dir);
  }

  return null;
};

const resolveProxyConfig = (
  envVars: NodeJS.ProcessEnv,
  cwd: string,
): { readonly path: string; readonly required: boolean } | null => {
  const explicit = envVars.MCP_PROXY_CONFIG?.trim();
  if (explicit) {
    return { path: path.resolve(cwd, explicit), required: true };
  }

  const discovered = findProxyConfigPath(cwd);
  if (discovered) {
    return { path: discovered, required: false };
  }

  return null;
};

const instantiateProxy = (spec: StdioServerSpec): StdioHttpProxy =>
  new StdioHttpProxy(spec, (msg: string, ...rest: unknown[]) => {
    console.log(`[proxy:${spec.name}] ${msg}`, ...rest);
  });

const loadConfiguredProxies = async (
  envVars: NodeJS.ProcessEnv,
  cwd: string,
): Promise<readonly StdioHttpProxy[]> => {
  const resolved = resolveProxyConfig(envVars, cwd);
  if (!resolved) return [];

  const { path: configPath, required } = resolved;
  try {
    const specs = await loadStdioServerSpecs(configPath);
    return specs.map(instantiateProxy);
  } catch (error) {
    const maybeErr = error as NodeJS.ErrnoException;
    if (!required && maybeErr && maybeErr.code === "ENOENT") {
      return [];
    }

    const message =
      maybeErr && typeof maybeErr.message === "string"
        ? maybeErr.message
        : String(error);
    throw new Error(
      `Failed to load MCP stdio proxy config at ${configPath}: ${message}`,
      { cause: error },
    );
  }
};

const main = async () => {
export type HttpTransportConfig = Readonly<{
  endpoints: readonly EndpointDefinition[];
  stdioProxies: readonly StdioServerSpec[];
}>;

export const loadHttpTransportConfig = async (
  cfg: AppConfig,
): Promise<HttpTransportConfig> => {
  const endpoints = resolveHttpEndpoints(cfg);
  if (!cfg.stdioProxyConfig) {
    return { endpoints, stdioProxies: [] };
  }

  const stdioProxies = await loadStdioServerSpecs(cfg.stdioProxyConfig);
  return { endpoints, stdioProxies };
};

export const main = async () => {
  const cfg = loadConfig(env);
  const cwd = process.cwd();
  const ctx = mkCtx();

  if (cfg.transport === "http") {
    const endpoints = resolveHttpEndpoints(cfg);
    const proxies = await loadConfiguredProxies(env, cwd);

    const descriptors: HttpEndpointDescriptor[] = endpoints.map((endpoint) => {
      const factories = selectFactories(endpoint.tools);
      const registry = buildRegistry(factories, ctx);
      return {
        path: endpoint.path,
        kind: "registry",
        handler: createMcpServer(registry.list()),
      } as const;
    });

    for (const proxy of proxies) {
      descriptors.push({
        path: proxy.spec.httpPath,
        kind: "proxy",
        handler: proxy,
      });
    }
    const httpConfig = await loadHttpTransportConfig(cfg);
    const servers = new Map(
      httpConfig.endpoints.map((endpoint) => {
        const factories = selectFactories(endpoint.tools);
        const registry = buildRegistry(factories, ctx);
        return [endpoint.path, createMcpServer(registry.list())] as const;
      }),
    );

    const proxies = httpConfig.stdioProxies.map(
      (spec) =>
        new StdioHttpProxy(spec, (msg: string, ...rest: unknown[]) => {
          console.log(`[mcp:proxy:${spec.name}] ${msg}`, ...rest);
        }),
    );

    const transport = fastifyTransport();
    const summaryParts = [
      `${endpoints.length} endpoint${endpoints.length === 1 ? "" : "s"}`,
    ];
    if (proxies.length > 0) {
      summaryParts.push(
        `${proxies.length} prox${proxies.length === 1 ? "y" : "ies"}`,
      );
    }
    console.log(`[mcp] transport = http (${summaryParts.join(", ")})`);
    await transport.start(descriptors);
    console.log(
      `[mcp] transport = http (${httpConfig.endpoints.length} endpoint${
        httpConfig.endpoints.length === 1 ? "" : "s"
      }, ${proxies.length} prox${proxies.length === 1 ? "y" : "ies"})`,
    );
    await transport.start(servers, proxies);
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

const shouldRunMain = (): boolean => {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return pathToFileURL(entry).href === import.meta.url;
  } catch {
    return false;
  }
};

if (shouldRunMain()) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
