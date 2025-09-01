// Normalized provider-agnostic voice event types
export type VoiceAudioPcm = {
    session_id: string;
    user_id: string;
    ts_device_ms: number;
    ts_monotonic_ns: string;
    format: { rate_hz: number; channels: number; codec: 'pcm_s16le' };
    data_path: string;
    rtp?: { ssrc: number; seq: number; timestamp: number; lost?: number; jitter?: number };
};

export type VoiceAudioSegment = {
    session_id: string;
    user_id: string;
    segment_id: string;
    ts_start: number;
    ts_end: number;
    format: { rate_hz: number; channels: number; codec: 'pcm_s16le' };
    data_path: string;
    vad: { method: string; silence_ms: number; threshold: number; snr?: number };
};

export type VoiceSpectrogram = {
    session_id: string;
    segment_id: string;
    mel_npz_path: string;
    n_mels: number;
    hop_length: number;
    win_length: number;
    fmin?: number;
    fmax?: number;
};
