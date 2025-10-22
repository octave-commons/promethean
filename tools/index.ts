interface ToolRegistry {
  [key: string]: unknown;
}

const tools: ToolRegistry = {};

// Function that violates max-lines-per-function rule (50 lines max)
function createLongFunction(): string {
  let result = '';
  result += 'line 1\n';
  result += 'line 2\n';
  result += 'line 3\n';
  result += 'line 4\n';
  result += 'line 5\n';
  result += 'line 6\n';
  result += 'line 7\n';
  result += 'line 8\n';
  result += 'line 9\n';
  result += 'line 10\n';
  result += 'line 11\n';
  result += 'line 12\n';
  result += 'line 13\n';
  result += 'line 14\n';
  result += 'line 15\n';
  result += 'line 16\n';
  result += 'line 17\n';
  result += 'line 18\n';
  result += 'line 19\n';
  result += 'line 20\n';
  result += 'line 21\n';
  result += 'line 22\n';
  result += 'line 23\n';
  result += 'line 24\n';
  result += 'line 25\n';
  result += 'line 26\n';
  result += 'line 27\n';
  result += 'line 28\n';
  result += 'line 29\n';
  result += 'line 30\n';
  result += 'line 31\n';
  result += 'line 32\n';
  result += 'line 33\n';
  result += 'line 34\n';
  result += 'line 35\n';
  result += 'line 36\n';
  result += 'line 37\n';
  result += 'line 38\n';
  result += 'line 39\n';
  result += 'line 40\n';
  result += 'line 41\n';
  result += 'line 42\n';
  result += 'line 43\n';
  result += 'line 44\n';
  result += 'line 45\n';
  result += 'line 46\n';
  result += 'line 47\n';
  result += 'line 48\n';
  result += 'line 49\n';
  result += 'line 50\n';
  result += 'line 51\n';
  return result;
}

export default tools;
