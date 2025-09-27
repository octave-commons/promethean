import { mkdtemp, readFile, readdir, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import test, { type ExecutionContext } from "ava";

import { WebCrawler } from "../webcrawler.js";
import type { CrawlConfig } from "../types.js";

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types, functional/prefer-immutable-types */
type ResponseEntry = readonly [string, Response];
type FetchInput = Parameters<typeof fetch>[0];
type DeepReadonly<T> = T extends (...args: unknown[]) => unknown
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;
type SetupOptions = DeepReadonly<{
  readonly maxDepth?: number;
  readonly seeds?: readonly string[];
}>;

test("crawls pages and stores markdown", async (t: ExecutionContext) => {
  const responses: readonly ResponseEntry[] = [
    [
      "https://example.com/robots.txt",
      createResponse("User-agent: *\nAllow: /"),
    ],
    [
      "https://example.com/",
      createResponse(
        '<html><head><title>Home</title></head><body><h1>Welcome</h1><a href="/about">About</a></body></html>',
      ),
    ],
    [
      "https://example.com/about",
      createResponse(
        "<html><body><h2>About Us</h2><p>We build things.</p></body></html>",
      ),
    ],
  ];

  const { outputDir, run } = await setupCrawler(responses);
  await run();

  const hostDir = join(outputDir, "example.com");
  const rootContents = await readdir(hostDir);
  t.deepEqual([...rootContents].sort(), ["about.md", "index.md"]);

  const home = await readFile(join(hostDir, "index.md"), "utf8");
  t.true(home.includes("# Welcome"));
  t.true(home.includes("About"));

  const about = await readFile(join(hostDir, "about.md"), "utf8");
  t.true(about.includes("## About Us"));
  t.true(about.includes("We build things."));
});

test("skips disallowed paths from robots.txt", async (t: ExecutionContext) => {
  const responses: readonly ResponseEntry[] = [
    [
      "https://example.com/robots.txt",
      createResponse("User-agent: *\nDisallow: /private"),
    ],
    [
      "https://example.com/",
      createResponse(
        '<html><body><a href="/private">Secret</a><p>Public</p></body></html>',
      ),
    ],
    [
      "https://example.com/private",
      createResponse("<html><body>Top secret</body></html>"),
    ],
  ];

  const { outputDir, run } = await setupCrawler(responses, { maxDepth: 1 });
  await run();

  const hostDir = join(outputDir, "example.com");
  const files = await readdir(hostDir);
  t.deepEqual(files, ["index.md"]);

  const stats = await stat(join(hostDir, "index.md"));
  t.true(stats.size > 0);
});

test("reuses robots.txt fetches per origin", async (t: ExecutionContext) => {
  const responses: readonly ResponseEntry[] = [
    [
      "https://example.com/",
      createResponse(
        '<html><body><a href="/about">About</a><p>Public</p></body></html>',
      ),
    ],
    [
      "https://example.com/about",
      createResponse("<html><body>About page</body></html>"),
    ],
  ];

  const outputDir = await mkTmpDir();
  const responseMap: ReadonlyMap<string, Response> = new Map(responses);
  // eslint-disable-next-line functional/no-let
  let robotsRequests = 0;

  const fetchStub: typeof fetch = async (input) => {
    const url = requestToUrl(input);
    if (url === "https://example.com/robots.txt") {
      robotsRequests += 1;
      return new Response("User-agent: *\nAllow: /", {
        headers: { "content-type": "text/plain" },
      });
    }
    const response = responseMap.get(url);
    if (!response) {
      throw new Error(`unexpected fetch ${url}`);
    }
    return response.clone();
  };

  const crawler = new WebCrawler({
    seeds: ["https://example.com/"],
    outputDir,
    maxDepth: 2,
    fetch: fetchStub,
  });

  await crawler.crawl();

  t.is(robotsRequests, 1);
});

test("does not share robots.txt caches across origins", async (t: ExecutionContext) => {
  const responseMap: ReadonlyMap<string, Response> = new Map([
    [
      "https://example.com/",
      createResponse('<html><body><a href="/about">About</a></body></html>'),
    ],
    [
      "https://example.com/about",
      createResponse("<html><body>About https</body></html>"),
    ],
    [
      "http://example.com/",
      createResponse('<html><body><a href="/info">Info</a></body></html>'),
    ],
    [
      "http://example.com/info",
      createResponse("<html><body>Info http</body></html>"),
    ],
  ]);
  const robotsCounts = new Map<string, number>([
    ["https://example.com/robots.txt", 0],
    ["http://example.com/robots.txt", 0],
  ]);
  const baseFetch = createFetchStub(responseMap);

  const fetchStub: typeof fetch = async (input) => {
    const url = requestToUrl(input);
    const count = robotsCounts.get(url);
    if (typeof count === "number") {
      // eslint-disable-next-line functional/immutable-data
      robotsCounts.set(url, count + 1);
      return new Response("User-agent: *\\nAllow: /", {
        headers: { "content-type": "text/plain" },
      });
    }
    return baseFetch(input as FetchInput);
  };

  const crawler = new WebCrawler({
    seeds: ["https://example.com/", "http://example.com/"],
    outputDir: await mkTmpDir(),
    maxDepth: 1,
    fetch: fetchStub,
  });

  await crawler.crawl();

  t.deepEqual([...robotsCounts.values()], [1, 1]);
});

test("shouldContinue guard stops crawl", async (t: ExecutionContext) => {
  const fetchStub: typeof fetch = async () => {
    throw new Error("fetch should not be called when crawl is cancelled");
  };

  const crawler = new WebCrawler({
    seeds: ["https://example.com/"],
    outputDir: await mkTmpDir(),
    shouldContinue: () => false,
    fetch: fetchStub,
  });

  await crawler.crawl();

  t.pass();
});

const setupCrawler = async (
  responses: readonly ResponseEntry[],
  options: SetupOptions = {},
) => {
  const outputDir = await mkTmpDir();
  const responseMap: ReadonlyMap<string, Response> = new Map(responses);
  const config: CrawlConfig = {
    seeds: options.seeds ?? ["https://example.com/"],
    outputDir,
    maxDepth: options.maxDepth ?? 2,
    fetch: createFetchStub(responseMap),
  };
  const crawler = new WebCrawler(config);
  return { outputDir, run: () => crawler.crawl() } as const;
};

const createFetchStub =
  (responses: ReadonlyMap<string, Response>): typeof fetch =>
  async (input: DeepReadonly<FetchInput>) => {
    const url = requestToUrl(input);
    const response = responses.get(url);
    if (!response) {
      throw new Error(`unexpected fetch ${url}`);
    }
    return response.clone();
  };

const createResponse = (body: string, status = 200): Response =>
  new Response(body, {
    status,
    headers: { "content-type": "text/html" },
  });

const mkTmpDir = async () => mkdtemp(join(tmpdir(), "webcrawler-"));

const requestToUrl = (input: DeepReadonly<FetchInput>): string => {
  if (typeof input === "string") {
    return input;
  }
  if (input instanceof URL) {
    return input.toString();
  }
  if (typeof input === "object" && input !== null && "url" in input) {
    const value = (input as { readonly url: string }).url;
    return value;
  }
  throw new Error("unsupported fetch input for test stub");
};

/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types, functional/prefer-immutable-types */
