import test from 'ava';
import type { Role } from '@promethean-os/pantheon-core';

import {
  generateId,
  generateActorId,
  createMessage,
  createSystemMessage,
  createUserMessage,
  createAssistantMessage,
} from '../../utils/index.js';

test('generateId creates unique IDs', (t) => {
  const id1 = generateId();
  const id2 = generateId();

  t.is(typeof id1, 'string');
  t.is(typeof id2, 'string');
  t.not(id1, id2);
  t.true(id1.length > 0);
  t.true(id2.length > 0);
});

test('generateId format validation', (t) => {
  const id = generateId();

  // Should contain timestamp and random parts
  t.true(id.includes('_'));
  const parts = id.split('_');
  t.is(parts.length, 2);

  // First part should be a timestamp
  const timestamp = parseInt(parts[0] || '0', 10);
  t.true(Number.isInteger(timestamp));
  t.true(timestamp > 0);

  // Second part should be random string
  const randomPart = parts[1];
  if (randomPart) {
    t.true(randomPart.length > 0);
    t.true(/^[a-z0-9]+$/i.test(randomPart));
  }
});

test('generateActorId creates properly formatted IDs', (t) => {
  const actorId = generateActorId('test-actor');

  t.is(typeof actorId, 'string');
  t.true(actorId.startsWith('actor_test-actor_'));

  const parts = actorId.split('_');
  t.is(parts.length, 3);
  t.is(parts[0], 'actor');
  t.is(parts[1], 'test-actor');

  // Third part should contain timestamp and random parts
  const thirdPart = parts[2];
  if (thirdPart) {
    t.true(thirdPart.includes('_'));
  }
});

test('generateActorId sanitizes actor names', (t) => {
  const actorId = generateActorId('Test Actor@#$');

  t.true(actorId.startsWith('actor_test-actor_'));
  t.false(actorId.includes('@'));
  t.false(actorId.includes('#'));
  t.false(actorId.includes('$'));
});

test('createMessage creates valid messages', (t) => {
  const message = createMessage('user', 'Hello world', ['image1.jpg', 'image2.jpg']);

  t.is(message.role, 'user');
  t.is(message.content, 'Hello world');
  t.deepEqual(message.images, ['image1.jpg', 'image2.jpg']);
});

test('createMessage without images', (t) => {
  const message = createMessage('system', 'System prompt');

  t.is(message.role, 'system');
  t.is(message.content, 'System prompt');
  t.is(message.images, undefined);
});

test('createSystemMessage creates system messages', (t) => {
  const message = createSystemMessage('You are a helpful assistant');

  t.is(message.role, 'system');
  t.is(message.content, 'You are a helpful assistant');
});

test('createUserMessage creates user messages', (t) => {
  const message = createUserMessage('Hello, how are you?');

  t.is(message.role, 'user');
  t.is(message.content, 'Hello, how are you?');
});

test('createAssistantMessage creates assistant messages', (t) => {
  const message = createAssistantMessage('I am doing well, thank you!');

  t.is(message.role, 'assistant');
  t.is(message.content, 'I am doing well, thank you!');
});

test('message role validation', (t) => {
  const validRoles: Role[] = ['system', 'user', 'assistant'];

  validRoles.forEach((role) => {
    const message = createMessage(role, `Test ${role} message`);
    t.is(message.role, role);
  });
});
