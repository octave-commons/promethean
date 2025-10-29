/**
 * Update card action
 * Extracted from MarkdownBoard.updateCard method
 */

import { normalizeTags, normalizeLinks, normalizeAttrs } from '../../utils/index.js';
import type { UpdateCardInput, UpdateCardOutput, Card, ColumnState } from '../types/index.js';

export type UpdateCardScope = {
    readonly normalizeTags: typeof normalizeTags;
    readonly normalizeLinks: typeof normalizeLinks;
    readonly normalizeAttrs: typeof normalizeAttrs;
};

export const updateCard = (input: UpdateCardInput, scope: UpdateCardScope = {
    normalizeTags,
    normalizeLinks,
    normalizeAttrs,
}): UpdateCardOutput => {
    const { board, cardId, patch } = input;
    const { normalizeTags, normalizeLinks, normalizeAttrs } = scope;
    
    const locate = board.columns.reduce<
        { readonly columnIndex: number; readonly cardIndex: number } | undefined
    >((found, column, columnIndex) => {
        if (found) return found;
        const index = column.cards.findIndex((card) => card.id === cardId);
        return index >= 0 ? { columnIndex, cardIndex: index } : undefined;
    }, undefined);
    
    if (!locate) throw new Error('Card not found');
    
    const { columnIndex, cardIndex } = locate;
    const updatedColumns = board.columns.map((column, idx) => {
        if (idx !== columnIndex) return column;
        
        return {
            ...column,
            cards: column.cards.map((card, cardIdx) =>
                cardIdx === cardIndex
                    ? {
                        ...card,
                        text: patch.text !== undefined ? patch.text.trim() : card.text,
                        done: patch.done !== undefined ? Boolean(patch.done) : card.done,
                        tags: patch.tags !== undefined ? [...normalizeTags(patch.tags)] : card.tags,
                        links: patch.links !== undefined ? [...normalizeLinks(patch.links)] : card.links,
                        attrs: patch.attrs !== undefined ? normalizeAttrs(patch.attrs) : card.attrs,
                    }
                    : card,
            ),
        };
    });
    
    return {
        board: {
            ...board,
            columns: updatedColumns,
        },
    };
};