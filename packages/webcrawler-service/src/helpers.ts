import { canonicalUrl } from "@promethean/web-utils";

type QueueState = {
  readonly queueLength: number;
  readonly processed: number;
  readonly maxPages: number;
};

// eslint-disable-next-line functional/prefer-immutable-types
const tryParseUrl = (value: string, base?: string): URL | null => {
  // eslint-disable-next-line functional/no-try-statements
  try {
    return base === undefined ? new URL(value) : new URL(value, base);
  } catch {
    return null;
  }
};

const shouldStop = ({
  queueLength,
  processed,
  maxPages,
}: QueueState): boolean => queueLength === 0 || processed >= maxPages;

const dedupeStrings = (input: readonly string[]): readonly string[] =>
  input.reduce<readonly string[]>(
    (acc, value) => (acc.includes(value) ? acc : [...acc, value]),
    [],
  );

const appendUnique = (
  input: readonly string[],
  value: string,
): readonly string[] => (input.includes(value) ? input : [...input, value]);

const appendManyUnique = (
  input: readonly string[],
  values: readonly string[],
): readonly string[] =>
  values.reduce<readonly string[]>(
    (acc, value) => appendUnique(acc, value),
    input,
  );

const hostIsAllowed = (
  allowedHosts: readonly string[],
  url: string,
): boolean => {
  if (allowedHosts.length === 0) {
    return true;
  }
  const parsed = tryParseUrl(url);
  if (!parsed) {
    return false;
  }
  return allowedHosts.includes(parsed.host);
};

const canonicalHttpUrl = (input: string): string | null => {
  const parsed = tryParseUrl(input);
  if (!parsed) {
    return null;
  }
  if (!isHttpProtocol(parsed.protocol)) {
    return null;
  }
  return canonicalUrl(parsed.toString());
};

const resolveHttpHref = (baseUrl: string, href: string): string | null => {
  const resolved = tryParseUrl(href, baseUrl);
  if (!resolved) {
    return null;
  }
  if (!isHttpProtocol(resolved.protocol)) {
    return null;
  }
  return canonicalUrl(resolved.toString());
};

const hostToDirectory = (hostname: string): string =>
  hostname.toLowerCase().replace(/^\.+/, "").replace(/\.+$/, "") || "host";

const sanitizeSegment = (segment: string): string =>
  segment
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "") || "index";

const determineFileSegment = (
  pathname: string,
  segments: readonly string[],
): string => {
  const last = segments[segments.length - 1] ?? "";
  return last === "" || pathname.endsWith("/")
    ? "index"
    : sanitizeSegment(last);
};

const isHttpProtocol = (protocol: string): boolean =>
  protocol === "http:" || protocol === "https:";

export {
  appendManyUnique,
  appendUnique,
  dedupeStrings,
  determineFileSegment,
  hostIsAllowed,
  hostToDirectory,
  canonicalHttpUrl,
  resolveHttpHref,
  sanitizeSegment,
  shouldStop,
};
