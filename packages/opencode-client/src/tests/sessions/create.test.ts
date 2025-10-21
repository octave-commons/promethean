import test from 'ava';
import sinon from 'sinon';
import type { OpencodeClient } from '@opencode-ai/sdk';
import { create, type CreateSessionResult } from '../../actions/sessions/create.js';

test('create session successfully', async (t) => {
  const mockClient = {
    session: {
      create: sinon.stub().resolves({
        data: {
          id: 'test-session-123',
          title: 'Test Session',
          time: {
            created: '2023-01-01T00:00:00.000Z',
          },
        },
      }),
    },
  } as unknown as OpencodeClient;

  const result = await create({
    title: 'Test Session',
    client: mockClient,
  });

  t.true(result.success);
  t.is(result.session.id, 'test-session-123');
  t.is(result.session.title, 'Test Session');
  t.is(result.session.createdAt, '2023-01-01T00:00:00.000Z');
});

test('create session with default title', async (t) => {
  const mockClient = {
    session: {
      create: sinon.stub().resolves({
        data: {
          id: 'test-session-456',
          title: undefined,
          time: {
            created: 1672531200000,
          },
        },
      }),
    },
  } as unknown as OpencodeClient;

  const result = await create({
    client: mockClient,
  });

  t.true(result.success);
  t.is(result.session.id, 'test-session-456');
  t.is(result.session.title, undefined);
  t.is(result.session.createdAt, 1672531200000);
});

test('throws error when client is not provided', async (t) => {
  await t.throwsAsync(async () => create({ title: 'Test' }), {
    message: 'OpenCode client is required for session creation',
  });
});

test('throws error when API call fails', async (t) => {
  const mockClient = {
    session: {
      create: sinon.stub().rejects(new Error('API Error')),
    },
  } as unknown as OpencodeClient;

  await t.throwsAsync(async () => create({ title: 'Test', client: mockClient }), {
    message: 'Failed to create session on OpenCode server: API Error',
  });
});

test('throws error when no session data returned', async (t) => {
  const mockClient = {
    session: {
      create: sinon.stub().resolves({ data: null }),
    },
  } as unknown as OpencodeClient;

  await t.throwsAsync(async () => create({ title: 'Test', client: mockClient }), {
    message: 'No session created',
  });
});

test('handles unknown error types', async (t) => {
  const mockClient = {
    session: {
      create: sinon.stub().rejects('String error'),
    },
  } as unknown as OpencodeClient;

  await t.throwsAsync(async () => create({ title: 'Test', client: mockClient }), {
    message: 'Failed to create session on OpenCode server: String error',
  });
});

test('type checking - result has correct structure', async (t) => {
  const mockClient = {
    session: {
      create: sinon.stub().resolves({
        data: {
          id: 'test',
          title: 'Test',
          time: { created: '2023-01-01T00:00:00.000Z' },
        },
      }),
    },
  } as unknown as OpencodeClient;

  const result = await create({
    title: 'Test',
    client: mockClient,
  });

  // Type assertion to ensure result matches CreateSessionResult
  const typedResult: CreateSessionResult = result;
  t.true(typedResult.success);
  t.is(typeof typedResult.session.id, 'string');
  t.true(
    typedResult.session.createdAt === undefined ||
      typeof typedResult.session.createdAt === 'string' ||
      typeof typedResult.session.createdAt === 'number',
  );
});
