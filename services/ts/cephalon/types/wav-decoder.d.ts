declare module 'wav-decoder' {
    export function decode(buffer: ArrayBuffer | Buffer): Promise<{
        sampleRate: number;
        channelData: Float32Array[];
    }>;
}
