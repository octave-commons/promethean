import * as path from "node:path";

const globSpecials = /[\\^$.*+?()[\]{}|]/g;

export const toPosixPath = (value: string) => value.split(path.sep).join("/");

const DEFAULT_LIMITS = {
  maxLength: 1000,
  maxCompiled: 500,
} as const;

type Limits = {
  maxLength: number;
  maxCompiled: number;
};

const escapeRegExp = (value: string) => value.replace(globSpecials, "\\$&");

function normalizePattern(value: string): string {
  return toPosixPath(value.trim());
}

function findFirstBraceSegment(pattern: string): {
  start: number;
  end: number;
} | null {
  let depth = 0;
  let start = -1;
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    if (ch === "\\") {
      i += 1;
      continue;
    }
    if (ch === "{" && depth === 0) {
      start = i;
      depth = 1;
      continue;
    }
    if (ch === "{" && depth > 0) {
      depth += 1;
      continue;
    }
    if (ch === "}" && depth > 0) {
      depth -= 1;
      if (depth === 0) {
        return { start, end: i };
      }
    }
  }
  return null;
}

export function expandBraces(pattern: string): string[] {
  const segment = findFirstBraceSegment(pattern);
  if (!segment) {
    return [pattern];
  }
  const { start, end } = segment;
  const body = pattern.slice(start + 1, end);
  if (!body.includes(",")) {
    return [pattern];
  }
  const before = pattern.slice(0, start);
  const after = pattern.slice(end + 1);
  return body
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .flatMap((value) => expandBraces(`${before}${value}${after}`));
}

function globToRegExp(pattern: string): RegExp {
  const normalized = toPosixPath(pattern);
  let regex = "";
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i] ?? "";
    if (char === "*") {
      if (normalized[i + 1] === "*") {
        if (normalized[i + 2] === "/") {
          regex += "(?:.*/)?";
          i += 2;
        } else {
          regex += ".*";
          i += 1;
        }
      } else {
        regex += "[^/]*";
      }
      continue;
    }
    if (char === "?") {
      regex += "[^/]";
      continue;
    }
    regex += escapeRegExp(char);
  }
  return new RegExp(`^${regex}$`);
}

function expandedWithLimits(
  patterns: readonly string[],
  limits: Limits,
): string[] {
  const expanded: string[] = [];
  for (const raw of patterns) {
    if (!raw) continue;
    const normalized = normalizePattern(raw);
    if (!normalized) continue;
    if (normalized.length > limits.maxLength) {
      throw new Error(
        `Glob pattern exceeds maximum length of ${limits.maxLength} characters`,
      );
    }
    const segments = expandBraces(normalized);
    for (const segment of segments) {
      expanded.push(segment);
      if (expanded.length > limits.maxCompiled) {
        throw new Error(
          `Too many glob patterns (max ${limits.maxCompiled} allowed)`,
        );
      }
    }
  }
  return expanded;
}

export function createInclusionChecker(
  patterns: readonly string[],
  overrides: Partial<Limits> = {},
): (relPath: string) => boolean {
  if (!patterns.length) {
    return () => true;
  }
  const limits: Limits = {
    maxLength: overrides.maxLength ?? DEFAULT_LIMITS.maxLength,
    maxCompiled: overrides.maxCompiled ?? DEFAULT_LIMITS.maxCompiled,
  };
  const expanded = expandedWithLimits(patterns, limits);
  if (!expanded.length) {
    return () => true;
  }
  const regexes = expanded.map(globToRegExp);
  return (relPath: string) => {
    const normalized = toPosixPath(relPath);
    return regexes.some((rx) => rx.test(normalized));
  };
}

export function deriveExtensions(
  patterns: readonly string[],
  options: Readonly<{
    fallback?: Set<string>;
    limits?: Partial<Limits>;
  }> = {},
): Set<string> | undefined {
  if (!patterns.length) {
    return options.fallback;
  }
  const limits: Limits = {
    maxLength: options.limits?.maxLength ?? DEFAULT_LIMITS.maxLength,
    maxCompiled: options.limits?.maxCompiled ?? DEFAULT_LIMITS.maxCompiled,
  };
  const expanded = expandedWithLimits(patterns, limits);
  const exts = new Set<string>();
  for (const pattern of expanded) {
    const normalized = toPosixPath(pattern);
    const lastSlash = normalized.lastIndexOf("/");
    const lastDot = normalized.lastIndexOf(".");
    if (lastDot <= lastSlash) {
      return options.fallback;
    }
    const candidate = normalized.slice(lastDot).toLowerCase();
    if (
      candidate.includes("*") ||
      candidate.includes("?") ||
      candidate.includes("[")
    ) {
      return options.fallback;
    }
    exts.add(candidate);
  }
  return exts.size > 0 ? exts : options.fallback;
}
