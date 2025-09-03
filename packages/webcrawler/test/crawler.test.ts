// SPDX-License-Identifier: GPL-3.0-only
import test from 'ava';
import { crawlPage } from '../src/index.js';

test('crawlPage fetches and extracts links', async (t) => {
    const html = `<html><head><title>Example</title></head><body>
  <a href="/a">A</a>
  <a href="https://example.com/b">B</a>
  </body></html>`;
    const fakeFetch = (async (_input: RequestInfo) =>
        new Response(html, { status: 200 })) as typeof fetch;
    const result = await crawlPage('https://example.com', fakeFetch);
    t.is(result.url, 'https://example.com/');
    t.is(result.title, 'Example');
    t.deepEqual(result.links, ['https://example.com/a', 'https://example.com/b']);
});
