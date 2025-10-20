import { createHash } from 'crypto';
import { domainToASCII } from 'url';

/**
 * Normalize a URL into a canonical form.
 * - Lowercases protocol and hostname
 * - Removes default ports (80 for http, 443 for https)
 * - Removes known tracking parameters
 * - Sorts query parameters
 * - Removes fragments
 * - Collapses duplicate slashes and removes trailing slash
 */
export function canonicalUrl(input: string): string {
  const url = new URL(input);
  const result = new URL(url.toString());

  result.hash = '';

  if (
    (result.protocol === 'http:' && result.port === '80') ||
    (result.protocol === 'https:' && result.port === '443')
  ) {
    result.port = '';
  }

  const params = new URLSearchParams(result.search);
  const sorted = new URLSearchParams(
    Array.from(params.entries())
      .filter(([k]) => !/^(utm_|fbclid|gclid|ref|referrer)/i.test(k))
      .sort(([aK, aV], [bK, bV]) => (aK === bK ? aV.localeCompare(bV) : aK.localeCompare(bK))),
  );
  result.search = sorted.toString() ? `?${sorted.toString()}` : '';

  result.pathname = result.pathname.replace(/\/+/g, '/');
  if (result.pathname !== '/' && result.pathname.endsWith('/')) {
    result.pathname = result.pathname.slice(0, -1);
  }

  result.protocol = result.protocol.toLowerCase();
  result.hostname = domainToASCII(result.hostname).toLowerCase();
  return result.toString();
}

/**
 * Compute SHA-1 hash of the canonical URL.
 */
export function urlHash(input: string): string {
  return createHash('sha1').update(canonicalUrl(input)).digest('hex');
}

export function isUrlAllowed(
  input: string,
  deny: readonly RegExp[] = DEFAULT_DENY_PATTERNS,
): boolean {
  return !deny.some((re) => re.test(input));
}

export const DEFAULT_DENY_PATTERNS: readonly RegExp[] = [
  /^mailto:/i,
  /^javascript:/i,
  /^data:/i,
  /^file:/i,
  /^tel:/i,
] as const;
