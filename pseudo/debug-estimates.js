import { parseFrontmatter } from '@promethean/markdown/frontmatter';
import { readFileSync } from 'fs';

const content = readFileSync(
  'docs/agile/tasks/Fix Kanban Column Underscore Normalization Bug.md',
  'utf8',
);
const parsed = parseFrontmatter(content);
console.log('Parsed frontmatter:', JSON.stringify(parsed.data, null, 2));
