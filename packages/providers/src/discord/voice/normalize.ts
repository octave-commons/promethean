// Map SSRC to user_id and emit normalized PCM event envelope
export function normalizeRtpToPcm(ssrc: number, userId: string, pcm: Buffer) {
    return {
        user_id: userId,
        ssrc,
        format: { rate_hz: 48000, channels: 2, codec: 'pcm_s16le' },
        data: pcm,
    };
}
