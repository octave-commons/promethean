import test from "ava";

import {
  getFiles,
  readFileText,
  searchSemantic,
  getStatus,
} from "../../frontend/docops/api.js";

function okJson(data: any, init: any = {}) {
  return {
    ok: true,
    status: init.status || 200,
    statusText: init.statusText || "OK",
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as any;
}

test("getFiles builds correct query and no-store cache", async (t) => {
  let called = 0;
  (globalThis as any).fetch = async (url: string, init: any) => {
    called++;
    t.true(String(url).startsWith("/api/files?"));
    const u = new URL("http://x" + String(url));
    t.is(u.searchParams.get("dir"), "/docs");
    t.is(u.searchParams.get("maxDepth"), "3");
    t.is(u.searchParams.get("maxEntries"), "123");
    t.is(u.searchParams.get("exts"), ".md,.txt");
    t.is(u.searchParams.get("includeMeta"), "1");
    t.truthy(init);
    t.is(init.cache, "no-store");
    return okJson({ dir: "/docs", tree: [] });
  };
  const out = await getFiles("/docs", {
    maxDepth: 3,
    maxEntries: 123,
    exts: ".md,.txt",
    includeMeta: true,
  });
  t.deepEqual(out, { dir: "/docs", tree: [] });
  t.is(called, 1);
});

test.serial("readFileText returns raw text and surfaces errors", async (t) => {
  const dir = "/d";
  const file = "/d/a.md";
  let urls: string[] = [];
  (globalThis as any).fetch = async (url: string) => {
    const s = String(url);
    urls.push(s);
    if (s.includes("good.md")) {
      return { ok: true, text: async () => "# ok" } as any;
    }
    if (s.startsWith("/api/read?")) {
      return {
        ok: false,
        statusText: "Bad",
        json: async () => ({ error: "boom" }),
      } as any;
    }
    // tolerate unrelated concurrent calls
    return {
      ok: true,
      json: async () => ({ ok: true }),
      text: async () => "",
    } as any;
  };
  const ok = await readFileText(dir, "/d/good.md");
  t.is(ok, "# ok");
  await t.throwsAsync(() => readFileText(dir, file), { message: /boom|Bad/ });
  t.true(urls[0]!.startsWith("/api/read?"));
});

test("searchSemantic encodes parameters", async (t) => {
  (globalThis as any).fetch = async (url: string) => {
    const u = new URL("http://x" + String(url));
    t.is(u.pathname, "/api/search");
    t.is(u.searchParams.get("q"), "hello");
    t.is(u.searchParams.get("collection"), "docs");
    t.is(u.searchParams.get("k"), "5");
    return okJson({ items: [] });
  };
  const res = await searchSemantic("hello", "docs", 5);
  t.deepEqual(res, { items: [] });
});

test.serial("getStatus sets no-store and paginates", async (t) => {
  (globalThis as any).fetch = async (url: string, init: any) => {
    const u = new URL("http://x" + String(url));
    if (u.pathname === "/api/status") {
      t.is(u.searchParams.get("dir"), "/x");
      t.is(u.searchParams.get("limit"), "50");
      t.is(u.searchParams.get("page"), "2");
      t.is(u.searchParams.get("onlyIncomplete"), "1");
      t.truthy(init);
      t.is(init.cache, "no-store");
      return okJson({ items: [], page: 2, hasMore: false, total: 0 });
    }
    // tolerate unrelated concurrent calls
    return okJson({ ok: true });
  };
  const res = await getStatus("/x", {
    limit: 50,
    page: 2,
    onlyIncomplete: true,
  });
  t.deepEqual(res, { items: [], page: 2, hasMore: false, total: 0 });
});
