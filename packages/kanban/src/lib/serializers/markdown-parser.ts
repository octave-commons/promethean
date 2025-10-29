/**
 * Markdown parsing functions for kanban boards
 * Extracted from @packages/markdown/src/kanban.ts
 */

import matter from 'gray-matter';

import type { Card, ColumnState, BoardFrontmatter, KanbanSettings } from '../actions/types/index.js';

const COLUMN_HEADING = /^##\s+(.+)$/u;
const CARD_ITEM = /^-\s*\[(?<status>[ xX])\]\s*(?<body>.*)$/u;
const CARD_COMMENT = /^\s*<!--\s*id:\s*([A-Za-z0-9._:-]+)\s*-->\s*$/u;
const SETTINGS_BLOCK = /%%\s*kanban:settings[\s\S]*?```json\s*([\s\S]*?)\s*```[\s\S]*?%%/iu;
const TAG_PATTERN = /(^|\s)#([\w.-]+)/gu;
const LINK_PATTERN = /\[\[([^\]]+)\]\]/gu;

type ParseAcc = {
    readonly columns: readonly ColumnState[];
    readonly current: ColumnState | undefined;
    readonly pendingCardIndex: number | undefined;
};

const cloneCard = (card: Card): Card => ({
    id: card.id,
    text: card.text,
    done: card.done,
    tags: [...card.tags],
    links: [...card.links],
    attrs: Object.freeze({ ...card.attrs }),
});

const ensureId = (value: string | undefined): string => value ?? crypto.randomUUID();

const parseAttrs = (raw: string | undefined): Record<string, string> => {
    if (!raw) return Object.freeze({});
    const inner = raw
        .trim()
        .replace(/^\{/u, '')
        .replace(/\}\s*$/u, '')
        .trim();
    if (!inner) return Object.freeze({});
    const token = /([\w.-]+)\s*:\s*("[^"]*"|'[^']*'|[^\s]+)(?=\s|$)/gu;
    const matches = Array.from(inner.matchAll(token));
    if (matches.length === 0) return Object.freeze({});
    const entries = matches
        .map((match) => {
            const key = match[1] ?? '';
            const rawValue = match[2] ?? '';
            const isQuoted =
                (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
                (rawValue.startsWith("'") && rawValue.endsWith("'"));
            const trimmed = isQuoted ? rawValue.slice(1, -1) : rawValue;
            const value = trimmed.replace(/\\"/gu, '"').replace(/\\'/gu, "'").replace(/\\\\/gu, '\\');
            return key ? ([key, value] as const) : null;
        })
        .filter((entry): entry is readonly [string, string] => entry !== null);
    return Object.freeze(Object.fromEntries(entries));
};

const parseCardLine = (body: string, isDone: boolean): { readonly card: Card; readonly hasInlineId: boolean } => {
    const commentMatch = body.match(/([\s\S]*)<!--\s*id:\s*([A-Za-z0-9._:-]+)\s*-->\s*$/u);
    const withoutComment = commentMatch ? commentMatch[1] ?? '' : body;
    const inlineId = commentMatch?.[2];
    const attrsMatch = withoutComment.match(/\{[^}]+\}\s*$/u);
    const attrs = parseAttrs(attrsMatch?.[0]);
    const withoutAttrs = attrsMatch ? withoutComment.slice(0, attrsMatch.index).trim() : withoutComment.trim();
    const tags = Array.from(withoutAttrs.matchAll(TAG_PATTERN), (match) => match[2] ?? '').filter(
        (tag) => tag.length > 0,
    );
    const links = Array.from(withoutAttrs.matchAll(LINK_PATTERN), (match) => match[1] ?? '').filter(
        (link) => link.length > 0,
    );
    const cleaned = withoutAttrs.replace(TAG_PATTERN, ' ').replace(LINK_PATTERN, ' ').replace(/\s+/gu, ' ').trim();
    return {
        card: {
            id: ensureId(inlineId),
            text: cleaned,
            done: isDone,
            tags,
            links,
            attrs,
        },
        hasInlineId: Boolean(inlineId),
    };
};

const appendColumn = (columns: readonly ColumnState[], column: ColumnState): readonly ColumnState[] => [
    ...columns,
    column,
];

const parseColumns = (markdown: string): readonly ColumnState[] => {
    const lines = markdown.split(/\r?\n/u);
    const initial: ParseAcc = { columns: [], current: undefined, pendingCardIndex: undefined };
    const processed = lines.reduce<ParseAcc>((state, line) => {
        if (line.trim().length === 0) {
            return { ...state, pendingCardIndex: undefined };
        }
        const headingMatch = COLUMN_HEADING.exec(line);
        if (headingMatch) {
            const nextColumn: ColumnState = {
                name: (headingMatch[1] ?? '').trim(),
                cards: [],
            };
            const columns = state.current ? appendColumn(state.columns, state.current) : state.columns;
            return { columns, current: nextColumn, pendingCardIndex: undefined };
        }
        const cardMatch = CARD_ITEM.exec(line);
        if (cardMatch && state.current) {
            const statusToken = (cardMatch.groups?.status ?? ' ').toLowerCase();
            const body = cardMatch.groups?.body ?? '';
            const { card, hasInlineId } = parseCardLine(body, statusToken === 'x');
            const cards = [...state.current.cards, card];
            const current = { ...state.current, cards };
            return {
                columns: state.columns,
                current,
                pendingCardIndex: hasInlineId ? undefined : cards.length - 1,
            };
        }
        const commentMatch = CARD_COMMENT.exec(line);
        if (commentMatch && state.current && typeof state.pendingCardIndex === 'number') {
            const cardId = commentMatch[1] ?? '';
            const cards = state.current.cards.map((card, index) =>
                index === state.pendingCardIndex ? { ...card, id: cardId } : card,
            );
            const current = { ...state.current, cards };
            return { columns: state.columns, current, pendingCardIndex: undefined };
        }
        return state;
    }, initial);
    const finalColumns = processed.current ? appendColumn(processed.columns, processed.current) : processed.columns;
    return finalColumns.map((column) => ({ ...column, cards: column.cards.map(cloneCard) }));
};

const removeSettingsBlock = (
    content: string,
): { readonly cleaned: string; readonly settings: KanbanSettings | null } => {
    const match = SETTINGS_BLOCK.exec(content);
    if (!match) return { cleaned: content, settings: null };
    const json = (match[1] ?? '').trim();
    try {
        const parsed = json ? (JSON.parse(json) as KanbanSettings) : {};
        const cleaned = content.replace(match[0] ?? '', '').trimStart();
        return { cleaned, settings: Object.freeze(parsed) };
    } catch {
        return { cleaned: content.replace(match[0] ?? '', '').trimStart(), settings: null };
    }
};

const freezeRecord = <T extends Record<string, unknown>>(record: Readonly<T>): Readonly<T> =>
    Object.freeze({ ...record });

export type ParseMarkdownInput = {
    readonly markdown: string;
};

export type ParseMarkdownOutput = {
    readonly columns: readonly ColumnState[];
    readonly frontmatter: BoardFrontmatter;
    readonly settings: KanbanSettings | null;
};

export const parseMarkdown = (input: ParseMarkdownInput): ParseMarkdownOutput => {
    const { content, data } = matter(input.markdown);
    const { cleaned, settings } = removeSettingsBlock(content);
    const columns = parseColumns(cleaned);
    const frontmatter = freezeRecord((data ?? {}) as Record<string, unknown>);
    
    return {
        columns,
        frontmatter,
        settings,
    };
};