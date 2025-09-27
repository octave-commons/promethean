import test from "ava";

import { crawlPage } from "../crawler.js";

test("crawlPage fetches and extracts links", async (t) => {
  const html = `<html><head><title>Example</title></head><body>
  <a href="/a">A</a>
  <a href="https://example.com/b">B</a>
  </body></html>`;
  const fakeFetch: typeof fetch = async () =>
    ({
      ok: true,
      status: 200,
      statusText: "OK",
      async text() {
        return html;
      },
    }) as Response;
  const result = await crawlPage("https://example.com", fakeFetch);
  t.is(result.url, "https://example.com/");
  t.is(result.title, "Example");
  t.deepEqual(result.links, ["https://example.com/a", "https://example.com/b"]);
});

test("crawlPage rejects invalid URLs with a friendly error", async (t) => {
  await t.throwsAsync(() => crawlPage("not-a-url"), { message: "invalid url" });
});
