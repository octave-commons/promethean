import type { ChatMessage } from './types/openai.js';
import type { RetrieverResult } from './retriever.js';

export type AugmentedPrompt = {
    system: string | null;
    user: string;
    contextBlock: string;
    citations: Array<{ path: string; startLine?: number; endLine?: number }>;
    finalSystemPrompt: string;
    finalMessages: ChatMessage[];
};

export function buildAugmentedPrompt(
    messages: ChatMessage[],
    retrieved: RetrieverResult,
    opts?: { preserveSystem?: boolean },
): AugmentedPrompt {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    const systemMsg = messages.find((m) => m.role === 'system')?.content || null;
    const userContent = lastUser?.content || '';

    const citations: Array<{ path: string; startLine?: number; endLine?: number }> = [];
    const ctxLines: string[] = [];
    for (const hit of retrieved.search.slice(0, 8)) {
        citations.push({ path: hit.path, startLine: hit.startLine, endLine: hit.endLine });
        const header = `- ${hit.path}${
            hit.startLine ? `:${hit.startLine}-${hit.endLine ?? hit.startLine}` : ''
        }`;
        const text = (hit.snippet || hit.text || '').trim();
        ctxLines.push(`${header}\n${indent(text, 2)}`);
    }
    const contextBlock = ctxLines.length
        ? ['Context:', '----------', ...ctxLines].join('\n')
        : 'Context: (no relevant repo context found)';

    // Append-only augmentation: keep original messages but add a system addendum capturing provenance
    const addendum = [
        'You are Codex Context. Use the following repo context (with citations) to inform your answer.',
        'Preserve provenance in your reasoning and do not fabricate paths.',
        'When citing, include file paths and line ranges exactly as provided.',
        '',
        contextBlock,
    ].join('\n');

    const finalSystemPrompt = [systemMsg, addendum].filter(Boolean).join('\n\n');
    const finalMessages: ChatMessage[] = [
        { role: 'system', content: finalSystemPrompt },
        ...messages.filter((m) => m.role !== 'system'),
    ];

    return {
        system: systemMsg,
        user: userContent,
        contextBlock,
        citations,
        finalSystemPrompt,
        finalMessages,
    };
}

export function indent(s: string, spaces = 2) {
    const pad = ' '.repeat(spaces);
    return s
        .split(/\r?\n/)
        .map((l) => (l.length ? pad + l : l))
        .join('\n');
}
