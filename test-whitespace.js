// Simple test to reproduce the whitespace issue
import { toFrontmatter } from './packages/kanban/dist/lib/kanban.js';

const task = {
  uuid: 'test-uuid-123',
  title: 'Test Task',
  status: 'todo',
  priority: 'P2',
  labels: ['test'],
  created_at: '2025-10-13T00:00:00.000Z',
  estimates: {
    complexity: 0,
    scale: 0,
    time_to_completion: '0',
  },
  content: '   \n  \t  \n  ', // Test with whitespace-only content
};

console.log('Testing toFrontmatter with empty content:');
const result = toFrontmatter(task);
console.log('Result:');
console.log(JSON.stringify(result));
console.log('\nRaw result:');
console.log(result);

// Check for extra whitespace
const endsWithMultipleNewlines = result.endsWith('\n\n\n');
const hasTripleNewlineAfterFrontmatter = result.includes('---\n\n\n');

console.log(`\nEnds with multiple newlines: ${endsWithMultipleNewlines}`);
console.log(`Has triple newline after frontmatter: ${hasTripleNewlineAfterFrontmatter}`);
