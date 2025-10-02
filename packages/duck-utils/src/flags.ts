export const parseBool = (
  v: string | undefined,
  defaultValue: boolean,
): boolean => (v === "true" ? true : v === "false" ? false : defaultValue);

export const HAS_BLOBS = parseBool(process.env.DUCK_USE_BLOBS, false);
export const STT_TTS_ENABLED = parseBool(process.env.STT_TTS_ENABLED, false);

export type DuckFlags = Readonly<{
  HAS_BLOBS: boolean;
  STT_TTS_ENABLED: boolean;
}>;

export const flags: DuckFlags = Object.freeze({
  HAS_BLOBS,
  STT_TTS_ENABLED,
});
