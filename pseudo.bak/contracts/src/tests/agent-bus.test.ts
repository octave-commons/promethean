import test from 'ava';
import type { BaseMsg, LlmRequest, LlmResult, PlaybackEvent, TtsResult } from '../agent-bus.js';

const base: BaseMsg = {
    corrId: 'abc-123',
    turnId: 7,
    ts: 1_726_567_890,
};

test('llm result ok variant carries generated text', (t) => {
    const result: LlmResult = {
        ...base,
        topic: 'agent.llm.result',
        ok: true,
        text: 'intent parsed',
    };

    if (result.ok) {
        t.is(result.text, 'intent parsed');
    } else {
        t.fail('expected ok variant to expose text');
    }
});

test('llm result error variant surfaces error message', (t) => {
    const result: LlmResult = {
        ...base,
        topic: 'agent.llm.result',
        ok: false,
        error: 'llm timeout',
    };

    if (!result.ok) {
        t.is(result.error, 'llm timeout');
    } else {
        t.fail('expected error variant to expose error');
    }
});

test('tts result ok variant includes media metadata', (t) => {
    const result: TtsResult = {
        ...base,
        topic: 'agent.tts.result',
        ok: true,
        mediaUrl: 'https://example.invalid/utterance.wav',
        durationMs: 2800,
    };

    if (result.ok) {
        t.is(result.mediaUrl.endsWith('.wav'), true);
        t.is(result.durationMs, 2800);
    } else {
        t.fail('expected synthesized audio result');
    }
});

test('playback events use constrained event names', (t) => {
    const event: PlaybackEvent = {
        ...base,
        topic: 'agent.playback.event',
        event: 'start',
        utteranceId: 'utt-42',
    };

    t.like(event, {
        event: 'start',
        utteranceId: 'utt-42',
    });
});

test('llm request captures optional multimodal payload', (t) => {
    const request: LlmRequest = {
        ...base,
        topic: 'agent.llm.request',
        prompt: 'describe latest sensor data',
        context: [
            { role: 'system', content: 'keep answers under 20 words' },
            { role: 'user', content: 'status?' },
        ],
        images: [{ type: 'url', url: 'https://example.invalid/frame.jpg', mime: 'image/jpeg' }],
        format: 'json',
    };

    t.deepEqual(request.images?.[0], {
        type: 'url',
        url: 'https://example.invalid/frame.jpg',
        mime: 'image/jpeg',
    });
});
