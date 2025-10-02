export const parseBool = (v: unknown, defaultValue: boolean): boolean =>
  typeof v === "string"
    ? v.trim().toLowerCase() === "true"
      ? true
      : v.trim().toLowerCase() === "false"
        ? false
        : defaultValue
    : defaultValue;

export const HAS_BLOBS = parseBool(import.meta.env?.VITE_DUCK_USE_BLOBS, false);
export const STT_TTS_ENABLED = parseBool(
  import.meta.env?.VITE_STT_TTS_ENABLED,
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
