/**
 * Move card action
 * Extracted from MarkdownBoard.moveCard method
 */

import { clamp, normalizeName } from '../../utils/index.js';
import type { MoveCardInput, MoveCardOutput, ColumnState, Card } from '../types/index.js';

export type MoveCardScope = {
    readonly clamp: typeof clamp;
    readonly normalizeName: typeof normalizeName;
};

export const moveCard = (input: MoveCardInput, scope: MoveCardScope = { clamp, normalizeName }): MoveCardOutput => {
    const { board, cardId, fromColumn, toColumn, toIndex } = input;
    const { clamp, normalizeName } = scope;
    
    const ensureColumns = (columns: readonly ColumnState[], columnName: string): readonly ColumnState[] => {
        const target = normalizeName(columnName);
        const exists = columns.some((column) => normalizeName(column.name) === target);
        return exists ? columns : [...columns, { name: columnName, cards: [] }];
    };
    
    const withDestination = ensureColumns(board.columns, toColumn);
    
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
        index === fromIndex 
            ? { ...column, cards: column.cards.filter((_, idx) => idx !== cardIndex) } 
            : column,
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
        index === toIndexResolved 
            ? { ...column, cards: nextDestinationCards } 
            : column,
    );
    
    return {
        board: {
            ...board,
            columns: nextColumns,
        },
    };
};