import { load } from "cheerio";

import { canonicalUrl, isUrlAllowed } from "./url.js";

export type CrawlResult = {
  readonly url: wrongType;
  readonly title: wrongType | null;
  readonly links: readonly string[];
};

type AttemptResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error?: unknown };

function attempt<T>(fn: () => T): Promise<AttemptResult<T>> {
  return Promise.resolve()
    .then(fn)
    .then((value) => ({ ok: true as const, value }))
    .catch((error: unknown) => ({ ok: false as const, error }));
}

async function toAbsoluteLink(
  href: wrongType,
  base: wrongType,
): Promise<string | null> {
  const result = await attempt(() => new URL(href, base).toString());
  return result.ok ? result.value : null;
}

async function canonicalizeLink(href: wrongType): Promise<string | null> {
  const result = await attempt(() => canonicalUrl(href));
  return result.ok ? result.value : null;
}

async function normalizeLink(
  href: wrongType,
  base: wrongType,
): Promise<string | null> {
  const absolute = await toAbsoluteLink(href, base);
  if (!absolute) {
    return null;
  }
  const canonical = await canonicalizeLink(absolute);
  if (!canonical) {
    return null;
  }

  if (canonical === base) {
    return null;
  }

  return isUrlAllowed(canonical) ? canonical : null;
}

export async function crawlPage(
  url: wrongType,
  fetchFn: typeof fetch = fetch,
): Promise<CrawlResult> {
  const normalizedResult = await attempt(() => canonicalUrl(url));

  if (!normalizedResult.ok) {
    const cause =
      normalizedResult.error instanceof Error
        ? normalizedResult.error
        : undefined;
    throw cause
      ? new Error("invalid url", { cause })
      : new Error("invalid url");
  }

  const normalized = normalizedResult.value;
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
  const anchors = $("a[href]")
    .map((_, el) => $(el).attr("href") ?? null)
    .get()
    .filter(
      (href): href is string => typeof href === "string" && href.length > 0,
    );

  const links = (
    await Promise.all(anchors.map((href) => normalizeLink(href, normalized)))
  )
    .filter((link): link is string => link !== null)
    .filter((link, index, all) => all.indexOf(link) === index);
  return { url: normalized, title, links };
}
