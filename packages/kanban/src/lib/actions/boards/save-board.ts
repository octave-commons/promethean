/**
 * Save board action
 * Extracted from MarkdownBoard formatting logic
 */

import { formatMarkdown } from '../../serializers/index.js';
import type { SaveBoardInput, SaveBoardOutput } from '../types/index.js';

export type SaveBoardScope = {
    readonly formatMarkdown: typeof formatMarkdown;
};

export const saveBoard = (input: SaveBoardInput, scope: SaveBoardScope = { formatMarkdown }): SaveBoardOutput => {
    const { board } = input;
    const markdown = scope.formatMarkdown({
        columns: board.columns,
        frontmatter: board.frontmatter,
        settings: board.settings,
    });
    
    return {
        markdown,
    };
};