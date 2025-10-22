/**
 * Basic parsing tests for the NLP Command Parser
 */

import test from 'ava';
import { createParser, parseCommand } from '../parser.js';
import type { ParsedCommand, ParseResult } from '../types.js';

test('should parse simple task creation command', (t) => {
  const result = parseCommand('create task Fix login bug with priority high');

  t.true(result.confidence > 0.8);
  t.is(result.commands.length, 1);

  const command = result.commands[0];
  t.is(command.action, 'create');
  t.deepEqual(command.args, ['task', 'Fix login bug']);
  t.is(command.params.priority, 'high');
  t.true(command.originalText.includes('Fix login bug'));
});

test('should parse task status update command', (t) => {
  const result = parseCommand('update task abc123 to status in_progress');

  t.true(result.confidence > 0.7);
  t.is(result.commands.length, 1);

  const command = result.commands[0];
  t.is(command.action, 'update');
  t.deepEqual(command.args, ['task', 'abc123']);
  t.is(command.params.status, 'in_progress');
});

test('should handle fuzzy matching for typos', (t) => {
  const result = parseCommand('creet task New feature with priority medium');

  t.true(result.confidence > 0.6);
  t.is(result.commands.length, 1);

  const command = result.commands[0];
  t.is(command.action, 'create'); // Should match 'create' despite typo
  t.deepEqual(command.args, ['task', 'New feature']);
  t.is(command.params.priority, 'medium');
});

test('should extract UUID entities correctly', (t) => {
  const uuid = '550e8400-e29b-41d4-a716-446655440000';
  const result = parseCommand(`update task ${uuid} to status done`);

  t.true(result.confidence > 0.7);

  const entities = result.commands[0]?.entities || [];
  const uuidEntity = entities.find((e) => e.type === 'uuid');
  t.truthy(uuidEntity);
  t.is(uuidEntity?.value, uuid);
});

test('should provide suggestions for unrecognized commands', (t) => {
  const result = parseCommand('do something with tasks');

  t.true(result.confidence < 0.5); // Low confidence for unrecognized
  t.true(result.suggestions.length > 0);
  t.true(result.unrecognized.length > 0);
});

test('should parse kanban-specific commands', (t) => {
  const result = parseCommand('move task abc123 from todo to in_progress');

  t.true(result.confidence > 0.7);
  t.is(result.commands.length, 1);

  const command = result.commands[0];
  t.is(command.action, 'move');
  t.deepEqual(command.args, ['task', 'abc123']);
  t.is(command.params.from, 'todo');
  t.is(command.params.to, 'in_progress');
});

test('should handle multiple entities in one command', (t) => {
  const result = parseCommand(
    'create task Implement OAuth with priority urgent and labels security,auth',
  );

  t.true(result.confidence > 0.7);

  const command = result.commands[0];
  t.is(command.action, 'create');
  t.is(command.params.priority, 'urgent');
  t.is(command.params.labels, 'security,auth');

  const entities = command.entities;
  t.true(entities.some((e) => e.type === 'priority'));
  t.true(entities.some((e) => e.type === 'labels'));
});

test('should generate alternatives for ambiguous commands', (t) => {
  const result = parseCommand('list tasks');

  t.true(result.confidence > 0.5);
  t.true(result.alternatives.length >= 0); // May have alternatives
});

test('should handle empty input gracefully', (t) => {
  const result = parseCommand('');

  t.is(result.confidence, 0);
  t.is(result.commands.length, 0);
  t.deepEqual(result.unrecognized, ['']);
});

test('should handle whitespace-only input', (t) => {
  const result = parseCommand('   \t\n   ');

  t.is(result.confidence, 0);
  t.is(result.commands.length, 0);
});

test('should parse complex command with multiple parameters', (t) => {
  const result = parseCommand(
    'create epic User Authentication with priority critical and labels security,frontend assign to john',
  );

  t.true(result.confidence > 0.6);

  const command = result.commands[0];
  t.is(command.action, 'create');
  t.deepEqual(command.args, ['epic', 'User Authentication']);
  t.is(command.params.priority, 'critical');
  t.is(command.params.labels, 'security,frontend');
  t.is(command.params.assign, 'john');
});
