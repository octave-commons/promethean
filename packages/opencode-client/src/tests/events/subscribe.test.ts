import test from 'ava';
import sinon from 'sinon';
import { subscribe } from '../../actions/events/subscribe.js';
import type { EventClient } from '../../types/index.js';

test.beforeEach(() => {
  sinon.restore();
});

test.serial('subscribe returns success when client supports events', async (t) => {
  const mockClient: EventClient = {
    event: {
      subscribe: sinon.stub().resolves(),
    },
  } as any;

  const result = await subscribe({
    eventType: 'test-event',
    sessionId: 'session-123',
    client: mockClient,
  });

  t.true(result.success);
  t.is(result.subscription, 'Event subscription established');
  t.is(result.eventType, 'test-event');
  t.is(result.sessionId, 'session-123');
  t.is(result.note, 'Use the returned async generator to listen for events');
  t.is(result.error, undefined);
  t.true((mockClient.event!.subscribe as sinon.SinonStub).calledOnce);
});

test.serial('subscribe returns success with minimal parameters', async (t) => {
  const mockClient: EventClient = {
    event: {
      subscribe: sinon.stub().resolves(),
    },
  } as any;

  const result = await subscribe({
    client: mockClient,
  });

  t.true(result.success);
  t.is(result.subscription, 'Event subscription established');
  t.is(result.eventType, undefined);
  t.is(result.sessionId, undefined);
  t.is(result.note, 'Use the returned async generator to listen for events');
  t.true((mockClient.event!.subscribe as sinon.SinonStub).calledOnce);
});

test.serial('subscribe returns error when client does not support events', async (t) => {
  const mockClient: EventClient = {} as any;

  const result = await subscribe({
    eventType: 'test-event',
    sessionId: 'session-123',
    client: mockClient,
  });

  t.false(result.success);
  t.is(result.error, 'Events subscription not supported by this client');
  t.is(result.subscription, undefined);
  t.is(result.eventType, undefined);
  t.is(result.sessionId, undefined);
  t.is(result.note, undefined);
});

test.serial('subscribe handles subscription errors gracefully', async (t) => {
  const errorMessage = 'Subscription failed';
  const mockClient: EventClient = {
    event: {
      subscribe: sinon.stub().rejects(new Error(errorMessage)),
    },
  } as any;

  const result = await subscribe({
    eventType: 'test-event',
    sessionId: 'session-123',
    client: mockClient,
  });

  t.false(result.success);
  t.true(result.error?.includes('Failed to subscribe to events'));
  t.true(result.error?.includes(errorMessage));
  t.is(result.subscription, undefined);
  t.is(result.eventType, undefined);
  t.is(result.sessionId, undefined);
  t.is(result.note, undefined);
  t.true((mockClient.event!.subscribe as sinon.SinonStub).calledOnce);
});

test.serial('subscribe handles non-Error objects in catch block', async (t) => {
  const mockClient: EventClient = {
    event: {
      subscribe: sinon.stub().rejects('String error'),
    },
  } as any;

  const result = await subscribe({
    client: mockClient,
  });

  t.false(result.success);
  t.true(result.error?.includes('Failed to subscribe to events'));
  t.true(result.error?.includes('String error'));
  t.true((mockClient.event!.subscribe as sinon.SinonStub).calledOnce);
});

test.serial('subscribe handles null error objects', async (t) => {
  const mockClient: EventClient = {
    event: {
      subscribe: sinon.stub().rejects(null),
    },
  } as any;

  const result = await subscribe({
    client: mockClient,
  });

  t.false(result.success);
  t.true(result.error?.includes('Failed to subscribe to events'));
  t.true((mockClient.event!.subscribe as sinon.SinonStub).calledOnce);
});
