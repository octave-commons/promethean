import { randomUUID } from 'node:crypto';

import matter from 'gray-matter';

export type Attrs = Readonly<Record<string, string>>;

export type Card = {
    readonly id: string;
    readonly text: string;
    readonly done: boolean;
    readonly tags: readonly string[];
    readonly links: readonly string[];
    readonly attrs: Attrs;
};

export type Column = {
    readonly name: string;
    readonly _headingIndex: number;
};

export type BoardFrontmatter = Readonly<Record<string, unknown>>;

export type KanbanSettings = Readonly<Record<string, unknown>>;

type ColumnState = {
    readonly name: string;
    readonly cards: readonly Card[];
};

type BoardState = {
    readonly columns: readonly ColumnState[];
    readonly frontmatter: BoardFrontmatter;
    readonly settings: KanbanSettings | null;
};

type ParseAcc = {
    readonly columns: readonly ColumnState[];
    readonly current: ColumnState | undefined;
    readonly pendingCardIndex: number | undefined;
};

const COLUMN_HEADING = /^##\s+(.+)$/u;
const CARD_ITEM = /^-\s*\[(?<status>[ xX])\]\s*(?<body>.*)$/u;
const CARD_COMMENT = /^\s*<!--\s*id:\s*([A-Za-z0-9._:-]+)\s*-->\s*$/u;
const SETTINGS_BLOCK = /%%\s*kanban:settings[\s\S]*?```json\s*([\s\S]*?)\s*```[\s\S]*?%%/iu;
const TAG_PATTERN = /(^|\s)#([\w.-]+)/gu;
const LINK_PATTERN = /\[\[([^\]]+)\]\]/gu;

const clamp = (value: number, lower: number, upper: number): number => Math.min(Math.max(value, lower), upper);

const freezeRecord = <T extends Record<string, unknown>>(record: Readonly<T>): Readonly<T> =>
    Object.freeze({ ...record });

const normalizeName = (value: string): string => value.trim().toLowerCase();

const normalizeTags = (tags: readonly string[] | undefined): readonly string[] =>
    (tags ?? [])
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .map((tag) => (tag.startsWith('#') ? tag.slice(1) : tag));

const normalizeLinks = (links: readonly string[] | undefined): readonly string[] =>
    (links ?? []).map((link) => link.trim()).filter((link) => link.length > 0);

const normalizeAttrs = (attrs: Attrs | undefined): Attrs => {
    const entries = Object.entries(attrs ?? {})
        .map(([key, value]) => [key.trim(), value.trim()] as const)
        .filter(([key, value]) => key.length > 0 && value.length > 0);
    return Object.freeze(Object.fromEntries(entries));
};

const formatAttrValue = (value: string): string => {
    const escaped = value.replace(/\\/gu, '\\\\');
    if (!/\s|"|'/.test(value)) return escaped;
    if (!value.includes('"')) {
        return `"${escaped}"`;
    }
    if (!value.includes("'")) {
        return `'${escaped}'`;
    }
    return `"${escaped.replace(/"/gu, '\\"')}"`;
};

const stringifyAttrs = (attrs: Attrs): string | undefined => {
    const entries = Object.entries(attrs);
    if (entries.length === 0) return undefined;
    const rendered = entries.map(([key, value]) => `${key}:${formatAttrValue(value)}`);
    return `{${rendered.join(' ')}}`;
};

const parseAttrs = (raw: string | undefined): Attrs => {
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

const createCardText = (card: Card): string => {
    const tagTokens = card.tags.map((tag) => `#${tag}`);
    const linkTokens = card.links.map((link) => `[[${link}]]`);
    const attrsToken = stringifyAttrs(card.attrs);
    return [card.text, ...tagTokens, ...linkTokens, attrsToken]
        .filter((token): token is string => typeof token === 'string' && token.trim().length > 0)
        .join(' ')
        .trim();
};

const formatCardLine = (card: Card): string => {
    const prefix = card.done ? '- [x]' : '- [ ]';
    const text = createCardText(card);
    const comment = `<!-- id: ${card.id} -->`;
    return text.length > 0 ? `${prefix} ${text} ${comment}` : `${prefix} ${comment}`;
};

const cloneCard = (card: Card): Card => ({
    id: card.id,
    text: card.text,
    done: card.done,
    tags: [...card.tags],
    links: [...card.links],
    attrs: Object.freeze({ ...card.attrs }),
});

const ensureId = (value: string | undefined): string => value ?? randomUUID();

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

const formatSettingsBlock = (settings: KanbanSettings | null): string => {
    if (!settings) return '';
    const json = JSON.stringify(settings, null, 2);
    return ['%% kanban:settings', '', '```json', json, '```', '%%', ''].join('\n');
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

export class MarkdownBoard {
    private state: BoardState;

    private constructor(state: BoardState) {
        this.state = state;
    }

    static async load(markdown: string): Promise<MarkdownBoard> {
        const { content, data } = matter(markdown);
        const { cleaned, settings } = removeSettingsBlock(content);
        const columns = parseColumns(cleaned);
        const frontmatter = freezeRecord((data ?? {}) as Record<string, unknown>);
        const state: BoardState = {
            columns,
            frontmatter,
            settings,
        };
        return new MarkdownBoard(state);
    }

    getFrontmatter(): BoardFrontmatter {
        return freezeRecord(this.state.frontmatter as Record<string, unknown>);
    }

    setFrontmatter(patch: BoardFrontmatter): void {
        this.state = {
            ...this.state,
            frontmatter: freezeRecord({
                ...(this.state.frontmatter as Record<string, unknown>),
                ...(patch as Record<string, unknown>),
            }),
        };
    }

    getKanbanSettings(): KanbanSettings | null {
        return this.state.settings ? Object.freeze({ ...(this.state.settings as Record<string, unknown>) }) : null;
    }

    setKanbanSettings(settings: KanbanSettings): void {
        this.state = { ...this.state, settings: Object.freeze({ ...(settings as Record<string, unknown>) }) };
    }

    listColumns(): Column[] {
        return this.state.columns.map((column, index) => ({ name: column.name, _headingIndex: index }));
    }

    addColumn(name: string, position?: number): void {
        const exists = this.state.columns.some((column) => normalizeName(column.name) === normalizeName(name));
        if (exists) return;
        const index =
            typeof position === 'number' ? clamp(position, 0, this.state.columns.length) : this.state.columns.length;
        const column: ColumnState = { name, cards: [] };
        const before = this.state.columns.slice(0, index);
        const after = this.state.columns.slice(index);
        this.state = {
            ...this.state,
            columns: [...before, column, ...after],
        };
    }

    removeColumn(name: string): void {
        const target = normalizeName(name);
        this.state = {
            ...this.state,
            columns: this.state.columns.filter((column) => normalizeName(column.name) !== target),
        };
    }

    listCards(columnName: string): readonly Card[] {
        const target = normalizeName(columnName);
        const column = this.state.columns.find((item) => normalizeName(item.name) === target);
        return column ? column.cards.map(cloneCard) : [];
    }

    addCard(columnName: string, card: Partial<Card> & { readonly text: string }): string {
        const target = normalizeName(columnName);
        const columns = this.state.columns;
        const index = columns.findIndex((column) => normalizeName(column.name) === target);
        const ensureColumnExists = (): readonly ColumnState[] => {
            if (index >= 0) return columns;
            return [...columns, { name: columnName, cards: [] }];
        };
        const safeColumns = ensureColumnExists();
        const resolvedIndex = index >= 0 ? index : safeColumns.length - 1;
        const cardId = ensureId(card.id);
        const nextCard: Card = {
            id: cardId,
            text: card.text.trim(),
            done: Boolean(card.done),
            tags: [...normalizeTags(card.tags ?? [])],
            links: [...normalizeLinks(card.links ?? [])],
            attrs: normalizeAttrs(card.attrs),
        };
        const nextColumns = safeColumns.map((column, columnIndex) =>
            columnIndex === resolvedIndex ? { ...column, cards: [...column.cards, nextCard] } : column,
        );
        this.state = { ...this.state, columns: nextColumns };
        return cardId;
    }

    removeCard(columnName: string, cardId: string): void {
        const target = normalizeName(columnName);
        const nextColumns = this.state.columns.map((column) =>
            normalizeName(column.name) === target
                ? { ...column, cards: column.cards.filter((card) => card.id !== cardId) }
                : column,
        );
        this.state = { ...this.state, columns: nextColumns };
    }

    moveCard(cardId: string, fromColumn: string, toColumn: string, toIndex?: number): void {
        const ensureColumns = (columns: readonly ColumnState[], columnName: string): readonly ColumnState[] => {
            const target = normalizeName(columnName);
            const exists = columns.some((column) => normalizeName(column.name) === target);
            return exists ? columns : [...columns, { name: columnName, cards: [] }];
        };

        const withDestination = ensureColumns(this.state.columns, toColumn);
        const findIndex = (columns: readonly ColumnState[], columnName: string): number => {
            const target = normalizeName(columnName);
            return columns.findIndex((column) => normalizeName(column.name) === target);
        };

        const fromIndex = findIndex(withDestination, fromColumn);
        if (fromIndex < 0) throw new Error(`Column not found: ${fromColumn}`);
        const fromState = withDestination[fromIndex]!;
        const cardIndex = fromState.cards.findIndex((card) => card.id === cardId);
        if (cardIndex < 0) throw new Error('Card not found in source column');
        const card = fromState.cards[cardIndex]!;

        const withoutCard = withDestination.map((column, index) =>
            index === fromIndex ? { ...column, cards: column.cards.filter((_, idx) => idx !== cardIndex) } : column,
        );

        const toIndexResolved = findIndex(withoutCard, toColumn);
        if (toIndexResolved < 0) throw new Error(`Column not found: ${toColumn}`);
        const destination = withoutCard[toIndexResolved]!;
        const insertAt = clamp(toIndex ?? destination.cards.length, 0, destination.cards.length);
        const nextDestinationCards = [
            ...destination.cards.slice(0, insertAt),
            card,
            ...destination.cards.slice(insertAt),
        ];

        const nextColumns = withoutCard.map((column, index) =>
            index === toIndexResolved ? { ...column, cards: nextDestinationCards } : column,
        );
        this.state = { ...this.state, columns: nextColumns };
    }

    updateCard(cardId: string, patch: Partial<Omit<Card, 'id'>>): void {
        const locate = this.state.columns.reduce<
            { readonly columnIndex: number; readonly cardIndex: number } | undefined
        >((found, column, columnIndex) => {
            if (found) return found;
            const index = column.cards.findIndex((card) => card.id === cardId);
            return index >= 0 ? { columnIndex, cardIndex: index } : undefined;
        }, undefined);
        if (!locate) throw new Error('Card not found');
        const { columnIndex, cardIndex } = locate;
        const updatedColumns = this.state.columns.map((column, idx) => {
            if (idx !== columnIndex) return column;
            return {
                ...column,
                cards: column.cards.map((card, innerIndex) => {
                    if (innerIndex !== cardIndex) return card;
                    return {
                        ...card,
                        ...(patch.text ? { text: patch.text.trim() } : {}),
                        ...(patch.done !== undefined ? { done: Boolean(patch.done) } : {}),
                        ...(patch.tags ? { tags: [...normalizeTags(patch.tags)] } : {}),
                        ...(patch.links ? { links: [...normalizeLinks(patch.links)] } : {}),
                        ...(patch.attrs ? { attrs: normalizeAttrs(patch.attrs) } : {}),
                    };
                }),
            };
        });
        this.state = { ...this.state, columns: updatedColumns };
    }

    findCards(query: { readonly textIncludes?: string; readonly tag?: string; readonly done?: boolean }): readonly {
        readonly column: string;
        readonly card: Card;
    }[] {
        const text = query.textIncludes?.toLowerCase() ?? null;
        const tag = query.tag ? query.tag.trim() : null;
        const done = query.done;
        return this.state.columns.flatMap((column) =>
            column.cards
                .filter(
                    (card) =>
                        (text ? card.text.toLowerCase().includes(text) : true) &&
                        (typeof done === 'boolean' ? card.done === done : true) &&
                        (tag ? card.tags.includes(tag.replace(/^#/u, '')) : true),
                )
                .map((card) => ({ column: column.name, card: cloneCard(card) })),
        );
    }

    async toMarkdown(): Promise<string> {
        const blocks = this.state.columns.map((column) => {
            const header = `## ${column.name}`;
            const cards = column.cards.map(formatCardLine);
            return [header, ...cards].join('\n');
        });
        const boardMarkdown = blocks.join('\n');
        const withFrontmatter = matter.stringify(boardMarkdown, this.state.frontmatter);
        const settingsBlock = formatSettingsBlock(this.state.settings);
        const result = settingsBlock
            ? `${settingsBlock}${withFrontmatter.startsWith('\n') ? '' : '\n'}${withFrontmatter}`
            : withFrontmatter;
        return result.replace(/\n{3,}/gu, '\n\n').trimEnd();
    }
}
