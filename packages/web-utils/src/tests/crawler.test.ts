import test from "ava";

<<<<<<<< HEAD:packages/web-utils/src/tests/crawler.test.ts
import { crawlPage } from '../crawler.js';
========
import { crawlPage } from '../src/crawler.js';
>>>>>>>> origin/codex/create-web-utils-package-and-refactor-7ynlps:packages/web-utils/test/crawler.test.ts

test("crawlPage fetches and extracts links", async (t) => {
  const html = `<html><head><title>Example</title></head><body>
  <a href="/a">A</a>
  <a href="https://example.com/b">B</a>
  </body></html>`;
  const fakeFetch: typeof fetch = async () =>
    new Response(html, { status: 200 });
  const result = await crawlPage("https://example.com", fakeFetch);
  t.is(result.url, "https://example.com/");
  t.is(result.title, "Example");
  t.deepEqual(result.links, ["https://example.com/a", "https://example.com/b"]);
});
