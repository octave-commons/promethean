import { normalizeChat, normalizeEmbed, normalizeError, normalizeStream } from './normalizers.js';

export type ParityClients = {
    broker: {
        chat(payload: any): Promise<any>;
        chatStream(payload: any, onChunk: (chunk: any) => void): Promise<void>;
        embed?(payload: any): Promise<any>;
    };
    bridge: {
        chat(payload: any): Promise<any>;
        chatStream(payload: any, onChunk: (chunk: any) => void): Promise<void>;
        embed?(payload: any): Promise<any>;
    };
};

export async function runChatBoth(payload: any, clients: ParityClients) {
    const [b, h] = await Promise.all([clients.broker.chat(payload), clients.bridge.chat(payload)]);
    return { broker: normalizeChat(b), bridge: normalizeChat(h) };
}

export async function runChatStreamBoth(
    payload: any,
    clients: ParityClients,
    onChunk?: (side: 'broker' | 'bridge', chunk: any) => void,
) {
    const acc = { broker: [] as any[], bridge: [] as any[] };
    await Promise.all([
        clients.broker.chatStream(payload, (c: any) => {
            acc.broker.push(c);
            onChunk?.('broker', c);
        }),
        clients.bridge.chatStream(payload, (c: any) => {
            acc.bridge.push(c);
            onChunk?.('bridge', c);
        }),
    ]);
    return {
        broker: normalizeStream(acc.broker),
        bridge: normalizeStream(acc.bridge),
    };
}

export async function runEmbedBoth(payload: any, clients: ParityClients) {
    if (!clients.broker.embed || !clients.bridge.embed) {
        throw new Error('embed not implemented on client');
    }
    const [b, h] = await Promise.all([clients.broker.embed(payload), clients.bridge.embed(payload)]);
    return { broker: normalizeEmbed(b), bridge: normalizeEmbed(h) };
}

export function compareErrors(brokerErr: any, bridgeErr: any) {
    return {
        broker: normalizeError(brokerErr),
        bridge: normalizeError(bridgeErr),
    };
}
