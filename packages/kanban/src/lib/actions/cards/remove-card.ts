/**
 * Remove card action
 * Extracted from MarkdownBoard.removeCard method
 */

import { normalizeName } from '../../utils/index.js';
import type { RemoveCardInput, RemoveCardOutput, ColumnState } from '../types/index.js';

export type RemoveCardScope = {
    readonly normalizeName: typeof normalizeName;
};

export const removeCard = (input: RemoveCardInput, scope: RemoveCardScope = { normalizeName }): RemoveCardOutput => {
    const { board, columnName, cardId } = input;
    const { normalizeName } = scope;
    
    const target = normalizeName(columnName);
    const nextColumns = board.columns.map((column) =>
        normalizeName(column.name) === target
            ? { ...column, cards: column.cards.filter((card) => card.id !== cardId) }
            : column,
    );
    
    return {
        board: {
            ...board,
            columns: nextColumns,
        },
    };
};