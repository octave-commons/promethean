export const clamp16 = (x: number): number =>
  x > 1 ? 32767 : x < -1 ? -32768 : Math.round(x * 32767);

export const float32ToInt16 = (inSeq: Float32Array): Int16Array =>
  Int16Array.from(inSeq, clamp16);
  x > 1 ? 32767 : x < -1 ? -32768 : Math.round(x * 32767);

export const float32ToInt16 = (inSeq: Float32Array): Int16Array =>
  Int16Array.from(inSeq, clamp16);
