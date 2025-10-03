export function sanitizeHeaderValue(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  return value
    .replace(/(Authorization\s*:\s*Bearer\s+)[^,;\s]+/gi, "$1[redacted]")
    .replace(/(token\s*[=:]\s*)([A-Za-z0-9._-]+)/gi, "$1[redacted]")
    .replace(/\b(gh[oprsu]_[A-Za-z0-9]{10,})/gi, "[redacted]");
}

export function sanitizeHeaders(
  headers: Readonly<Record<string, unknown>> | undefined,
): Record<string, unknown> {
  return Object.entries(headers ?? {}).reduce<Record<string, unknown>>(
    (acc, [key, value]) => ({
      ...acc,
      [key]:
        /authorization/i.test(key) || /token/i.test(key)
          ? "[redacted]"
          : sanitizeHeaderValue(value),
    }),
    {},
  );
}

export function sanitizeForLog<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }
  if (typeof input === "string") {
    return sanitizeHeaderValue(input) as T;
  }
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeForLog(item)) as unknown as T;
  }
  if (typeof input === "object") {
    const entries = Object.entries(input as Record<string, unknown>);
    return entries.reduce<Record<string, unknown>>((acc, [key, value]) => {
      if (/authorization/i.test(key) || /token/i.test(key)) {
        return { ...acc, [key]: "[redacted]" };
      }
      if (key === "headers" && value && typeof value === "object") {
        return {
          ...acc,
          [key]: sanitizeHeaders(value as Record<string, unknown>),
        };
      }
      return { ...acc, [key]: sanitizeForLog(value) };
    }, {}) as T;
  }
  return input;
}
