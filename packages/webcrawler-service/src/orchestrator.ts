/* eslint-disable functional/prefer-immutable-types, @typescript-eslint/prefer-readonly-parameter-types */
import Fastify, { type FastifyInstance } from "fastify";

import { canonicalHttpUrl } from "./helpers.js";
import type { CrawlConfig } from "./types.js";
import { WebCrawler } from "./webcrawler.js";

type OrchestratorOptions = {
  readonly outputDir: string;
  readonly maxDepth?: number;
  readonly maxPages?: number;
  readonly includeExternal?: boolean;
  readonly requestDelayMs?: number;
  readonly userAgent?: string;
  readonly fetch?: typeof fetch;
};

type CrawlerFactory = (config: CrawlConfig) => { crawl: () => Promise<void> };

type StartResult = Readonly<{ status: "started" | "running" | "no-seeds" }>;
type StopResult = Readonly<{ status: "stopped" | "idle" | "error"; error?: string }>;
type AddSeedResult = Readonly<{ status: "added" | "exists" | "invalid"; url?: string }>;
type RemoveSeedResult = Readonly<{ status: "removed" | "missing" | "invalid"; url?: string }>;
type StatusInfo = Readonly<{
  status: "idle" | "running" | "stopping";
  seeds: readonly string[];
  lastError: string | null;
}>;

type State = {
  readonly seeds: readonly string[];
  readonly status: "idle" | "running" | "stopping";
  readonly stopRequested: boolean;
  readonly lastError: Error | null;
  readonly currentRun: Promise<void> | null;
};

const initialState: State = {
  seeds: [],
  status: "idle",
  stopRequested: false,
  lastError: null,
  currentRun: null,
};

const defaultFactory: CrawlerFactory = (config) => new WebCrawler(config);

export class CrawlerOrchestrator {
  private state: Readonly<State> = initialState;

  constructor(
    private readonly options: OrchestratorOptions,
    private readonly createCrawler: CrawlerFactory = defaultFactory,
  ) {}

  addSeed(rawUrl: string): AddSeedResult {
    const canonical = canonicalHttpUrl(rawUrl);
    if (!canonical) {
      return { status: "invalid" };
    }
    if (this.state.seeds.includes(canonical)) {
      return { status: "exists", url: canonical };
    }
    this.update({ seeds: [...this.state.seeds, canonical] });
    return { status: "added", url: canonical };
  }

  removeSeed(rawUrl: string): RemoveSeedResult {
    const canonical = canonicalHttpUrl(rawUrl);
    if (!canonical) {
      return { status: "invalid" };
    }
    if (!this.state.seeds.includes(canonical)) {
      return { status: "missing" };
    }
    this.update({ seeds: this.state.seeds.filter((seed) => seed !== canonical) });
    return { status: "removed", url: canonical };
  }

  listSeeds(): readonly string[] {
    return this.state.seeds;
  }

  async start(): Promise<StartResult> {
    if (this.state.status === "running" || this.state.status === "stopping") {
      return { status: "running" };
    }
    if (this.state.seeds.length === 0) {
      return { status: "no-seeds" };
    }

    this.update({ status: "running", stopRequested: false, lastError: null });

    const crawlerConfig = this.buildCrawlerConfig();
    const crawler = this.createCrawler(crawlerConfig);

    const run = crawler
      .crawl()
      .catch((error: unknown) => {
        this.update({ lastError: error instanceof Error ? error : new Error(String(error)) });
      })
      .finally(() => {
        this.update({ status: "idle", stopRequested: false, currentRun: null });
      });

    this.update({ currentRun: run });

    return { status: "started" };
  }

  async end(): Promise<StopResult> {
    const run = this.state.currentRun;
    if (!run) {
      this.update({ status: "idle" });
      return { status: "idle" };
    }

    this.update({ status: "stopping", stopRequested: true });

    await run;

    const error = this.state.lastError;
    this.update({ status: "idle", currentRun: null, lastError: null });

    return error ? { status: "error", error: error.message } : { status: "stopped" };
  }

  getStatus(): StatusInfo {
    return {
      status: this.state.status,
      seeds: this.state.seeds,
      lastError: this.state.lastError?.message ?? null,
    };
  }

  private update(partial: Partial<State>): void {
    this.state = { ...this.state, ...partial } satisfies State;
  }

  private buildCrawlerConfig(): CrawlConfig {
    return {
      seeds: this.state.seeds,
      outputDir: this.options.outputDir,
      shouldContinue: () => !this.state.stopRequested,
      ...(this.options.maxDepth !== undefined ? { maxDepth: this.options.maxDepth } : {}),
      ...(this.options.maxPages !== undefined ? { maxPages: this.options.maxPages } : {}),
      ...(this.options.includeExternal !== undefined
        ? { includeExternal: this.options.includeExternal }
        : {}),
      ...(this.options.requestDelayMs !== undefined
        ? { requestDelayMs: this.options.requestDelayMs }
        : {}),
      ...(this.options.userAgent !== undefined ? { userAgent: this.options.userAgent } : {}),
      ...(this.options.fetch !== undefined ? { fetch: this.options.fetch } : {}),
    } satisfies CrawlConfig;
  }
}

export function createOrchestratorServer(
  orchestrator: Readonly<CrawlerOrchestrator>,
): FastifyInstance {
  const app = Fastify({ logger: false });
  registerAddRoute(app, orchestrator);
  registerRemoveRoute(app, orchestrator);
  registerStartRoute(app, orchestrator);
  registerEndRoute(app, orchestrator);
  app.get("/status", async () => orchestrator.getStatus());
  return app;
}

export type { AddSeedResult, RemoveSeedResult, StartResult, StopResult, StatusInfo };

const addSeedReplyStatus = (status: AddSeedResult["status"]): number =>
  status === "invalid" ? 400 : status === "exists" ? 200 : 200;

const removeSeedReplyStatus = (status: RemoveSeedResult["status"]): number => {
  if (status === "invalid") return 400;
  if (status === "missing") return 404;
  return 200;
};

const startReplyStatus = (status: StartResult["status"]): number => {
  if (status === "started") return 202;
  if (status === "no-seeds") return 400;
  return 409;
};

const endReplyStatus = (status: StopResult["status"]): number => {
  if (status === "stopped") return 202;
  if (status === "error") return 500;
  return 200;
};

const registerAddRoute = (
  app: FastifyInstance,
  orchestrator: Readonly<CrawlerOrchestrator>,
) => {
  app.post("/add", async (request, reply) => {
    const body = request.body as { url?: string } | undefined;
    if (!body?.url) {
      reply.code(400);
      return { status: "invalid" } satisfies AddSeedResult;
    }
    const result = orchestrator.addSeed(body.url);
    reply.code(addSeedReplyStatus(result.status));
    return result;
  });
};

const registerRemoveRoute = (
  app: FastifyInstance,
  orchestrator: Readonly<CrawlerOrchestrator>,
) => {
  app.post("/remove", async (request, reply) => {
    const body = request.body as { url?: string } | undefined;
    if (!body?.url) {
      reply.code(400);
      return { status: "invalid" } satisfies RemoveSeedResult;
    }
    const result = orchestrator.removeSeed(body.url);
    reply.code(removeSeedReplyStatus(result.status));
    return result;
  });
};

const registerStartRoute = (
  app: FastifyInstance,
  orchestrator: Readonly<CrawlerOrchestrator>,
) => {
  app.post("/start", async (_request, reply) => {
    const result = await orchestrator.start();
    reply.code(startReplyStatus(result.status));
    return result;
  });
};

const registerEndRoute = (
  app: FastifyInstance,
  orchestrator: Readonly<CrawlerOrchestrator>,
) => {
  app.post("/end", async (_request, reply) => {
    const result = await orchestrator.end();
    reply.code(endReplyStatus(result.status));
    return result;
  });
};
