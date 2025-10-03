export const parseBool = (value: unknown, defaultValue: boolean): boolean => {
  if (typeof value !== "string") {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return defaultValue;
};

export const readEnv = (key: string): string | undefined => {
  const env = (import.meta as ImportMeta & { env?: Record<string, unknown> })
    .env;
  const value = env?.[key];
  return typeof value === "string" ? value : undefined;
};

export const HAS_BLOBS = parseBool(readEnv("VITE_DUCK_USE_BLOBS"), false);
export const STT_TTS_ENABLED = parseBool(
  readEnv("VITE_STT_TTS_ENABLED"),
  false,
);

export type DuckFlags = Readonly<{
  HAS_BLOBS: boolean;
  STT_TTS_ENABLED: boolean;
}>;

export const flags: DuckFlags = Object.freeze({
  HAS_BLOBS,
  STT_TTS_ENABLED,
});
