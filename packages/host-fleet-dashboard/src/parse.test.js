import assert from 'node:assert/strict';
import test from 'node:test';

import { loadTargetsFromEnv, resolveTargetAuthToken } from './config.js';
import { parseCaddyRoutes, parseDockerPsLines } from './parse.js';

test('parseDockerPsLines parses docker ps json lines', () => {
  const rows = parseDockerPsLines([
    JSON.stringify({ ID: 'abc123', Image: 'caddy:2', Names: 'edge-caddy', State: 'running', Status: 'Up 2 hours (healthy)', Ports: '0.0.0.0:443->443/tcp, 80/tcp' }),
    JSON.stringify({ ID: 'def456', Image: 'nats:2', Names: 'battlebussy-nats', State: 'exited', Status: 'Exited (0) 2 days ago', Ports: '' }),
  ].join('\n'));

  assert.deepEqual(rows, [
    {
      id: 'def456',
      image: 'nats:2',
      name: 'battlebussy-nats',
      ports: [],
      state: 'exited',
      status: 'Exited (0) 2 days ago',
    },
    {
      id: 'abc123',
      image: 'caddy:2',
      name: 'edge-caddy',
      ports: ['0.0.0.0:443->443/tcp', '80/tcp'],
      state: 'running',
      status: 'Up 2 hours (healthy)',
    },
  ]);
});

test('parseCaddyRoutes extracts routes from a Caddyfile', () => {
  const routes = parseCaddyRoutes(`
ussy.promethean.rest {
  @api path /v1* /api* /auth* /health
  reverse_proxy @api host.docker.internal:8789
  reverse_proxy host.docker.internal:5174
}

voxx.ussy.promethean.rest {
  reverse_proxy openhax-voxx:8788
}
`);

  assert.equal(routes.length, 3);
  assert.deepEqual(routes.find((route) => route.host === 'ussy.promethean.rest' && route.matcher === '@api'), {
    host: 'ussy.promethean.rest',
    matcher: '@api',
    matchPaths: ['/v1*', '/api*', '/auth*', '/health'],
    upstreams: ['host.docker.internal:8789'],
  });
  assert.deepEqual(routes.find((route) => route.host === 'voxx.ussy.promethean.rest'), {
    host: 'voxx.ussy.promethean.rest',
    matcher: undefined,
    matchPaths: [],
    upstreams: ['openhax-voxx:8788'],
  });
});

test('loadTargetsFromEnv falls back to the default ussy fleet', () => {
  const targets = loadTargetsFromEnv({});
  assert.equal(targets.length, 2);
  assert.equal(targets[0].id, 'ussy');
  assert.equal(targets[0].mode, 'local');
  assert.equal(targets[1].id, 'ussy3');
  assert.equal(targets[1].mode, 'remote-http');
});

test('loadTargetsFromEnv parses configured host targets', () => {
  const targets = loadTargetsFromEnv({
    HOST_FLEET_TARGETS_JSON: JSON.stringify([
      {
        id: 'prod',
        label: 'prod',
        mode: 'local',
        publicBaseUrl: 'https://ussy.promethean.rest/fleet/',
        routeFiles: ['/a', '/b'],
        authTokenEnv: 'HOST_TOKEN_PROD',
      },
      {
        id: 'stage',
        label: 'stage',
        mode: 'remote-http',
        publicBaseUrl: 'https://ussy3.promethean.rest/fleet',
      },
    ]),
  });

  assert.deepEqual(targets, [
    {
      id: 'prod',
      label: 'prod',
      mode: 'local',
      publicBaseUrl: 'https://ussy.promethean.rest/fleet',
      routeFiles: ['/a', '/b'],
      notes: undefined,
      authToken: undefined,
      authTokenEnv: 'HOST_TOKEN_PROD',
    },
    {
      id: 'stage',
      label: 'stage',
      mode: 'remote-http',
      publicBaseUrl: 'https://ussy3.promethean.rest/fleet',
      routeFiles: [],
      notes: undefined,
      authToken: undefined,
      authTokenEnv: undefined,
    },
  ]);
});

test('resolveTargetAuthToken prefers target env token then falls back to dashboard token', () => {
  const token = resolveTargetAuthToken(
    { authTokenEnv: 'HOST_TOKEN_STAGE' },
    { HOST_TOKEN_STAGE: 'stage-token' },
    'fallback-token',
  );
  assert.equal(token, 'stage-token');

  const fallback = resolveTargetAuthToken({}, {}, 'fallback-token');
  assert.equal(fallback, 'fallback-token');
});
