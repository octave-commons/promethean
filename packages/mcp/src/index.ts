/* eslint-disable functional/immutable-data, functional/no-let, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unnecessary-type-assertion */
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
} from './tools/tdd.js';
import {
  loadConfigWithSource,
  type AppConfig,
  CONFIG_FILE_NAME,
  type InlineProxyConfig,
} from './config/load-config.js';
import { buildRegistry } from './core/registry.js';
import { createMcpServer } from './core/mcp-server.js';
import { fastifyTransport } from './core/transports/fastify.js';
import { stdioTransport } from './core/transports/stdio.js';
import { githubRequestTool } from './tools/github/request.js';
import { githubGraphqlTool } from './tools/github/graphql.js';
import { githubRateLimitTool } from './tools/github/rate-limit.js';
import { githubContentsWrite } from './tools/github/contents.js';
import { githubWorkflowGetJobLogs, githubWorkflowGetRunLogs } from './tools/github/workflows.js';
import {
  githubPrGet,
  githubPrFiles,
  githubPrResolvePosition,
} from './tools/github/pull-request-data.js';
import {
  githubPrReviewStart,
  githubPrReviewCommentInline,
  githubPrReviewSubmit,
} from './tools/github/pull-request-review.js';
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
} from './tools/github/code-review.js';
import { githubApplyPatchTool } from './tools/github/apply-patch.js';
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

import {
  help as helpTool,
  toolset as toolsetTool,
  endpoints as endpointsTool,
} from './tools/help.js';
import { validateConfig as validateConfigTool } from './tools/validate-config.js';

export * as githubConflicts from './github/conflicts/index.js';
export * as ollama from './ollama/index.js';

type ToolSummary = Readonly<{
  id: string;
  name?: string;
  description?: string;
}>;

const toolCatalog = new Map<string, ToolFactory>([
  ['apply_patch', applyPatchTool],
  ['github_request', githubRequestTool],
  ['github_graphql', githubGraphqlTool],
  ['github_rate_limit', githubRateLimitTool],
  ['github_contents_write', githubContentsWrite],
  ['github_workflow_get_run_logs', githubWorkflowGetRunLogs],
  ['github_workflow_get_job_logs', githubWorkflowGetJobLogs],
  ['github_apply_patch', githubApplyPatchTool],
  ['github_review_open_pull_request', githubReviewOpenPullRequest],
  ['github_review_get_comments', githubReviewGetComments],
  ['github_review_get_review_comments', githubReviewGetReviewComments],
  ['github_review_submit_comment', githubReviewSubmitComment],
  ['github_review_request_changes_from_codex', githubReviewRequestChangesFromCodex],
  ['github_review_submit_review', githubReviewSubmitReview],
  ['github_review_get_action_status', githubReviewGetActionStatus],
  ['github_review_commit', githubReviewCommit],
  ['github_review_push', githubReviewPush],
  ['github_review_checkout_branch', githubReviewCheckoutBranch],
  ['github_review_create_branch', githubReviewCreateBranch],
  ['github_review_revert_commits', githubReviewRevertCommits],
  ['github_pr_get', githubPrGet],
  ['github_pr_files', githubPrFiles],
  ['github_pr_resolve_position', githubPrResolvePosition],
  ['github_pr_review_start', githubPrReviewStart],
  ['github_pr_review_comment_inline', githubPrReviewCommentInline],
  ['github_pr_review_submit', githubPrReviewSubmit],
  ['files_list_directory', filesListDirectory],
  ['files_tree_directory', filesTreeDirectory],
  ['files_view_file', filesViewFile],
  ['files_write_content', filesWriteFileContent],
  ['files_write_lines', filesWriteFileLines],
  ['files_search', filesSearch],
  ['process_get_task_runner_config', processGetTaskRunnerConfig],
  ['process_update_task_runner_config', processUpdateTaskRunnerConfig],
  ['process_enqueue_task', processEnqueueTask],
  ['process_stop', processStopTask],
  ['process_get_queue', processGetQueue],
  ['process_get_stdout', processGetStdout],
  ['process_get_stderr', processGetStderr],
  ['exec_run', execRunTool],
  ['exec_list', execListTool],
  ['pnpm_install', pnpmInstall],
  ['pnpm_add', pnpmAdd],
  ['pnpm_remove', pnpmRemove],
  ['pnpm_run_script', pnpmRunScript],
  ['nx_generate_package', nxGeneratePackage],
  ['tdd_scaffold_test', tddScaffoldTest],
  ['tdd_changed_files', tddChangedFiles],
  ['tdd_run_tests', tddRunTests],
  ['tdd_start_watch', tddStartWatch],
  ['tdd_get_watch_changes', tddGetWatchChanges],
  ['tdd_stop_watch', tddStopWatch],
  ['tdd_coverage', tddCoverage],
  ['tdd_property_check', tddPropertyCheck],
  ['tdd_mutation_score', tddMutationScore],
  ['kanban_get_board', kanbanGetBoard],
  ['kanban_get_column', kanbanGetColumn],
  ['kanban_find_task', kanbanFindTaskById],
  ['kanban_find_task_by_title', kanbanFindTaskByTitle],
  ['kanban_update_status', kanbanUpdateStatus],
  ['kanban_move_task', kanbanMoveTask],
  ['kanban_sync_board', kanbanSyncBoard],
  ['kanban_search', kanbanSearchTasks],
  ['discord_send_message', discordSendMessage],
  ['discord_list_messages', discordListMessages],
  ['sandbox_create', sandboxCreateTool],
  ['sandbox_list', sandboxListTool],
  ['sandbox_delete', sandboxDeleteTool],
  ['ollama_pull', ollamaPull],
  ['ollama_list_models', ollamaListModels],
  ['ollama_list_templates', ollamaListTemplates],
  ['ollama_create_template', ollamaCreateTemplate],
  ['ollama_enqueue_generate_job', ollamaEnqueueGenerateJob],
  ['ollama_enqueue_chat_completion', ollamaEnqueueChatCompletion],
  ['ollama_enqueue_job_from_template', ollamaEnqueueJobFromTemplate],
  ['ollama_start_conversation', ollamaStartConversation],
  ['ollama_get_queue', ollamaGetQueue],
  ['ollama_remove_job', ollamaRemoveJob],
  ['mcp_help', helpTool],
  ['mcp_toolset', toolsetTool],
  ['mcp_endpoints', endpointsTool],
  ['mcp_validate_config', validateConfigTool],
]);

const env = process.env;
const mkCtx = () => ({
  env,
  fetch: global.fetch.bind(global),
  now: () => new Date(),
});

const collectToolSummaries = (ctx: ReturnType<typeof mkCtx>): readonly ToolSummary[] =>
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
  if (toolCatalog.has('mcp_help') && !ids.includes('mcp_help')) need.push('mcp_help');
  if (toolCatalog.has('mcp_toolset') && !ids.includes('mcp_toolset')) need.push('mcp_toolset');
  if (toolCatalog.has('mcp_endpoints') && !ids.includes('mcp_endpoints'))
    need.push('mcp_endpoints');
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
  inlineProxySpecs: readonly StdioServerSpec[];
  legacyProxySpecs: readonly StdioServerSpec[];
}>;

const ensureLeadingSlash = (value: string): string => (value.startsWith('/') ? value : `/${value}`);

const toStdioServerSpec = (proxy: InlineProxyConfig): StdioServerSpec => ({
  name: proxy.name,
  command: proxy.command,
  args: [...proxy.args],
  env: { ...proxy.env },
  cwd: proxy.cwd,
  httpPath: ensureLeadingSlash(proxy.httpPath),
});

export const loadHttpTransportConfig = async (
  cfg: Readonly<AppConfig>,
): Promise<HttpTransportConfig> => {
  const endpoints = resolveHttpEndpoints(cfg);
  const inlineSpecs = (cfg.stdioProxies ?? []).map(toStdioServerSpec);
  if (inlineSpecs.length > 0) {
    return { endpoints, inlineProxySpecs: inlineSpecs, legacyProxySpecs: [] };
  }

  if (!cfg.stdioProxyConfig) {
    return { endpoints, inlineProxySpecs: [], legacyProxySpecs: [] };
  }

  const stdioProxies = await loadStdioServerSpecs(cfg.stdioProxyConfig);
  return { endpoints, inlineProxySpecs: [], legacyProxySpecs: stdioProxies };
};

export const main = async (): Promise<void> => {
  const { config: cfg, source } = loadConfigWithSource(env);
  const cwd = process.cwd();
  const ctx: any = mkCtx();

  if (cfg.transport === 'http') {
    const httpConfig = await loadHttpTransportConfig(cfg);
    (ctx as any).__allEndpoints = httpConfig.endpoints;
    (ctx as any).__allToolIds = Array.from(toolCatalog.keys());
    const registryDescriptors: HttpEndpointDescriptor[] = httpConfig.endpoints.map((endpoint) => {
      const factories = selectFactories(
        ensureMetaTools(endpoint.tools, endpoint.includeHelp !== false),
      );
      const registry = buildRegistry(factories, ctx);
      const tools = registry.list();
      ctx.__registryList = () => registry.list();
      ctx.__endpointDef = endpoint;
      ctx.__allEndpoints = httpConfig.endpoints;
      return {
        path: endpoint.path,
        kind: 'registry' as const,
        handler: createMcpServer(tools),
        tools,
        definition: endpoint,
      } satisfies HttpEndpointDescriptor;
    });

    const inlineProxySpecs = httpConfig.inlineProxySpecs;
    const inlineProxies = inlineProxySpecs.map(instantiateProxy);
    const legacyProxySpecs = inlineProxySpecs.length > 0 ? [] : httpConfig.legacyProxySpecs;
    const legacyProxies = legacyProxySpecs.map(instantiateProxy);
    const fallbackProxies =
      inlineProxySpecs.length > 0 || legacyProxySpecs.length > 0
        ? []
        : await loadConfiguredProxies(env, cwd);
    const stdioProxies =
      inlineProxies.length > 0
        ? inlineProxies
        : legacyProxies.length > 0
          ? legacyProxies
          : fallbackProxies;

    (ctx as any).__proxySources = {
      inline: inlineProxySpecs,
      config: legacyProxySpecs,
      fallback: fallbackProxies.map((proxy) => proxy.spec),
    } as const;

    const proxyDescriptors: HttpEndpointDescriptor[] = stdioProxies.map((proxy) => ({
      path: proxy.spec.httpPath,
      kind: 'proxy' as const,
      handler: proxy,
    }));

    const descriptors: HttpEndpointDescriptor[] = [...registryDescriptors, ...proxyDescriptors];

    const transport = fastifyTransport();
    const defaultConfigPath = path.resolve(process.cwd(), CONFIG_FILE_NAME);
    const configPath = source.type === 'file' ? source.path : defaultConfigPath;
    const toolSummaries = collectToolSummaries(ctx);

    const summaryParts = [
      `${registryDescriptors.length} endpoint${registryDescriptors.length === 1 ? '' : 's'}`,
    ];
    if (inlineProxySpecs.length > 0) {
      summaryParts.push(
        `${inlineProxySpecs.length} inline prox${inlineProxySpecs.length === 1 ? 'y' : 'ies'}`,
      );
    } else if (legacyProxySpecs.length > 0) {
      summaryParts.push(
        `${legacyProxySpecs.length} prox${
          legacyProxySpecs.length === 1 ? 'y' : 'ies'
        } from stdioProxyConfig`,
      );
    }
    if (fallbackProxies.length > 0) {
      summaryParts.push(
        `${fallbackProxies.length} prox${
          fallbackProxies.length === 1 ? 'y' : 'ies'
        } from legacy fallback`,
      );
    }
    console.log(`[mcp] transport = http (${summaryParts.join(', ')})`);
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

  const toolIds = ensureMetaTools(resolveStdioTools(cfg), (cfg as any).includeHelp !== false);
  const factories = selectFactories(toolIds);
  const registry = buildRegistry(factories, ctx);
  ctx.__registryList = () => registry.list();
  ctx.__endpointDef = {
    path: '/mcp',
    tools: toolIds,
    includeHelp: (cfg as any).includeHelp,
    meta: (cfg as any).stdioMeta,
  };
  ctx.__allEndpoints = resolveHttpEndpoints(cfg);
  ctx.__allToolIds = Array.from(toolCatalog.keys());
  (ctx as any).__proxySources = { inline: [], config: [], fallback: [] } as const;
  const server = createMcpServer(registry.list());
  const transport = stdioTransport();
  console.log('[mcp] transport = stdio');
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
