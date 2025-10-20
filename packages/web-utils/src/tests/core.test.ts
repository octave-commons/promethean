import test from 'ava';
import Fastify from 'fastify';

import { registerHealthRoute, registerDiagnosticsRoute } from '../core.js';

test('health route returns healthy status', async (t) => {
  const app = Fastify();
  await registerHealthRoute(app, { serviceName: 'test-service' });
  await app.ready();
  const res = await app.inject('/health');
  t.is(res.statusCode, 200);
  const body = res.json();
  t.is(body.status, 'healthy');
  t.is(body.service, 'test-service');
});

test('diagnostics route exposes runtime info', async (t) => {
  const app = Fastify();
  await registerDiagnosticsRoute(app, { serviceName: 'test-service' });
  await app.ready();
  const res = await app.inject('/diagnostics');
  t.is(res.statusCode, 200);
  const body = res.json();
  t.is(body.service, 'test-service');
  t.truthy(body.uptime);
  t.truthy(body.memory);
});
