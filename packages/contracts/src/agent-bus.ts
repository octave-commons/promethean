export type UUID = string;

export type Topics =
    | 'agent.turn'
    | 'agent.transcript.final'
    | 'agent.llm.request'
    | 'agent.llm.result'
    | 'agent.tts.request'
    | 'agent.tts.result'
    | 'agent.playback.event';

export type BaseMsg = {
    corrId: UUID;
    turnId: number;
    ts: number;
};

export type TranscriptFinal = BaseMsg & {
    topic: 'agent.transcript.final';
    text: string;
    channelId: string;
    userId?: string;
};

export type ImageRef =
    | { type: 'url'; url: string; mime?: string }
    | { type: 'attachment'; id: string; mime?: string }
    | { type: 'blob'; mime: string; data: string };

export type LlmRequest = BaseMsg & {
    topic: 'agent.llm.request';
    prompt: string;
    context: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    images?: ImageRef[];
    specialQuery?: string;
    format?: 'json' | 'text';
};

export type LlmResult =
    | (BaseMsg & { topic: 'agent.llm.result'; ok: true; text: string })
    | (BaseMsg & { topic: 'agent.llm.result'; ok: false; error: string });

export type TtsRequest = BaseMsg & {
    topic: 'agent.tts.request';
    text: string;
    voice?: string;
    group?: string;
    priority?: 0 | 1 | 2;
    bargeIn?: 'none' | 'duck' | 'pause' | 'stop';
};

export type TtsResult =
    | (BaseMsg & {
          topic: 'agent.tts.result';
          ok: true;
          mediaUrl: string;
          durationMs?: number;
      })
    | (BaseMsg & { topic: 'agent.tts.result'; ok: false; error: string });

export type PlaybackEvent = BaseMsg & {
    topic: 'agent.playback.event';
    event: 'start' | 'end' | 'cancel';
    utteranceId: UUID;
};
