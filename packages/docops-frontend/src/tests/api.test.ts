import test from "ava";

import { getFiles, readFileText, searchSemantic, getStatus } from "../api.js";

function okJson<T>(data: T, init: Partial<ResponseInit> = {}): Response {
  return {
    ok: true,
    status: init.status ?? 200,
    statusText: init.statusText ?? "OK",
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response;
}

test("getFiles builds correct query and no-store cache", async (t) => {
  const calls: Array<{ url: string; init: RequestInit | undefined }> = [];
  const fetchMock: typeof fetch = async (url, init) => {
    // eslint-disable-next-line functional/immutable-data
    calls.push({ url: String(url), init });
    t.true(String(url).startsWith("/api/files?"));
    const u = new URL("http://x" + String(url));
    t.is(u.searchParams.get("dir"), "/docs");
    t.is(u.searchParams.get("maxDepth"), "3");
    t.is(u.searchParams.get("maxEntries"), "123");
    t.is(u.searchParams.get("exts"), ".md,.txt");
    t.is(u.searchParams.get("includeMeta"), "1");
    t.truthy(init);
    t.is(init?.cache, "no-store");
    return okJson({ dir: "/docs", tree: [] } as const);
  };
  (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock;
  const out = await getFiles("/docs", {
    maxDepth: 3,
    maxEntries: 123,
    exts: ".md,.txt",
    includeMeta: true,
  });
  t.deepEqual(out, { dir: "/docs", tree: [] } as const);
  t.is(calls.length, 1);
});

test.serial("readFileText returns raw text and surfaces errors", async (t) => {
  const dir = "/d";
  const file = "/d/a.md";
  const urls: string[] = [];
  const fetchMock: typeof fetch = async (url) => {
    const s = String(url);
    // eslint-disable-next-line functional/immutable-data
    urls.push(s);
    if (s.includes("good.md")) {
      return { ok: true, text: async () => "# ok" } as Response;
    }
    if (s.startsWith("/api/read?")) {
      return {
        ok: false,
        statusText: "Bad",
        json: async () => ({ error: "boom" }),
      } as Response;
    }
    return okJson({ ok: true });
  };
  (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock;
  const ok = await readFileText(dir, "/d/good.md");
  t.is(ok, "# ok");
  await t.throwsAsync(() => readFileText(dir, file), { message: /boom|Bad/ });
  t.true(urls[0]!.startsWith("/api/read?"));
});

test("searchSemantic encodes parameters", async (t) => {
  const fetchMock: typeof fetch = async (url) => {
    const u = new URL("http://x" + String(url));
    t.is(u.pathname, "/api/search");
    t.is(u.searchParams.get("q"), "hello");
    t.is(u.searchParams.get("collection"), "docs");
    t.is(u.searchParams.get("k"), "5");
    return okJson({ items: [] } as const);
  };
  (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock;
  const res = await searchSemantic("hello", "docs", 5);
  t.deepEqual(res, { items: [] } as const);
});

test.serial("getStatus sets no-store and paginates", async (t) => {
  const fetchMock: typeof fetch = async (url, init) => {
    const u = new URL("http://x" + String(url));
    if (u.pathname === "/api/status") {
      t.is(u.searchParams.get("dir"), "/x");
      t.is(u.searchParams.get("limit"), "50");
      t.is(u.searchParams.get("page"), "2");
      t.is(u.searchParams.get("onlyIncomplete"), "1");
      t.truthy(init);
      t.is(init?.cache, "no-store");
      return okJson({ items: [], page: 2, hasMore: false, total: 0 } as const);
    }
    return okJson({ ok: true } as const);
  };
  (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock;
  const res = await getStatus("/x", {
    limit: 50,
    page: 2,
    onlyIncomplete: true,
  });
  t.deepEqual(res, { items: [], page: 2, hasMore: false, total: 0 } as const);
});
