import test from 'ava';
import { NaturalLanguageCommandParser } from '../parser.js';
import { CommandSchema, ParseResultSchema } from '../parser.js';

const parser = new NaturalLanguageCommandParser();

test('parser initialization', async (t) => {
  t.truthy(parser);
  t.is(typeof parser.parse, 'function');
  t.is(typeof parser.getSupportedCommands, 'function');
  t.is(typeof parser.registerCommand, 'function');
  t.is(typeof parser.getSuggestions, 'function');
});

test('parse start commands', async (t) => {
  const testCases = [
    'start agent agent1',
    'launch service monitoring',
    'run workflow backup',
    'begin agent test',
    'execute service logger'
  ];
  
  for (const input of testCases) {
    const result = await parser.parse(input);
    t.true(result.success, `Failed to parse: ${input}`);
    t.is(result.command?.type, 'start', `Wrong command type for: ${input}`);
    t.truthy(result.command?.target, `No target found for: ${input}`);
  }
});

test('parse stop commands', async (t) => {
  const testCases = [
    'stop agent agent1',
    'shutdown service monitoring',
    'terminate workflow backup',
    'kill agent test',
    'end service logger'
  ];
  
  for (const input of testCases) {
    const result = await parser.parse(input);
    t.true(result.success, `Failed to parse: ${input}`);
    t.is(result.command?.type, 'stop', `Wrong command type for: ${input}`);
    t.truthy(result.command?.target, `No target found for: ${input}`);
  }
});

test('parse status commands', async (t) => {
  const testCases = [
    'status agent agent1',
    'check service monitoring',
    'info workflow backup',
    'get status of agent test',
    'show service logger'
  ];
  
  for (const input of testCases) {
    const result = await parser.parse(input);
    t.true(result.success, `Failed to parse: ${input}`);
    t.is(result.command?.type, 'status', `Wrong command type for: ${input}`);
    t.truthy(result.command?.target, `No target found for: ${input}`);
  }
});

test('parse configure commands', async (t) => {
  const testCases = [
    'configure agent agent1',
    'setup service monitoring',
    'adjust workflow backup',
    'modify agent test',
    'settings service logger'
  ];
  
  for (const input of testCases) {
    const result = await parser.parse(input);
    t.true(result.success, `Failed to parse: ${input}`);
    t.is(result.command?.type, 'configure', `Wrong command type for: ${input}`);
    t.truthy(result.command?.target, `No target found for: ${input}`);
  }
});

test('parse help commands', async (t) => {
  const testCases = [
    'help',
    'assist',
    'guide',
    'how to start an agent',
    'usage of status command'
  ];
  
  for (const input of testCases) {
    const result = await parser.parse(input);
    t.true(result.success, `Failed to parse: ${input}`);
    t.is(result.command?.type, 'help', `Wrong command type for: ${input}`);
  }
});

test('extract parameters from commands', async (t) => {
  const testCases = [
    {
      input: 'start agent agent1 name=agent1 memory=512MB',
      expectedParams: { name: 'agent1', memory: '512MB' }
    },
    {
      input: 'configure service monitoring interval 30s timeout 60s',
      expectedParams: { interval: '30s', timeout: '60s' }
    },
    {
      input: 'stop agent agent1 force=true',
      expectedParams: { force: 'true' }
    }
  ];
  
  for (const { input, expectedParams } of testCases) {
    const result = await parser.parse(input);
    t.true(result.success, `Failed to parse: ${input}`);
    t.deepEqual(result.command?.parameters, expectedParams, `Wrong parameters for: ${input}`);
  }
});

test('handle invalid input gracefully', async (t) => {
  const invalidInputs = [
    '',
    'xyz123 invalid command',
    'not a command at all',
    'random words without meaning'
  ];
  
  for (const input of invalidInputs) {
    const result = await parser.parse(input);
    t.false(result.success, `Should have failed for: ${input}`);
    t.truthy(result.error, `Should have error message for: ${input}`);
    t.truthy(result.suggestions, `Should have suggestions for: ${input}`);
  }
});

test('provide suggestions for ambiguous input', async (t) => {
  const result = await parser.parse('strt agent agent1'); // typo for 'start'
  
  t.false(result.success);
  t.truthy(result.suggestions);
  t.true(result.suggestions!.length > 0);
});

test('validate command schema', async (t) => {
  const result = await parser.parse('start agent agent1');
  
  t.true(result.success);
  
  const validation = CommandSchema.safeParse(result.command);
  t.true(validation.success, `Command should match schema: ${JSON.stringify(validation.error)}`);
});

test('validate parse result schema', async (t) => {
  const result = await parser.parse('start agent agent1');
  
  const validation = ParseResultSchema.safeParse(result);
  t.true(validation.success, `Parse result should match schema: ${JSON.stringify(validation.error)}`);
});

test('confidence scoring', async (t) => {
  const highConfidenceInput = 'start agent agent1';
  const lowConfidenceInput = 'xyz123 random words';
  
  const highResult = await parser.parse(highConfidenceInput);
  const lowResult = await parser.parse(lowConfidenceInput);
  
  if (highResult.success) {
    t.true(highResult.command!.context!.confidence > 0.5);
  }
  
  if (!lowResult.success) {
    t.true(lowResult.suggestions!.length > 0);
  }
});

test('get supported commands', (t) => {
  const commands = parser.getSupportedCommands();
  
  t.truthy(commands);
  t.true(typeof commands === 'object');
  t.truthy(commands.start);
  t.truthy(commands.stop);
  t.truthy(commands.status);
  t.truthy(commands.help);
  
  // Check structure
  t.truthy(commands.start.description);
  t.truthy(commands.start.parameters);
  t.truthy(Array.isArray(commands.start.examples));
});

test('register custom command', async (t) => {
  const customCommand = {
    description: 'Custom test command',
    parameters: {
      target: 'string',
      action: 'string'
    }
  };
  
  parser.registerCommand('test', customCommand, ['test target action']);
  
  const commands = parser.getSupportedCommands();
  t.truthy(commands.test);
  t.is(commands.test.description, 'Custom test command');
  
  const result = await parser.parse('test target action');
  t.true(result.success);
  t.is(result.command?.type, 'test');
});

test('get suggestions', async (t) => {
  const suggestions = await parser.getSuggestions('strt');
  
  t.true(Array.isArray(suggestions));
  t.true(suggestions.length > 0);
});

test('command ID generation', async (t) => {
  const result1 = await parser.parse('start agent agent1');
  const result2 = await parser.parse('start agent agent2');
  
  t.true(result1.success);
  t.true(result2.success);
  t.not(result1.command!.id, result2.command!.id);
});

test('context handling', async (t) => {
  const result = await parser.parse('start agent agent1');
  
  t.true(result.success);
  t.truthy(result.command!.context);
  t.truthy(typeof result.command!.context!.confidence === 'number');
  t.false(result.command!.context!.requiresClarification);
});

test('edge cases', async (t) => {
  const edgeCases = [
    'START AGENT AGENT1', // uppercase
    '  start   agent   agent1  ', // extra spaces
    'start agent agent1!', // punctuation
    'start agent agent1?', // punctuation
    'start-agent-agent1', // hyphens
  ];
  
  for (const input of edgeCases) {
    const result = await parser.parse(input);
    t.true(result.success, `Failed to parse edge case: ${input}`);
    t.is(result.command?.type, 'start', `Wrong type for edge case: ${input}`);
  }
});