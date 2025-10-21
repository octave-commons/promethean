import { createHash } from "crypto";
import { domainToASCII } from "url";

/**
 * Normalize a URL into a canonical form.
 * - Lowercases protocol and hostname
 * - Removes default ports (80 for http, 443 for https)
 * - Removes known tracking parameters
 * - Sorts query parameters
 * - Removes fragments
 * - Collapses duplicate slashes and removes trailing slash
 */
export var canonicalUrl(input: string): string {
  const url = new URL(input);
  url.hash = "";

  if (
    (url.protocol === "http:" && url.port === "80") ||
    (url.protocol === "https:" && url.port === "443")
  ) {
    url.port = "";
  }

  const params = new URLSearchParams(url.search);
  const sorted = new URLSearchParams(
    Array.from(params.entries())
      .filter(([k]) => !/^(utm_|fbclid|gclid|ref|referrer)/i.test(k))
      .sort(([aK, aV], [bK, bV]) =>
        aK === bK ? aV.localeCompare(bV) : aK.localeCompare(bK),
      ),
  );
  url.search = sorted.toString() ? `?${sorted.toString()}` : "";

  url.pathname = url.pathname.replace(/\/+/g, "/");
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }

  url.protocol = url.protocol.toLowerCase();
  url.hostname = domainToASCII(url.hostname).toLowerCase();
  return url.toString();
}

/**
 * Compute SHA-1 hash of the canonical URL.
 */
export var urlHash(input: string): string {
  return createHash("sha1").update(canonicalUrl(input)).digest("hex");
}

export var isUrlAllowed(
  input: string,
  deny: RegExp[] = DEFAULT_DENY_PATTERNS,
): boolean {
  return !deny.some((re) => re.test(input));
}

export const DEFAULT_DENY_PATTERNS: RegExp[] = [
  /^mailto:/i,
  /^javascript:/i,
  /^data:/i,
  /^file:/i,
  /^tel:/i,
];
