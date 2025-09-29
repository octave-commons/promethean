import { readFile } from "node:fs/promises";

import edn from "jsedn";

type UnknownRecord = Record<string, unknown>;

export async function loadEdnFile(filePath: string): Promise<unknown> {
  const content = await readFile(filePath, "utf8");
  return normalize(edn.toJS(edn.parse(content)));
}

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalize(item));
  }
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== "object") {
    return value;
  }

  return Object.entries(value as UnknownRecord).reduce<UnknownRecord>(
    (accumulator, [rawKey, rawValue]) => ({
      ...accumulator,
      [rawKey.startsWith(":") ? rawKey.slice(1) : rawKey]: normalize(rawValue),
    }),
    {},
  );
}
