/**
 * Remove column action
 * Extracted from MarkdownBoard.removeColumn method
 */

import { normalizeName } from '../../utils/index.js';
import type { RemoveColumnInput, RemoveColumnOutput } from '../types/index.js';

export type RemoveColumnScope = {
    readonly normalizeName: typeof normalizeName;
};

export const removeColumn = (input: RemoveColumnInput, scope: RemoveColumnScope = { normalizeName }): RemoveColumnOutput => {
    const { board, name } = input;
    const { normalizeName } = scope;
    
    const target = normalizeName(name);
    const filteredColumns = board.columns.filter((column) => normalizeName(column.name) !== target);
    
    return {
        board: {
            ...board,
            columns: filteredColumns,
        },
    };
};