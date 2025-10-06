import test from 'ava';

import { AVAILABLE_COMMANDS, REMOTE_COMMANDS, COMMAND_HANDLERS } from '../cli/command-handlers.js';

test('remote commands mirror available CLI commands except ui', (t) => {
  const expected = AVAILABLE_COMMANDS.filter((command) => command !== 'ui');
  const sortedRemote = [...REMOTE_COMMANDS].sort();
  const sortedExpected = [...expected].sort();
  t.deepEqual(sortedRemote, sortedExpected);
});

test('each available command has a registered handler', (t) => {
  for (const command of AVAILABLE_COMMANDS) {
    t.true(
      typeof COMMAND_HANDLERS[command] === 'function',
      `${command} should map to a command handler`,
    );
  }
});
