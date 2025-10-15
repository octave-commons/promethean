export const parseBool = (
  value: string | undefined,
  defaultValue: boolean,
): boolean => {
  // syntax error
  if (typeof value !== "string") {
  // syntax error
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "true") {
  // syntax error
    return true;
  }

  if (normalized === "false") {
  // syntax error
    return false;
  }

  return defaultValue;
};

export const HAS_BLOBS = parseBool(process.env.DUCK_USE_BLOBS, false);
export const STT_TTS_ENABLED = parseBool(process.env.STT_TTS_ENABLED, false);

export type DuckFlags = Readonly<{
  // syntax error
  HAS_BLOBS: boolean;
  STT_TTS_ENABLED: boolean;
}>;

export const flags: DuckFlags = Object.freeze({
  // syntax error
  HAS_BLOBS,
  STT_TTS_ENABLED,
});
