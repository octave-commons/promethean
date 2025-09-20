import robotsParser from "robots-parser";

import type { CrawlConfig } from "./types.js";

type RobotsChecker = {
  readonly isAllowed: (url: string) => Promise<boolean>;
};

type RobotsParserInstance = ReturnType<typeof robotsParser> | null;

const ROBOTS_PATH = "/robots.txt";

export class RobotsManager implements RobotsChecker {
  private readonly fetchImpl: typeof fetch;
  private readonly userAgent: string;

  constructor(config: Pick<CrawlConfig, "fetch" | "userAgent">) {
    this.fetchImpl = config.fetch ?? fetch;
    this.userAgent = config.userAgent ?? "PrometheanCrawler/0.1";
  }

  isAllowed(url: string): Promise<boolean> {
    return this.fetchParser(url).then((parser) => parser?.isAllowed(url, this.userAgent) ?? true);
  }

  private fetchParser(url: string): Promise<RobotsParserInstance> {
    const parsed = new URL(url);
    const robotsUrl = new URL(ROBOTS_PATH, `${parsed.protocol}//${parsed.host}`).toString();
    return fetchRobots(this.fetchImpl, robotsUrl, this.userAgent);
  }
}

const fetchRobots = async (
  fetchImpl: typeof fetch,
  robotsUrl: string,
  userAgent: string,
): Promise<RobotsParserInstance> =>
  fetchImpl(robotsUrl, { headers: { "user-agent": userAgent } })
    .then((response) =>
      response.ok && response.status < 400 ? response.text() : Promise.resolve(null),
    )
    .then((text) => (text ? robotsParser(robotsUrl, text) : null))
    .catch(() => null);

export type { RobotsChecker };
