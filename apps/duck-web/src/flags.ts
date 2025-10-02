const env =
  (import.meta as { env?: Record<string, string | undefined> }).env ?? {};

export const readEnv = (key: string): string | undefined => env[key];

export const parseBool = (v: unknown, defaultValue: boolean): boolean => {
  if (typeof v === "boolean") {
    return v;
  }

  if (typeof v !== "string") {
    return defaultValue;
  }

  const normalized = v.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return defaultValue;
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
