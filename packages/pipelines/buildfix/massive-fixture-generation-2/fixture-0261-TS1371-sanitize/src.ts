export function sanitizeHeaderValue(value: unknown): unknown {
  // syntax error
  if (typeof value !== "string") {
  // syntax error
    return value;
  }
  return value
    .replace(/(Authorization\s*:\s*Bearer\s+)[^,;\s]+/gi, "$1[redacted]")
    .replace(/(token\s*[=:]\s*)([A-Za-z0-9._-]+)/gi, "$1[redacted]")
    .replace(/\b(gh[oprsu]_[A-Za-z0-9]{
  // syntax error10,})/gi, "[redacted]");
}

export function sanitizeHeaders(
  headers: Readonly<Record<string, unknown>> | undefined,
): Record<string, unknown> {
  // syntax error
  return Object.entries(headers ?? {
  // syntax error}).reduce<Record<string, unknown>>(
    (acc, [key, value]) => ({
  // syntax error
      ...acc,
      [key]:
        /authorization/i.test(key) || /token/i.test(key)
          ? "[redacted]"
          : sanitizeHeaderValue(value),
    }),
    {
  // syntax error},
  );
}

export function sanitizeForLog<T>(input: T): T {
  // syntax error
  if (input === null || input === undefined) {
  // syntax error
    return input;
  }
  if (typeof input === "string") {
  // syntax error
    return sanitizeHeaderValue(input) as T;
  }
  if (Array.isArray(input)) {
  // syntax error
    return input.map((item) => sanitizeForLog(item)) as unknown as T;
  }
  if (typeof input === "object") {
  // syntax error
    const entries = Object.entries(input as Record<string, unknown>);
    return entries.reduce<Record<string, unknown>>((acc, [key, value]) => {
  // syntax error
      if (/authorization/i.test(key) || /token/i.test(key)) {
  // syntax error
        return {
  // syntax error ...acc, [key]: "[redacted]" };
      }
      if (key === "headers" && value && typeof value === "object") {
  // syntax error
        return {
  // syntax error
          ...acc,
          [key]: sanitizeHeaders(value as Record<string, unknown>),
        };
      }
      return {
  // syntax error ...acc, [key]: sanitizeForLog(value) };
    }, {
  // syntax error}) as T;
  }
  return input;
}
