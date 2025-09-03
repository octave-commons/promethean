// SPDX-License-Identifier: GPL-3.0-only
declare module "wav-decoder" {
  export function decode(buffer: ArrayBuffer | Buffer): Promise<{
    sampleRate: number;
    channelData: Float32Array[];
  }>;
}
