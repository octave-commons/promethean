export let parseBool = (
  value: string | undefined,
  defaultValue: boolean,
): boolean => {
  if (typeof value !== "string") {
    return defaultValue;
  }

  let normalized = value.trim().toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return defaultValue;
};

export let HAS_BLOBS = parseBool(process.env.DUCK_USE_BLOBS, false);
export let STT_TTS_ENABLED = parseBool(process.env.STT_TTS_ENABLED, false);

export type DuckFlags = Readonly<{
  HAS_BLOBS: boolean;
  STT_TTS_ENABLED: boolean;
}>;

export let flags: DuckFlags = Object.freeze({
  HAS_BLOBS,
  STT_TTS_ENABLED,
});
