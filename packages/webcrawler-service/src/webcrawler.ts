import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { load } from "cheerio";
import type { Element as CheerioElement } from "cheerio";
import TurndownService from "turndown";

import { RobotsManager } from "./robots.js";
import {
  appendManyUnique,
  appendUnique,
  dedupeStrings,
  determineFileSegment,
  hostIsAllowed,
  hostToDirectory,
  canonicalHttpUrl,
  resolveHttpHref,
  sanitizeSegment,
  shouldStop,
} from "./helpers.js";
import type { CrawlConfig } from "./types.js";

type QueueItem = {
  readonly url: string;
  readonly depth: number;
};

type CrawlState = {
  readonly queue: readonly QueueItem[];
  readonly visited: readonly string[];
  readonly seen: readonly string[];
  readonly processed: number;
};

type PageResult = {
  readonly markdown: string;
  readonly links: readonly string[];
};

const DEFAULT_USER_AGENT = "PrometheanCrawler/0.1 (+https://promethean.local)";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    if (ms <= 0) {
      resolve();
      return;
    }
    setTimeout(resolve, ms);
  });

export class WebCrawler {
  private readonly seeds: readonly string[];
  private readonly outputDir: string;
  private readonly maxDepth: number;
  private readonly maxPages: number;
  private readonly includeExternal: boolean;
  private readonly userAgent: string;
  private readonly requestDelayMs: number;
  private readonly fetchImpl: typeof fetch;
  private readonly robots: RobotsManager;
  private readonly allowedHosts: readonly string[];
  private readonly turndown: TurndownService;
  private readonly continueFn: () => boolean;

  constructor(config: CrawlConfig) {
    if (!Array.isArray(config.seeds) || config.seeds.length === 0) {
      throw new Error("seeds required");
    }
    if (!config.outputDir) {
      throw new Error("outputDir required");
    }

    const normalizedSeeds = dedupeStrings(
      config.seeds
        .map(canonicalHttpUrl)
        .filter((value): value is string => value !== null),
    );

    if (normalizedSeeds.length === 0) {
      throw new Error("no valid http/https seeds provided");
    }

    this.seeds = normalizedSeeds;
    this.outputDir = config.outputDir;
    this.maxDepth = config.maxDepth ?? 2;
    this.maxPages = config.maxPages ?? Number.POSITIVE_INFINITY;
    this.includeExternal = config.includeExternal ?? false;
    this.userAgent = config.userAgent ?? DEFAULT_USER_AGENT;
    this.requestDelayMs = Math.max(0, config.requestDelayMs ?? 0);
    this.fetchImpl = config.fetch ?? fetch;
    this.robots = new RobotsManager({ fetch: this.fetchImpl, userAgent: this.userAgent });
    this.allowedHosts = this.includeExternal
      ? []
      : normalizedSeeds.map((seed) => new URL(seed).host);
    this.turndown = new TurndownService({ headingStyle: "atx" });
    this.continueFn = config.shouldContinue ?? (() => true);
  }

  async crawl(): Promise<void> {
    if (!this.continueFn()) {
      return;
    }
    await mkdir(this.outputDir, { recursive: true });
    const initialQueue = this.seeds.map<QueueItem>((url) => ({ url, depth: 0 }));
    const initialState: CrawlState = {
      queue: initialQueue,
      visited: [],
      seen: initialQueue.map((item) => item.url),
      processed: 0,
    };
    await this.crawlRecursive(initialState);
  }

  private async crawlRecursive(state: CrawlState): Promise<void> {
    if (this.shouldTerminate(state)) {
      return;
    }

    const [current, ...rest] = state.queue;
    if (!current) {
      return;
    }

    if (state.visited.includes(current.url)) {
      await this.crawlRecursive(this.skipState(state, rest));
      return;
    }

    const baseState = this.baseNextState(state, rest, current.url);
    if (await this.shouldVisit(current.url)) {
      await this.processVisit(current, baseState);
      return;
    }
    await this.crawlRecursive(baseState);
  }

  private shouldTerminate(state: CrawlState): boolean {
    if (!this.continueFn()) {
      return true;
    }
    return shouldStop({
      queueLength: state.queue.length,
      processed: state.processed,
      maxPages: this.maxPages,
    });
  }

  private skipState(state: CrawlState, queue: readonly QueueItem[]): CrawlState {
    return {
      queue,
      visited: state.visited,
      seen: state.seen,
      processed: state.processed,
    };
  }

  private baseNextState(
    state: CrawlState,
    queue: readonly QueueItem[],
    currentUrl: string,
  ): CrawlState {
    return {
      queue,
      visited: appendUnique(state.visited, currentUrl),
      seen: appendUnique(state.seen, currentUrl),
      processed: state.processed,
    };
  }

  private async processVisit(current: QueueItem, state: CrawlState): Promise<void> {
    if (!this.continueFn()) {
      return;
    }
    const page = await this.fetchPage(current.url);
    if (!this.continueFn()) {
      return;
    }
    if (!page) {
      await this.crawlRecursive(state);
      return;
    }
    await this.saveMarkdown(current.url, page.markdown);
    await this.afterSuccessfulFetch(current, state, page);
  }

  private async afterSuccessfulFetch(
    current: QueueItem,
    state: CrawlState,
    page: PageResult,
  ): Promise<void> {
    if (!this.continueFn()) {
      return;
    }
    const nextProcessed = state.processed + 1;
    const nextQueue = this.enqueueLinks(
      page.links,
      state.queue,
      state.seen,
      current.depth,
    );
    const nextSeen = appendManyUnique(state.seen, page.links);

    const nextState: CrawlState = {
      queue: nextQueue,
      visited: state.visited,
      seen: nextSeen,
      processed: nextProcessed,
    };

    await this.waitIfNeeded();
    if (!this.continueFn()) {
      return;
    }
    await this.crawlRecursive(nextState);
  }

  private async shouldVisit(url: string): Promise<boolean> {
    if (!this.continueFn()) {
      return false;
    }
    const allowedHost = this.includeExternal || hostIsAllowed(this.allowedHosts, url);
    if (!allowedHost) {
      return false;
    }
    if (!this.continueFn()) {
      return false;
    }
    return this.robots.isAllowed(url);
  }

  private async fetchPage(url: string): Promise<PageResult | null> {
    if (!this.continueFn()) {
      return null;
    }
    const response = await this.fetchImpl(url, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": this.userAgent,
      },
    }).catch(() => null);

    if (!response || !this.continueFn()) {
      return null;
    }
    if (!response.ok) {
      return null;
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!isHtmlContent(contentType)) {
      return null;
    }
    const html = await response.text();
    if (!this.continueFn()) {
      return null;
    }
    return {
      markdown: this.turndown.turndown(html),
      links: extractLinks(html, url),
    } satisfies PageResult;
  }

  private saveMarkdown(url: string, markdown: string): Promise<void> {
    const outputPath = this.resolveOutputPath(url);
    return mkdir(dirname(outputPath), { recursive: true }).then(() =>
      writeFile(outputPath, markdown, "utf8"),
    );
  }

  private async waitIfNeeded(): Promise<void> {
    if (!this.continueFn() || this.requestDelayMs <= 0) {
      return;
    }
    await sleep(this.requestDelayMs);
  }

  private enqueueLinks(
    links: readonly string[],
    queue: readonly QueueItem[],
    seen: readonly string[],
    depth: number,
  ): readonly QueueItem[] {
    if (depth >= this.maxDepth) {
      return queue;
    }

    return links.reduce<readonly QueueItem[]>((acc, link) => {
      if (!this.includeExternal && !hostIsAllowed(this.allowedHosts, link)) {
        return acc;
      }
      if (seen.includes(link) || acc.some((item) => item.url === link)) {
        return acc;
      }
      return [...acc, { url: link, depth: depth + 1 }];
    }, queue);
  }

  private resolveOutputPath(rawUrl: string): string {
    const url = new URL(rawUrl);
    const hostSegment = hostToDirectory(url.hostname);
    const segments = url.pathname.split("/");
    const directorySegments = segments
      .slice(0, -1)
      .filter((segment) => segment !== "")
      .map(sanitizeSegment);

    const fileSegment = determineFileSegment(url.pathname, segments);
    const querySuffix = url.search
      ? `-${createHash("sha1").update(url.search).digest("hex").slice(0, 8)}`
      : "";
    const filename = `${fileSegment}${querySuffix}.md`;
    return join(this.outputDir, hostSegment, ...directorySegments, filename);
  }
}

const isHtmlContent = (contentType: string): boolean =>
  /text\/html|application\/xhtml\+xml/i.test(contentType);

const extractLinks = (html: string, baseUrl: string): readonly string[] => {
  const $ = load(html);
  const anchors = $("a[href]")
    .toArray()
    .filter(
      (node): node is CheerioElement =>
        typeof node === "object" && node !== null && "attribs" in node,
    );
  return anchors.reduce<readonly string[]>((acc, element) => {
    const href = $(element).attr("href");
    const resolved = href ? resolveHttpHref(baseUrl, href) : null;
    return resolved && !acc.includes(resolved) ? [...acc, resolved] : acc;
  }, []);
};
