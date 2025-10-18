import { readFile } from 'node:fs/promises';

import edn from 'jsedn';

type UnknownRecord = Record<string, unknown>;

/**
 * Loads and parses an EDN file into a JavaScript object.
 *
 * This function reads an EDN file, parses it using the jsedn library,
 * and normalizes the result by:
 * - Converting EDN keywords (starting with ':') to regular strings
 * - Recursively processing nested objects and arrays
 * - Preserving null values as null
 *
 * @param filePath - Absolute path to the EDN file
 * @returns Promise resolving to parsed and normalized JavaScript object
 *
 * @throws {Error} When file cannot be read
 * @throws {Error} When EDN syntax is invalid
 *
 * @example
 * ```typescript
 * // Given EDN file content: {:name "app" :version "1.0"}
 * const result = await loadEdnFile('./config.edn');
 * // Result: { name: "app", version: "1.0" }
 * ```
 */
export async function loadEdnFile(filePath: string): Promise<unknown> {
  try {
    const content = await readFile(filePath, 'utf8');
    return normalize(edn.toJS(edn.parse(content)));
  } catch (e) {
    throw new Error(`Failed to parse EDN file at ${filePath}: ${(e as Error).message}`);
  }
}

/**
 * Normalizes EDN-parsed values by converting keywords to strings.
 *
 * This function recursively processes the parsed EDN data structure:
 * - Objects: Converts keys starting with ':' to strings without the colon
 * - Arrays: Recursively processes each element
 * - Primitives: Returns as-is
 * - null/undefined: Returns null
 *
 * @param value - Value to normalize (from EDN parser)
 * @returns Normalized JavaScript value
 *
 * @example
 * ```typescript
 * normalize({ ':name': 'app', ':config': { ':port': 3000 } });
 * // Returns: { name: 'app', config: { port: 3000 } }
 * ```
 */
function normalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalize(item));
  }
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== 'object') {
    return value;
  }

  return Object.entries(value as UnknownRecord).reduce<UnknownRecord>(
    (accumulator, [rawKey, rawValue]) => ({
      ...accumulator,
      [rawKey.startsWith(':') ? rawKey.slice(1) : rawKey]: normalize(rawValue),
    }),
    {},
  );
}
