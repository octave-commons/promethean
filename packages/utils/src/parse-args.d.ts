/**
 * Minimal CLI argument parser.
 */
/**
 * Parse command-line arguments using provided defaults.
 *
 * @typeParam T - Map of flag names to their default value types.
 * @param defaults - Expected flags with their default values.
 * @param argv - Arguments to parse, defaulting to `process.argv.slice(2)`.
 * @returns An object with the same keys as `defaults`; boolean defaults yield
 * booleans, others yield strings.
 */
export function parseArgs<T extends Record<string, string | boolean>>(
  defaults: Readonly<T>,
  argv?: ReadonlyArray<string>,
): { [K in keyof T]: T[K] extends boolean ? boolean : string };
