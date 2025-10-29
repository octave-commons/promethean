/**
 * List columns in board action
 * Extracted from MarkdownBoard.listColumns method
 */

import type { ListColumnsInBoardInput, ListColumnsInBoardOutput, Column } from '../types/index.js';

export type ListColumnsInBoardScope = Record<string, never>;

export const listColumnsInBoard = (input: ListColumnsInBoardInput, scope: ListColumnsInBoardScope = {}): ListColumnsInBoardOutput => {
    const { board } = input;
    
    return {
        columns: board.columns.map((column, index) => ({ 
            name: column.name, 
            _headingIndex: index 
        })),
    };
};