import { load } from "cheerio";

import { canonicalUrl, isUrlAllowed } from "./url.js";

export type CrawlResult = {
  url: string;
  title: string | null;
  links: string[];
};

export async function crawlPage(
  url: string,
  fetchFn: typeof fetch = fetch,
): Promise<CrawlResult> {
  const normalized = canonicalUrl(url);
  if (!normalized) {
    throw new Error("invalid url");
  }
  if (!isUrlAllowed(normalized)) {
    throw new Error("url not allowed");
  }
  const res = await fetchFn(normalized);
  if (!res.ok) {
    throw new Error(`fetch failed: ${res.status} ${res.statusText}`);
  }
  const html = await res.text();
  const $ = load(html);
  const title = $("title").text() || null;
  const links = $("a[href]")
    .map((_, el) => {
      const href = $(el).attr("href");
      if (!href) return null;
      try {
        const abs = new URL(href, normalized).toString();
        const canon = canonicalUrl(abs);
        return canon && isUrlAllowed(canon) ? canon : null;
      } catch {
        return null;
      }
    })
    .get()
    .filter((l): l is string => Boolean(l));
  return { url: normalized, title, links };
}
