import test from "ava";

// Import the module under test (pure fetch helpers)
import {
  getConfig,
  getDocs,
  getFiles,
  readFileText,
  getChunks,
  getChunkHits,
  searchSemantic,
  getStatus,
} from "../ui/js/api.js";

// Minimal Response stub
function okJson(data, init = {}) {
  return {
    ok: true,
    status: init.status || 200,
    statusText: init.statusText || "OK",
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

test("getFiles builds correct query and no-store cache", async (t) => {
  let called = 0;
  global.fetch = async (url, init) => {
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

test("readFileText returns raw text and surfaces errors", async (t) => {
  const dir = "/d";
  const file = "/d/a.md";
  let urls = [];
  global.fetch = async (url) => {
    urls.push(String(url));
    if (String(url).includes("good.md")) {
      return { ok: true, text: async () => "# ok" };
    }
    return {
      ok: false,
      statusText: "Bad",
      json: async () => ({ error: "boom" }),
    };
  };
  const ok = await readFileText(dir, "/d/good.md");
  t.is(ok, "# ok");
  await t.throwsAsync(() => readFileText(dir, file), { message: /boom|Bad/ });
  t.true(urls[0].startsWith("/api/read?"));
});

test("searchSemantic encodes parameters", async (t) => {
  global.fetch = async (url) => {
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

test("getStatus sets no-store and paginates", async (t) => {
  global.fetch = async (url, init) => {
    const u = new URL("http://x" + String(url));
    t.is(u.pathname, "/api/status");
    t.is(u.searchParams.get("dir"), "/x");
    t.is(u.searchParams.get("limit"), "50");
    t.is(u.searchParams.get("page"), "2");
    t.is(u.searchParams.get("onlyIncomplete"), "1");
    t.is(init.cache, "no-store");
    return okJson({ items: [], page: 2, hasMore: false, total: 0 });
  };
  const res = await getStatus("/x", {
    limit: 50,
    page: 2,
    onlyIncomplete: true,
  });
  t.deepEqual(res, { items: [], page: 2, hasMore: false, total: 0 });
});
