import { unified } from 'unified';
import remarkParse from 'remark-parse';
import type { Code, Content, Heading, List, ListContent, ListItem, Paragraph, Root, Text } from 'mdast';
import type { Position } from 'unist';

import type { MarkdownChunk } from './types.js';

const SENTENCE_BOUNDARY = /(?<=[.!?])\s+/u;

type RootNode = Root['children'][number];

type SentenceAggregation = {
    readonly chunks: readonly string[];
    readonly buffer: string;
};

const reduceSentence =
    (
        maxLen: number,
    ): ((
        state: SentenceAggregation,
        fragment: string,
        index: number,
        parts: readonly string[],
    ) => SentenceAggregation) =>
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
    (segment: string): readonly string[] => {
        if (segment.length <= maxLen) return [segment];
        const slices = Math.ceil(segment.length / maxLen);
        return Array.from({ length: slices }, (_, sliceIndex) =>
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

const hasChildren = (value: unknown): value is { readonly children: readonly Content[] } =>
    typeof value === 'object' && value !== null && Array.isArray((value as { children?: unknown }).children);

const hasValue = (value: unknown): value is Text =>
    typeof value === 'object' && value !== null && typeof (value as { value?: unknown }).value === 'string';

const isHeading = (node: RootNode): node is Heading => node.type === 'heading';
const isParagraph = (node: Content | ListContent | RootNode): node is Paragraph => node.type === 'paragraph';
const isCode = (node: Content | ListContent | RootNode): node is Code => node.type === 'code';
const isList = (node: RootNode | ListContent): node is List => node.type === 'list';
const isListItem = (node: RootNode | ListContent): node is ListItem => node.type === 'listItem';

const toHeadingTitle = (heading: Heading): string =>
    (heading.children ?? [])
        .map((child) => (hasValue(child) ? child.value ?? '' : hasChildren(child) ? extractText(child as Content) : ''))
        .join(' ')
        .trim();

const extractText = (node: Content): string => {
    if (hasValue(node)) return node.value ?? '';
    if (hasChildren(node)) {
        return (node.children as readonly Content[]).map((child) => extractText(child)).join('');
    }
    return '';
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

const toChunksFromListItem = (item: ListItem, heading: string | undefined): readonly MarkdownChunk[] =>
    (item.children ?? []).flatMap((child) => toChunksFromContentOrList(child, heading));

const toChunksFromList = (list: List, heading: string | undefined): readonly MarkdownChunk[] =>
    (list.children ?? []).flatMap((child) => toChunksFromContentOrList(child, heading));

const toChunksFromContentOrList = (
    node: ListContent | Content | RootNode,
    heading: string | undefined,
): readonly MarkdownChunk[] => {
    if ((isParagraph(node) || isCode(node)) && (node as NodeWithPosition).position) {
        const position = ((node as NodeWithPosition).position ?? undefined) as Position | undefined;
        return position ? toChunk(node as Content | Code, position, heading) : [];
    }
    if (isList(node)) return toChunksFromList(node, heading);
    if (isListItem(node)) return toChunksFromListItem(node, heading);
    return [];
};

const gatherChunks = (nodes: readonly RootNode[]): readonly MarkdownChunk[] => {
    type Accumulator = { readonly heading: string | undefined; readonly chunks: readonly MarkdownChunk[] };
    const initial: Accumulator = { heading: undefined, chunks: [] };
    const reduced = nodes.reduce<Accumulator>((state, node) => {
        if (isHeading(node)) {
            return { heading: toHeadingTitle(node) || undefined, chunks: state.chunks };
        }
        const additions = toChunksFromContentOrList(node, state.heading);
        return additions.length > 0 ? { heading: state.heading, chunks: [...state.chunks, ...additions] } : state;
    }, initial);
    return reduced.chunks;
};

export const parseMarkdownChunks = (markdown: string): readonly MarkdownChunk[] => {
    const ast = unified().use(remarkParse).parse(markdown) as Root;
    const chunks = gatherChunks(ast.children ?? []);
    if (chunks.length > 0) return chunks;
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
