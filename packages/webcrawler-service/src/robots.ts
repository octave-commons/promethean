const robotsParser = require('robots-parser');

import type { CrawlConfig } from './types.js';

interface Robot {
  isAllowed(url: string, ua?: string): boolean | undefined;
  isDisallowed(url: string, ua?: string): boolean | undefined;
  getMatchingLineNumber(url: string, ua?: string): number;
  getCrawlDelay(ua?: string): number | undefined;
  getSitemaps(): string[];
  getPreferredHost(): string | null;
}

type RobotsChecker = {
  readonly isAllowed: (url: string) => Promise<boolean>;
};

type RobotsParserInstance = Robot | null;

const ROBOTS_PATH = '/robots.txt';

export class RobotsManager implements RobotsChecker {
  private readonly fetchImpl: typeof fetch;
  private readonly userAgent: string;
  private readonly parserCache: ReadonlyMap<string, Promise<RobotsParserInstance>>;

  constructor(config: Pick<CrawlConfig, 'fetch' | 'userAgent'>) {
    this.fetchImpl = config.fetch ?? fetch;
    this.userAgent = config.userAgent ?? 'PrometheanCrawler/0.1';
    this.parserCache = new Map();
  }

  isAllowed(url: string): Promise<boolean> {
    return this.fetchParser(url).then((parser) => parser?.isAllowed(url, this.userAgent) ?? true);
  }

  private fetchParser(url: string): Promise<RobotsParserInstance> {
    const parsed = new URL(url);
    const origin = parsed.origin.toLowerCase();
    const cached = this.parserCache.get(origin);
    if (cached) {
      return cached;
    }
    const robotsUrl = new URL(ROBOTS_PATH, parsed.origin).toString();
    const fetchPromise = fetchRobots(this.fetchImpl, robotsUrl, this.userAgent);
    const mutableCache = this.parserCache as Map<string, Promise<RobotsParserInstance>>;
    // eslint-disable-next-line functional/immutable-data
    mutableCache.set(origin, fetchPromise);
    return fetchPromise;
  }
}

const fetchRobots = async (
  fetchImpl: typeof fetch,
  robotsUrl: string,
  userAgent: string,
): Promise<RobotsParserInstance> =>
  fetchImpl(robotsUrl, { headers: { 'user-agent': userAgent } })
    .then((response) =>
      response.ok && response.status < 400 ? response.text() : Promise.resolve(null),
    )
    .then((text) => (text ? robotsParser(robotsUrl, text) : null))
    .catch(() => null);

export type { RobotsChecker };
