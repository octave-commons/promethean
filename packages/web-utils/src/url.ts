import { createHash } from 'crypto';
import { domainToASCII } from 'url';

export type UrlProtocol =
  | 'http:'
  | 'https:'
  | 'mailto:'
  | 'javascript:'
  | 'data:'
  | 'file:'
  | 'tel:';
export type TrackingParam = 'utm_' | 'fbclid' | 'gclid' | 'ref' | 'referrer';
export type QueryParamEntry = [string, string];
export type SortedQueryParams = QueryParamEntry[];

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

  // Create a new URL object with modified properties
  const protocol = url.protocol.toLowerCase();
  const hostname = domainToASCII(url.hostname).toLowerCase();

  // Handle port removal for default ports
  const port =
    (protocol === 'http:' && url.port === '80') || (protocol === 'https:' && url.port === '443')
      ? ''
      : url.port;

  // Process and sort query parameters
  const params = new URLSearchParams(url.search);
  const sortedParams = Array.from(params.entries())
    .filter(([k]) => !/^(utm_|fbclid|gclid|ref|referrer)/i.test(k))
    .sort(([aK, aV], [bK, bV]) => (aK === bK ? aV.localeCompare(bV) : aK.localeCompare(bK)));

  const search = sortedParams.length > 0 ? `?${new URLSearchParams(sortedParams).toString()}` : '';

  // Normalize pathname
  const normalizedPathname = url.pathname.replace(/\/+/g, '/');
  const pathname =
    normalizedPathname !== '/' && normalizedPathname.endsWith('/')
      ? normalizedPathname.slice(0, -1)
      : normalizedPathname;

  // Construct the final URL without mutations
  const finalUrl = `${protocol}//${hostname}${port ? ':' + port : ''}${pathname}${search}`;

  return finalUrl;
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

export type UrlValidationResult = {
  readonly isValid: boolean;
  readonly normalizedUrl?: string;
  readonly error?: string;
};

export const DEFAULT_DENY_PATTERNS = [
  /^mailto:/i,
  /^javascript:/i,
  /^data:/i,
  /^file:/i,
  /^tel:/i,
] as const satisfies readonly RegExp[];
