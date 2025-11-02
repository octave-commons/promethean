/**
 * Create column action
 * Extracted from MarkdownBoard.addColumn method
 */

import { clamp, normalizeName } from '../../utils/index.js';
import type { CreateColumnInput, CreateColumnOutput, ColumnState } from '../types/index.js';

export type CreateColumnScope = {
    readonly clamp: typeof clamp;
    readonly normalizeName: typeof normalizeName;
};

export const createColumn = (input: CreateColumnInput, scope: CreateColumnScope = { clamp, normalizeName }): CreateColumnOutput => {
    const { board, name, position } = input;
    const { clamp, normalizeName } = scope;
    
    const exists = board.columns.some((column) => normalizeName(column.name) === normalizeName(name));
    if (exists) {
        return {
            board,
            column: { name, _headingIndex: -1 },
        };
    }
    
    const index = typeof position === 'number' 
        ? clamp(position, 0, board.columns.length) 
        : board.columns.length;
    
    const newColumn: ColumnState = { name, cards: [] };
    const before = board.columns.slice(0, index);
    const after = board.columns.slice(index);
    
    return {
        board: {
            ...board,
            columns: [...before, newColumn, ...after],
        },
        column: { name, _headingIndex: index },
    };
};