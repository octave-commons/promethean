import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import type { Code, Content, Heading, Root, Text } from 'mdast';
import type { Position } from 'unist';

import type { MarkdownChunk } from './types.js';

const SENTENCE_BOUNDARY = /(?<=[.!?])\s+/u;

type SentenceAggregation = {
    readonly chunks: readonly string[];
    readonly buffer: string;
};

const reduceSentence =
    (
        maxLen: number,
    ): ((state: SentenceAggregation, fragment: string, index: number, parts: string[]) => SentenceAggregation) =>
    ({ chunks, buffer }, fragment, index, parts) => {
        const normalized = fragment.trim();
        if (!normalized) {
            return { chunks, buffer };
        }
        const candidate = buffer ? `${buffer} ${normalized}` : normalized;
        if (candidate.length > maxLen) {
            const nextChunks = buffer ? [...chunks, buffer.trim()] : chunks;
            return { chunks: nextChunks, buffer: normalized };
        }
        const isLast = index === parts.length - 1;
        return {
            chunks: isLast ? [...chunks, candidate.trim()] : chunks,
            buffer: isLast ? '' : candidate,
        };
    };

const hardWrap =
    (maxLen: number) =>
    (segment: string): string[] => {
        if (segment.length <= maxLen) return [segment];
        return Array.from({ length: Math.ceil(segment.length / maxLen) }, (_value, sliceIndex) =>
            segment.slice(sliceIndex * maxLen, sliceIndex * maxLen + maxLen),
        );
    };

export const sentenceSplit = (text: string, maxLen: number): readonly string[] => {
    if (text.length <= maxLen) return [text.trim()];
    const parts = text.split(SENTENCE_BOUNDARY);
    if (parts.length === 0) return [];
    const initial: SentenceAggregation = { chunks: [], buffer: '' };
    const aggregated = parts.reduce(reduceSentence(maxLen), initial);
    const combined = aggregated.buffer ? [...aggregated.chunks, aggregated.buffer.trim()] : aggregated.chunks;
    return combined.flatMap(hardWrap(maxLen));
};

type NodeWithPosition = {
    readonly position?: Position | null;
};

const isTextNode = (value: unknown): value is Text =>
    typeof value === 'object' && value !== null && (value as Text).type === 'text';

const toHeadingTitle = (heading: Heading): string =>
    (heading.children ?? [])
        .map((child) => (isTextNode(child) ? child.value ?? '' : ''))
        .join(' ')
        .trim();

const extractText = (node: Content): string => {
    const fragments: string[] = [];
    visit(node, (child: unknown) => {
        if (isTextNode(child)) {
            const value = child.value ?? '';
            if (value) fragments.push(value);
        }
    });
    return fragments.join('');
};

const toChunk = (node: Content | Code, position: Position, heading: string | undefined): readonly MarkdownChunk[] => {
    const raw = node.type === 'code' ? (node as Code).value ?? '' : extractText(node as Content);
    const trimmed = raw.trim();
    if (!trimmed) return [];
    const kind: MarkdownChunk['kind'] = node.type === 'code' ? 'code' : 'text';
    return sentenceSplit(trimmed, 1200).map(
        (sentence): MarkdownChunk => ({
            text: sentence,
            startLine: position.start.line,
            startCol: position.start.column,
            endLine: position.end.line,
            endCol: position.end.column,
            kind,
            ...(heading ? { title: heading } : {}),
        }),
    );
};

export const parseMarkdownChunks = (markdown: string): readonly MarkdownChunk[] => {
    const ast = unified().use(remarkParse).parse(markdown) as Root;
    const collected: MarkdownChunk[] = [];
    let currentHeading: string | undefined;

    visit(ast, (node) => {
        if (!node || typeof node.type !== 'string') return;
        if (node.type === 'heading') {
            currentHeading = toHeadingTitle(node as Heading) || undefined;
            return;
        }
        if (node.type === 'paragraph' || node.type === 'listItem' || node.type === 'code') {
            const position = (node as NodeWithPosition).position ?? undefined;
            if (!position) return;
            const chunkNodes = toChunk(node as Content | Code, position, currentHeading);
            if (chunkNodes.length > 0) {
                collected.push(...chunkNodes);
            }
        }
    });

    if (collected.length > 0) return collected;
    if (!markdown.trim()) return [];
    const totalLines = markdown.split('\n').length;
    return [
        {
            text: markdown.trim(),
            startLine: 1,
            startCol: 1,
            endLine: totalLines,
            endCol: 1,
            kind: 'text',
        },
    ];
};
