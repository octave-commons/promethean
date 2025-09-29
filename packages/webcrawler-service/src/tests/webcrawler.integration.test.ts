/* eslint-disable functional/no-let, functional/immutable-data, @typescript-eslint/prefer-readonly-parameter-types */
import { createServer } from "node:http";
import { mkdtemp, readdir, readFile } from "node:fs/promises";
import { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";

import test from "ava";

import { WebCrawler } from "../webcrawler.js";

type RouteResponse = {
  readonly status?: number;
  readonly headers?: Record<string, string>;
  readonly body: string;
};

type TestServer = {
  readonly baseUrl: string;
  setRoute: (path: string, response: RouteResponse) => void;
  close: () => Promise<void>;
};

const allowRobots: RouteResponse = {
  status: 200,
  headers: { "content-type": "text/plain" },
  body: "User-agent: *\nAllow: /",
};

const createTestServer = async (): Promise<TestServer> => {
  let routes = new Map<string, RouteResponse>();
  const server = createServer((req, res) => {
    const url = req.url ?? "/";
    const pathname = url.split("?")[0] ?? "/";
    const route = routes.get(pathname);
    if (!route) {
      res.statusCode = 404;
      res.end("Not Found");
      return;
    }
    const status = route.status ?? 200;
    res.statusCode = status;
    const headers = route.headers ?? { "content-type": "text/html" };
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    res.end(route.body);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const setRoute = (path: string, response: RouteResponse) => {
    const retained = [...routes.entries()].filter(([key]) => key !== path);
    routes = new Map([...retained, [path, response]]);
  };

  const close = async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  };

  return { baseUrl, setRoute, close };
};

const mkOutputDir = () => mkdtemp(join(tmpdir(), "webcrawler-integration-"));

const applyRoutes = (
  target: TestServer,
  routes: ReadonlyArray<[string, RouteResponse]>,
) => {
  routes.forEach(([path, response]) => target.setRoute(path, response));
};

const configureLinkedServers = async () => {
  const serverB = await createTestServer();
  const serverA = await createTestServer();

  const serverAHome = `${serverA.baseUrl}/`;
  const serverBPage = `${serverB.baseUrl}/page`;

  applyRoutes(serverA, [
    ["/robots.txt", allowRobots],
    [
      "/",
      {
        body: `<html><body><h1>Server A</h1><a href="${serverBPage}">Go to B</a></body></html>`,
      },
    ],
  ]);

  applyRoutes(serverB, [
    ["/robots.txt", allowRobots],
    [
      "/page",
      {
        body: `<html><body><h1>Server B</h1><a href="${serverAHome}">Back to A</a></body></html>`,
      },
    ],
  ]);

  return { serverA, serverB, serverAHome, serverBPage } as const;
};

const runLinkedServersScenario = async () => {
  const { serverA, serverB, serverAHome, serverBPage } =
    await configureLinkedServers();

  const outputDir = await mkOutputDir();
  const crawler = new WebCrawler({
    seeds: [serverAHome],
    outputDir,
    includeExternal: true,
    requestDelayMs: 0,
  });

  await crawler.crawl();

  const hostDir = join(outputDir, new URL(serverAHome).hostname.toLowerCase());
  const files = await readdir(hostDir);
  const readMarkdown = (name: string) => readFile(join(hostDir, name), "utf8");

  const cleanup = async () => {
    await serverA.close();
    await serverB.close();
  };

  return {
    hostDir,
    files,
    readMarkdown,
    serverAHome,
    serverBPage,
    cleanup,
  } as const;
};

const buildRobotsRoutes = (): ReadonlyArray<[string, RouteResponse]> => {
  return [
    [
      "/robots.txt",
      {
        status: 200,
        headers: { "content-type": "text/plain" },
        body: "User-agent: *\nDisallow: /private\nAllow: /public",
      },
    ],
    [
      "/",
      {
        body: `<html><body><h1>Index</h1><a href="/private">Secret</a><a href="/public">Public</a></body></html>`,
      },
    ],
    [
      "/public",
      {
        body: `<html><body><h2>Public Page</h2><p>Visible content</p></body></html>`,
      },
    ],
    [
      "/private",
      {
        body: `<html><body><h2>Private Page</h2><p>Hidden</p></body></html>`,
      },
    ],
  ];
};

const configureRobotsServer = async () => {
  const server = await createTestServer();
  const homeUrl = `${server.baseUrl}/`;
  applyRoutes(server, buildRobotsRoutes());
  return { server, homeUrl } as const;
};

const runRobotsScenario = async () => {
  const { server, homeUrl } = await configureRobotsServer();
  const outputDir = await mkOutputDir();
  await new WebCrawler({
    seeds: [homeUrl],
    outputDir,
    requestDelayMs: 0,
  }).crawl();

  const hostDir = join(outputDir, new URL(homeUrl).hostname.toLowerCase());
  const files = await readdir(hostDir);
  const readMarkdown = (name: string) => readFile(join(hostDir, name), "utf8");

  const cleanup = async () => {
    await server.close();
  };

  return { hostDir, files, readMarkdown, cleanup } as const;
};

test("crawler navigates across multiple hosts", async (t) => {
  const scenario = await runLinkedServersScenario();

  t.teardown(scenario.cleanup);

  const sortedFiles = [...scenario.files].sort();
  t.deepEqual(sortedFiles, ["index.md", "page.md"]);

  const aMarkdown = await scenario.readMarkdown("index.md");
  const bMarkdown = await scenario.readMarkdown("page.md");

  t.true(aMarkdown.includes("Server A"));
  t.true(aMarkdown.includes(scenario.serverBPage));
  t.true(bMarkdown.includes("Server B"));
  t.true(bMarkdown.includes(scenario.serverAHome));
});

test("crawler respects robots disallow directives", async (t) => {
  const scenario = await runRobotsScenario();

  t.teardown(scenario.cleanup);

  const sorted = [...scenario.files].sort();
  t.deepEqual(sorted, ["index.md", "public.md"]);

  const indexMarkdown = await scenario.readMarkdown("index.md");
  const publicMarkdown = await scenario.readMarkdown("public.md");

  t.true(indexMarkdown.includes("Index"));
  t.true(publicMarkdown.includes("Public Page"));
  t.false(publicMarkdown.includes("Hidden"));
});

/* eslint-enable functional/no-let, functional/immutable-data, @typescript-eslint/prefer-readonly-parameter-types */
