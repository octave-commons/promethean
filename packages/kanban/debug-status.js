#!/usr/bin/env node

import { formatCardLine } from './dist/lib/serializers/markdown-formatter.js';
import { parseMarkdown } from './dist/lib/serializers/index.js';

// Test card with status
const card = {
  id: 'test-123',
  text: 'Test task',
  done: false,
  tags: [],
  links: [],
  attrs: {
    status: 'In Progress',
  },
};

console.log('Original card:', JSON.stringify(card, null, 2));

// Format to markdown
const markdownLine = formatCardLine(card);
console.log('Markdown line:', markdownLine);

// Parse it back
const parseResult = parseMarkdown({
  markdown: `## Test Column\n${markdownLine}\n`,
});

console.log('Parsed card:', JSON.stringify(parseResult.columns[0].cards[0], null, 2));

// Check if status is preserved
const parsedStatus = parseResult.columns[0].cards[0].attrs?.status;
console.log('Status preserved:', parsedStatus === 'In Progress' ? '✅' : '❌');
console.log('Expected: In Progress, Got:', parsedStatus);
