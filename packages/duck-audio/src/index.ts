export const PCM16_MIN = -32768;
export const PCM16_MAX = 32767;
export const PCM16_SCALAR = 32767;

export const PCM48_SAMPLE_RATE = 48_000;
export const PCM16_SAMPLE_RATE = 16_000;
export const PCM48_STEREO_CHANNELS = 2;
export const PCM16_MONO_CHANNELS = 1;

export const PCM48_TO_16_DECIMATION = PCM48_SAMPLE_RATE / PCM16_SAMPLE_RATE; // 3
export const STEREO_FRAMES_PER_OUTPUT_SAMPLE = PCM48_TO_16_DECIMATION;
export const SAMPLES_PER_DECIMATED_OUTPUT =
  PCM48_STEREO_CHANNELS * PCM48_TO_16_DECIMATION; // 6 interleaved samples

export const PCM16_FRAME_DURATION_MS = 20;
export const PCM16_BYTES_PER_SAMPLE = 2;
export const PCM16_BYTES_PER_FRAME =
  (PCM16_SAMPLE_RATE * PCM16_FRAME_DURATION_MS * PCM16_BYTES_PER_SAMPLE) / 1000;

export const clampPcm16 = (value: number): number => {
  if (Number.isNaN(value)) return 0;
  if (value <= PCM16_MIN) return PCM16_MIN;
  if (value >= PCM16_MAX) return PCM16_MAX;
  return value | 0;
};

export const averageStereoFrame = (left: number, right: number): number =>
  (left + right) / PCM48_STEREO_CHANNELS;

export const clampUnitFloat = (value: number): number => {
  if (Number.isNaN(value)) return 0;
  if (value <= -1) return -1;
  if (value >= 1) return 1;
  return value;
};

export const floatToPcm16 = (value: number): number =>
  clampPcm16(clampUnitFloat(value) * PCM16_SCALAR);
