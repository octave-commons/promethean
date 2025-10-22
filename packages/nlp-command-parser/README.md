# @promethean/nlp-command-parser

A comprehensive natural language command parser for converting conversational input into structured commands for the Promethean kanban system and other CLI tools.

## Features

- **Natural Language Understanding**: Parse conversational commands like "create task Fix login bug with priority high"
- **Entity Extraction**: Automatically extract UUIDs, priorities, statuses, labels, and other entities
- **Fuzzy Matching**: Handle common typos and variations (e.g., "creet" → "create")
- **Synonym Support**: Understand multiple ways to express the same command
- **Confidence Scoring**: Provide confidence levels for parsed results
- **Alternative Suggestions**: Offer alternative interpretations for ambiguous input
- **Extensible Patterns**: Easy to add new command patterns and entities

## Installation

```bash
pnpm add @promethean/nlp-command-parser
```

## Quick Start

```typescript
import { parseCommand } from '@promethean/nlp-command-parser';

const result = parseCommand('create task Fix login bug with priority high');

console.log(result);
// Output:
// {
//   commands: [{
//     action: 'create',
//     args: ['task', 'Fix login bug'],
//     params: { priority: 'high' },
//     confidence: 0.95,
//     originalText: 'create task Fix login bug with priority high',
//     entities: [...]
//   }],
//   alternatives: [],
//   unrecognized: [],
//   suggestions: [],
//   confidence: 0.95
// }
```

## API Reference

### `parseCommand(input, config?)`

Parse a natural language command into structured output.

**Parameters:**

- `input: string` - The natural language command to parse
- `config?: Partial<ParserConfig>` - Optional configuration overrides

**Returns:** `ParseResult`

### `createParser(config?)`

Create a configurable parser instance.

**Parameters:**

- `config?: Partial<ParserConfig>` - Optional configuration

**Returns:** `NaturalLanguageParser`

## Supported Commands

### Task Management

- `create task <title> [with priority <level>] [and labels <labels>]`
- `update task <id> to status <status>`
- `delete task <id>`
- `list tasks [with status <status>]`

### Kanban Operations

- `move task <id> from <column> to <column>`
- `update status of task <id> to <status>`
- `assign task <id> to <person>`

### Epic Management

- `create epic <title> [with priority <level>]`
- `break down epic <id> into tasks`
- `add task <title> to epic <id>`

### Utilities

- `search [tasks|epics] [with] <query>`
- `show board [status]`
- `help [command]`

## Entity Types

The parser automatically extracts these entities:

- **UUID**: Full UUIDs like `550e8400-e29b-41d4-a716-446655440000`
- **Short ID**: Short identifiers like `abc123`
- **Priority**: `P0-P4`, `critical`, `high`, `medium`, `low`, `urgent`, `important`
- **Status**: `incoming`, `accepted`, `breakdown`, `ready`, `todo`, `in_progress`, `in_review`, `review`, `document`, `done`, `blocked`, `rejected`
- **Labels**: Comma-separated label lists

## Configuration

```typescript
const parser = createParser({
  confidenceThreshold: 0.7, // Minimum confidence for matches
  enableFuzzyMatching: true, // Enable typo correction
  maxSuggestions: 5, // Max alternative suggestions
  customPatterns: [
    // Add custom patterns
    {
      id: 'custom-deploy',
      command: 'deploy',
      pattern: /deploy\s+(.+?)\s+to\s+(.+?)(?:\s+with\s+(.+?))?$/i,
      template: ['target', 'environment', 'options'],
      paramMapping: { 1: 'target', 2: 'environment', 3: 'options' },
      help: 'deploy <target> to <environment> [with <options>]',
    },
  ],
});
```

## Examples

### Basic Task Creation

```typescript
parseCommand('create task Implement OAuth with priority urgent');
// → { action: 'create', args: ['task', 'Implement OAuth'], params: { priority: 'urgent' } }
```

### Status Updates

```typescript
parseCommand('move task abc123 from todo to in_progress');
// → { action: 'move', args: ['task', 'abc123'], params: { from: 'todo', to: 'in_progress' } }
```

### Complex Commands

```typescript
parseCommand(
  'create epic User Authentication with priority critical and labels security,frontend assign to john',
);
// → {
//     action: 'create',
//     args: ['epic', 'User Authentication'],
//     params: {
//       priority: 'critical',
//       labels: 'security,frontend',
//       assign: 'john'
//     }
//   }
```

### Fuzzy Matching

```typescript
parseCommand('creet task New feature'); // Typo in "create"
// → { action: 'create', args: ['task', 'New feature'], confidence: 0.7 }
```

## Integration with Kanban

The parser outputs structured commands that can be directly mapped to kanban operations:

```typescript
import { parseCommand } from '@promethean/nlp-command-parser';
import { updateTaskStatus } from '@promethean/kanban';

function handleNaturalLanguageCommand(input: string) {
  const result = parseCommand(input);

  for (const command of result.commands) {
    switch (command.action) {
      case 'update':
        if (command.params.status) {
          updateTaskStatus(command.args[1], command.params.status);
        }
        break;
      case 'move':
        // Handle move operations
        break;
      // ... other commands
    }
  }

  if (result.suggestions.length > 0) {
    console.log('Did you mean:', result.suggestions.join(', '));
  }
}
```

## Testing

```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run with coverage
pnpm coverage
```

## Contributing

1. Add new command patterns to `src/patterns.ts`
2. Update entity extraction regexes as needed
3. Add comprehensive tests for new patterns
4. Update documentation

## License

GPL-3.0-only
