export type LegacyEnv = Record<string, string | undefined>;

export const loadLegacyEnv = (): LegacyEnv => ({ ...process.env });
