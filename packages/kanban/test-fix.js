// Simple test to verify the formatTableCell fix works
import { formatTableCell, formatTable } from './dist/lib/markdown-output.js';

// Test data
const mockTasks = [
  {
    uuid: '12345678-1234-1234-1234-123456789abc',
    title: 'Test Task One',
    status: 'todo',
  },
  {
    uuid: '87654321-4321-4321-4321-cba987654321',
    title: 'Test Task Two',
    status: 'in_progress',
  },
];

const mockColumnData = {
  name: 'todo',
  count: 2,
  limit: 10,
  tasks: mockTasks,
};

console.log('Testing formatTableCell with Task array:');
const result = formatTableCell(mockTasks);
console.log('Result:', result);
console.log('Contains [object Object]?', result.includes('[object Object]'));

console.log('\nTesting formatTable with ColumnData:');
const tableResult = formatTable([mockColumnData]);
console.log('Result:');
console.log(tableResult);
console.log('Contains [object Object]?', tableResult.includes('[object Object]'));
