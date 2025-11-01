/**
 * Load board action
 * Extracted from MarkdownBoard.load method
 */

import { parseMarkdown } from '../../serializers/index.js';
import type { LoadBoardInput, LoadBoardOutput } from '../types/index.js';

export type LoadBoardScope = {
  readonly parseMarkdown: typeof parseMarkdown;
};

export const loadBoard = (input: LoadBoardInput, scope?: LoadBoardScope): LoadBoardOutput => {
  const { markdown } = input;
  const parser = scope?.parseMarkdown ?? parseMarkdown;
  const { columns, frontmatter, settings } = parser({ markdown });

  return {
    board: {
      columns,
      frontmatter,
      settings,
    },
  };
};
