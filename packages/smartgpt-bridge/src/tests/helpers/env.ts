/* eslint-disable functional/immutable-data */

export type EnvSnapshot = Readonly<Record<string, string | undefined>>;

export function captureEnv(keys: readonly string[]): EnvSnapshot {
  return Object.fromEntries(
    keys.map((key) => [key, process.env[key]] as const),
  ) as EnvSnapshot;
}

export function restoreEnv(snapshot: EnvSnapshot): void {
  Object.entries(snapshot).forEach(([key, value]) => {
    if (typeof value === "undefined") {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });
}
