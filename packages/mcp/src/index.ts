import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { applyPatchTool } from './tools/apply-patch.js';
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
import {
  loadConfigWithSource,
  type AppConfig,
  CONFIG_FILE_NAME,
} from "./config/load-config.js";
import { buildRegistry } from "./core/registry.js";
import { createMcpServer } from "./core/mcp-server.js";
import { fastifyTransport } from "./core/transports/fastify.js";
import { stdioTransport } from "./core/transports/stdio.js";
import { githubRequestTool } from "./tools/github/request.js";
import { githubGraphqlTool } from "./tools/github/graphql.js";
import { githubRateLimitTool } from "./tools/github/rate-limit.js";
import { githubContentsWrite } from "./tools/github/contents.js";
import {
  githubWorkflowGetJobLogs,
  githubWorkflowGetRunLogs,
} from "./tools/github/workflows.js";
import {
  githubPrGet,
  githubPrFiles,
  githubPrResolvePosition,
} from "./tools/github/pull-request-data.js";
import {
  githubPrReviewStart,
  githubPrReviewCommentInline,
  githubPrReviewSubmit,
} from "./tools/github/pull-request-review.js";
import {
  githubReviewCheckoutBranch,
  githubReviewCommit,
  githubReviewCreateBranch,
  githubReviewGetActionStatus,
  githubReviewGetComments,
  githubReviewGetReviewComments,
  githubReviewRequestChangesFromCodex,
  githubReviewOpenPullRequest,
  githubReviewPush,
  githubReviewRevertCommits,
  githubReviewSubmitComment,
  githubReviewSubmitReview,
} from "./tools/github/code-review.js";
import { githubApplyPatchTool } from "./tools/github/apply-patch.js";
import {
  filesListDirectory,
  filesTreeDirectory,
  filesViewFile,
  filesWriteFileContent,
  filesWriteFileLines,
} from './tools/files.js';
import { filesSearch } from './tools/search.js';
import {
  processEnqueueTask,
  processGetQueue,
  processGetStderr,
  processGetStdout,
  processGetTaskRunnerConfig,
  processStopTask,
  processUpdateTaskRunnerConfig,
} from './tools/process-manager.js';
import { execRunTool, execListTool } from './tools/exec.js';
import {
  kanbanFindTaskById,
  kanbanFindTaskByTitle,
  kanbanGetBoard,
  kanbanGetColumn,
  kanbanMoveTask,
  kanbanSearchTasks,
  kanbanSyncBoard,
  kanbanUpdateStatus,
} from './tools/kanban.js';
import { pnpmAdd, pnpmInstall, pnpmRemove, pnpmRunScript } from './tools/pnpm.js';
import { nxGeneratePackage } from './tools/nx.js';
import type { ToolFactory } from './core/types.js';
import type { HttpEndpointDescriptor } from './core/transports/fastify.js';
import {
  resolveHttpEndpoints,
  resolveStdioTools,
  type EndpointDefinition,
} from './core/resolve-config.js';
import { discordSendMessage, discordListMessages } from './tools/discord.js';
import { loadStdioServerSpecs, type StdioServerSpec } from './proxy/config.js';
import { StdioHttpProxy } from './proxy/stdio-proxy.js';
import { sandboxCreateTool, sandboxDeleteTool, sandboxListTool } from './tools/sandboxes.js';
import {
  ollamaPull,
  ollamaListModels,
  ollamaListTemplates,
  ollamaCreateTemplate,
  ollamaEnqueueGenerateJob,
  ollamaEnqueueChatCompletion,
  ollamaEnqueueJobFromTemplate,
  ollamaStartConversation,
  ollamaGetQueue,
  ollamaRemoveJob,
} from './tools/ollama.js';

import { help as helpTool, toolset as toolsetTool, endpoints as endpointsTool } from "./tools/help.js";
import { validateConfig as validateConfigTool } from "./tools/validate-config.js";

type ToolSummary = Readonly<{
  id: string;
  name?: string;
  description?: string;
}>;

const toolCatalog = new Map<string, ToolFactory>([
  ['apply_patch', applyPatchTool],
  ['github.request', githubRequestTool],
  ['github.graphql', githubGraphqlTool],
  ['github.rate-limit', githubRateLimitTool],
  ['github.contents.write', githubContentsWrite],
  ['github.review.openPullRequest', githubReviewOpenPullRequest],
  ['github.review.getComments', githubReviewGetComments],
  ['github.review.getReviewComments', githubReviewGetReviewComments],
  ['github.review.submitComment', githubReviewSubmitComment],
  ['github.review.requestChangesFromCodex', githubReviewRequestChangesFromCodex],
  ['github.review.submitReview', githubReviewSubmitReview],
  ['github.review.getActionStatus', githubReviewGetActionStatus],
  ['github.review.commit', githubReviewCommit],
  ['github.review.push', githubReviewPush],
  ['github.review.checkoutBranch', githubReviewCheckoutBranch],
  ['github.review.createBranch', githubReviewCreateBranch],
  ['github.review.revertCommits', githubReviewRevertCommits],
  ['files.list-directory', filesListDirectory],
  ['files.tree-directory', filesTreeDirectory],
  ['files.view-file', filesViewFile],
  ['files.write-content', filesWriteFileContent],
  ['files.write-lines', filesWriteFileLines],
  ['files.search', filesSearch],
  ['process.getTaskRunnerConfig', processGetTaskRunnerConfig],
  ['process.updateTaskRunnerConfig', processUpdateTaskRunnerConfig],
  ['process.enqueueTask', processEnqueueTask],
  ['process.stop', processStopTask],
  ['process.getQueue', processGetQueue],
  ['process.getStdout', processGetStdout],
  ['process.getStderr', processGetStderr],
  ['exec.run', execRunTool],
  ['exec.list', execListTool],
  ['pnpm.install', pnpmInstall],
  ['pnpm.add', pnpmAdd],
  ['pnpm.remove', pnpmRemove],
  ['pnpm.runScript', pnpmRunScript],
  ['nx.generatePackage', nxGeneratePackage],
  ['tdd.scaffoldTest', tddScaffoldTest],
  ['tdd.changedFiles', tddChangedFiles],
  ['tdd.runTests', tddRunTests],
  ['tdd.startWatch', tddStartWatch],
  ['tdd.getWatchChanges', tddGetWatchChanges],
  ['tdd.stopWatch', tddStopWatch],
  ['tdd.coverage', tddCoverage],
  ['tdd.propertyCheck', tddPropertyCheck],
  ['tdd.mutationScore', tddMutationScore],
  ['kanban.get-board', kanbanGetBoard],
  ['kanban.get-column', kanbanGetColumn],
  ['kanban.find-task', kanbanFindTaskById],
  ['kanban.find-task-by-title', kanbanFindTaskByTitle],
  ['kanban.update-status', kanbanUpdateStatus],
  ['kanban.move-task', kanbanMoveTask],
  ['kanban.sync-board', kanbanSyncBoard],
  ['kanban.search', kanbanSearchTasks],
  ['discord.send-message', discordSendMessage],
  ['discord.list-messages', discordListMessages],
  ['sandbox.create', sandboxCreateTool],
  ['sandbox.list', sandboxListTool],
  ['sandbox.delete', sandboxDeleteTool],
  ['ollama.pull', ollamaPull],
  ['ollama.listModels', ollamaListModels],
  ['ollama.listTemplates', ollamaListTemplates],
  ['ollama.createTemplate', ollamaCreateTemplate],
  ['ollama.enqueueGenerateJob', ollamaEnqueueGenerateJob],
  ['ollama.enqueueChatCompletion', ollamaEnqueueChatCompletion],
  ['ollama.enqueueJobFromTemplate', ollamaEnqueueJobFromTemplate],
  ['ollama.startConversation', ollamaStartConversation],
  ['ollama.getQueue', ollamaGetQueue],
  ['ollama.removeJob', ollamaRemoveJob],
  ["apply_patch", applyPatchTool],
  ["github.request", githubRequestTool],
  ["github.graphql", githubGraphqlTool],
  ["github.rate-limit", githubRateLimitTool],
  ["github.contents.write", githubContentsWrite],
  ["github.workflow.getRunLogs", githubWorkflowGetRunLogs],
  ["github.workflow.getJobLogs", githubWorkflowGetJobLogs],
  ["github.apply_patch", githubApplyPatchTool],
  ["github.pr.get", githubPrGet],
  ["github.pr.files", githubPrFiles],
  ["github.pr.resolvePosition", githubPrResolvePosition],
  ["github.pr.review.start", githubPrReviewStart],
  ["github.pr.review.commentInline", githubPrReviewCommentInline],
  ["github.pr.review.submit", githubPrReviewSubmit],
  ["github.review.openPullRequest", githubReviewOpenPullRequest],
  ["github.review.getComments", githubReviewGetComments],
  ["github.review.getReviewComments", githubReviewGetReviewComments],
  ["github.review.submitComment", githubReviewSubmitComment],
  [
    "github.review.requestChangesFromCodex",
    githubReviewRequestChangesFromCodex,
  ],
  ["github.review.submitReview", githubReviewSubmitReview],
  ["mcp.help", helpTool],
  ["mcp.toolset", toolsetTool],
  ["mcp.endpoints", endpointsTool],
  ["github.review.getActionStatus", githubReviewGetActionStatus],
  ["github.review.commit", githubReviewCommit],
  ["github.review.push", githubReviewPush],
  ["github.review.checkoutBranch", githubReviewCheckoutBranch],
  ["mcp.validate-config", validateConfigTool],
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
  ["sandbox.create", sandboxCreateTool],
  ["sandbox.list", sandboxListTool],
  ["sandbox.delete", sandboxDeleteTool],
]);

const env = process.env;
const mkCtx = () => ({
  env,
  fetch: global.fetch.bind(global),
  now: () => new Date(),
});

const collectToolSummaries = (
  ctx: ReturnType<typeof mkCtx>,
): readonly ToolSummary[] =>
  Array.from(toolCatalog.entries()).map(([id, factory]) => {
    const tool = factory(ctx);
    return {
      id,
      name: tool.spec.name,
      description: tool.spec.description,
    };
  });

// Ensure the meta tools are available within any registry subset when enabled.
const ensureMetaTools = (
  ids: readonly string[],
  includeHelp: boolean = true,
): readonly string[] => {
  if (!includeHelp) return ids;
  const need: string[] = [];
  if (toolCatalog.has("mcp.help") && !ids.includes("mcp.help")) need.push("mcp.help");
  if (toolCatalog.has("mcp.toolset") && !ids.includes("mcp.toolset")) need.push("mcp.toolset");
  if (toolCatalog.has("mcp.endpoints") && !ids.includes("mcp.endpoints")) need.push("mcp.endpoints");
  return need.length ? [...ids, ...need] : ids;
};

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

const DEFAULT_PROXY_CONFIG = 'config/mcp_servers.edn';

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
    if (!required && maybeErr && maybeErr.code === 'ENOENT') {
      return [];
    }

    const message =
      maybeErr && typeof maybeErr.message === 'string' ? maybeErr.message : String(error);
    throw new Error(`Failed to load MCP stdio proxy config at ${configPath}: ${message}`, {
      cause: error,
    });
  }
};

export type HttpTransportConfig = Readonly<{
  endpoints: readonly EndpointDefinition[];
  stdioProxies: readonly StdioServerSpec[];
}>;

export const loadHttpTransportConfig = async (
  cfg: Readonly<AppConfig>,
): Promise<HttpTransportConfig> => {
  const endpoints = resolveHttpEndpoints(cfg);
  if (!cfg.stdioProxyConfig) {
    return { endpoints, stdioProxies: [] };
  }

  const stdioProxies = await loadStdioServerSpecs(cfg.stdioProxyConfig);
  return { endpoints, stdioProxies };
};

export const main = async (): Promise<void> => {
  const { config: cfg, source } = loadConfigWithSource(env);
  const cwd = process.cwd();
  const ctx: any = mkCtx();

  if (cfg.transport === 'http') {
    const httpConfig = await loadHttpTransportConfig(cfg);
    (ctx as any).__allEndpoints = httpConfig.endpoints;
    (ctx as any).__allToolIds = Array.from(toolCatalog.keys());
    const registryDescriptors: HttpEndpointDescriptor[] =
      httpConfig.endpoints.map((endpoint) => {
        const factories = selectFactories(
          ensureMetaTools(endpoint.tools, endpoint.includeHelp !== false),
        );
        const registry = buildRegistry(factories, ctx);
        ctx.__registryList = () => registry.list();
        ctx.__endpointDef = endpoint;
        ctx.__allEndpoints = httpConfig.endpoints;
        return {
          path: endpoint.path,
          kind: "registry" as const,
          handler: createMcpServer(registry.list()),
        } satisfies HttpEndpointDescriptor;
      });

    const proxiesFromConfig = httpConfig.stdioProxies.map(instantiateProxy);
    const fallbackProxies =
      proxiesFromConfig.length > 0 ? [] : await loadConfiguredProxies(env, cwd);
    const stdioProxies = proxiesFromConfig.length > 0 ? proxiesFromConfig : fallbackProxies;

    const proxyDescriptors: HttpEndpointDescriptor[] = stdioProxies.map((proxy) => ({
      path: proxy.spec.httpPath,
      kind: 'proxy' as const,
      handler: proxy,
    }));

    const descriptors: HttpEndpointDescriptor[] = [...registryDescriptors, ...proxyDescriptors];

    const transport = fastifyTransport();
    const defaultConfigPath = path.resolve(process.cwd(), CONFIG_FILE_NAME);
    const configPath = source.type === "file" ? source.path : defaultConfigPath;
    const toolSummaries = collectToolSummaries(ctx);

    const summaryParts = [
      `${registryDescriptors.length} endpoint${registryDescriptors.length === 1 ? '' : 's'}`,
    ];
    if (stdioProxies.length > 0) {
      summaryParts.push(`${stdioProxies.length} prox${stdioProxies.length === 1 ? 'y' : 'ies'}`);
    }
    console.log(`[mcp] transport = http (${summaryParts.join(", ")})`);
    await transport.start(descriptors, {
      ui: {
        availableTools: toolSummaries,
        config: cfg,
        configSource: source,
        configPath,
        httpEndpoints: httpConfig.endpoints,
      },
    });
    return;
  }

  const toolIds = ensureMetaTools(
    resolveStdioTools(cfg),
    (cfg as any).includeHelp !== false,
  );
  const factories = selectFactories(toolIds);
  const registry = buildRegistry(factories, ctx);
  ctx.__registryList = () => registry.list();
  ctx.__endpointDef = {
    path: "/mcp",
    tools: toolIds,
    includeHelp: (cfg as any).includeHelp,
    meta: (cfg as any).stdioMeta,
  };
  ctx.__allEndpoints = resolveHttpEndpoints(cfg);
  ctx.__allToolIds = Array.from(toolCatalog.keys());
  const server = createMcpServer(registry.list());
  const transport = stdioTransport();
  console.log('[mcp] transport = stdio');
  await transport.start(server);
};

const shouldRunMain = (): boolean => {
  const entry = process.argv[1];
  if (!entry) return false;
  // eslint-disable-next-line functional/no-try-statements
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
