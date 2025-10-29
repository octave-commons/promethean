/**
 * Load board action
 * Extracted from MarkdownBoard.load method
 */

import { parseMarkdown } from '../../serializers/index.js';
import type { LoadBoardInput, LoadBoardOutput } from '../types/index.js';

export type LoadBoardScope = {
    readonly parseMarkdown: typeof parseMarkdown;
};

export const loadBoard = (input: LoadBoardInput, scope: LoadBoardScope = { parseMarkdown }): LoadBoardOutput => {
    const { markdown } = input;
    const { columns, frontmatter, settings } = scope.parseMarkdown({ markdown });
    
    return {
        board: {
            columns,
            frontmatter,
            settings,
        },
    };
};