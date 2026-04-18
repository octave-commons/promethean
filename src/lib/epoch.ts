export function normalizeEpochMilliseconds(value: number | undefined): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  const normalized = Math.trunc(value);
  return normalized < 1_000_000_000_000 ? normalized * 1000 : normalized;
}
