declare module 'wav-decoder' {
  export function decode(buffer: ArrayBuffer): Promise<{
    sampleRate: number;
    channelData: Float32Array[];
  }>;
}
