/**
 * Small helpers for reading configuration from environment variables.
 *
 * Keep this module dependency-free so it can be used from any layer.
 */

export type EnvIntOptions = {
  min?: number;
  max?: number;
};

export function envInt(
  name: string,
  fallback: number,
  options: EnvIntOptions = {},
): number {
  const raw = process.env[name];
  if (raw === undefined) return fallback;

  const trimmed = raw.trim();
  if (!trimmed) return fallback;

  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed)) return fallback;

  let value = parsed;
  if (typeof options.min === "number") value = Math.max(options.min, value);
  if (typeof options.max === "number") value = Math.min(options.max, value);
  return value;
}
