// SPDX-License-Identifier: GPL-3.0-only

import test from 'ava';

import { createContextTools } from '../tools/context.js';
import { createEventTools } from '../tools/events.js';
import { createReadOnlyMessageTools, createMessageMutationTools } from '../tools/messages.js';
import { createSessionTools } from '../tools/sessions.js';

const stubClient: any = {
  session: {
    message: async () => ({ data: { id: 'msg-1', role: 'assistant', content: 'ok' } }),
    prompt: async () => ({ data: { id: 'msg-2', role: 'assistant', content: 'ack' } }),
  },
};

test('context + event tools expose expected keys', (t) => {
  t.deepEqual(Object.keys(createContextTools()).sort(), ['compile-context', 'search-context']);
  t.deepEqual(Object.keys(createEventTools()), ['list-events']);
});

test('message + session tool builders expose expected keys', (t) => {
  t.deepEqual(Object.keys(createReadOnlyMessageTools(stubClient)).sort(), [
    'get-message',
    'list-messages',
  ]);
  t.deepEqual(Object.keys(createMessageMutationTools(stubClient)), ['send-prompt']);
  t.deepEqual(Object.keys(createSessionTools(stubClient)).sort(), [
    'close-session',
    'get-session',
    'list-sessions',
    'search-sessions',
    'spawn-session',
  ]);
});
