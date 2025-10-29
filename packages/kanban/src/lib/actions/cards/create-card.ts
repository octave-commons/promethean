/**
 * Create card action
 * Extracted from MarkdownBoard.addCard method
 */

import { normalizeName, normalizeTags, normalizeLinks, normalizeAttrs } from '../../utils/index.js';
import type { CreateCardInput, CreateCardOutput, Card, ColumnState } from '../types/index.js';

const ensureId = (value: string | undefined): string => value ?? crypto.randomUUID();

export type CreateCardScope = {
    readonly normalizeName: typeof normalizeName;
    readonly normalizeTags: typeof normalizeTags;
    readonly normalizeLinks: typeof normalizeLinks;
    readonly normalizeAttrs: typeof normalizeAttrs;
    readonly ensureId: typeof ensureId;
};

export const createCard = (input: CreateCardInput, scope: CreateCardScope = {
    normalizeName,
    normalizeTags,
    normalizeLinks,
    normalizeAttrs,
    ensureId,
}): CreateCardOutput => {
    const { board, columnName, card } = input;
    const { normalizeName, normalizeTags, normalizeLinks, normalizeAttrs, ensureId } = scope;
    
    const target = normalizeName(columnName);
    const columns = board.columns;
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
        columnIndex === resolvedIndex 
            ? { ...column, cards: [...column.cards, nextCard] } 
            : column,
    );
    
    return {
        board: {
            ...board,
            columns: nextColumns,
        },
        cardId,
    };
};