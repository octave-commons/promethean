import crypto from 'node:crypto';

import test from 'ava';
import type { ReadonlyDeep } from 'type-fest';

import { buildServer } from '../index.js';

type TokenResponse = ReadonlyDeep<{
  access_token: string;
  refresh_token: string;
}>;

type AccessTokenResponse = ReadonlyDeep<{
  access_token: string;
}>;

type FormFields = Readonly<Record<string, string>>;

type ParsedAuthorize = ReadonlyDeep<{
  code: string;
  state: string;
}>;

const FORM_HEADERS = Object.freeze({
  'content-type': 'application/x-www-form-urlencoded',
});

function createChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

function parseAuthorizeResponse(locationHeader: unknown): ParsedAuthorize {
  if (typeof locationHeader !== 'string') {
    throw new TypeError('redirect location should be present');
  }
  const redirectUrl = new URL(locationHeader);
  const state = redirectUrl.searchParams.get('state');
  const code = redirectUrl.searchParams.get('code');
  if (!state || !code) {
    throw new TypeError('authorization redirect is missing required parameters');
  }
  return { code, state };
}

function assertTokenResponse(body: unknown): asserts body is TokenResponse {
  if (body === null || typeof body !== 'object') {
    throw new TypeError('token response payload is invalid');
  }
  const candidate = body as Record<string, unknown>;
  if (typeof candidate.access_token !== 'string' || typeof candidate.refresh_token !== 'string') {
    throw new TypeError('token response payload is invalid');
  }
}

function assertAccessTokenResponse(body: unknown): asserts body is AccessTokenResponse {
  if (body === null || typeof body !== 'object') {
    throw new TypeError('access token response payload is invalid');
  }
  const candidate = body as Record<string, unknown>;
  if (typeof candidate.access_token !== 'string') {
    throw new TypeError('access token response payload is invalid');
  }
}

function encodeForm(fields: FormFields): string {
  return new URLSearchParams(fields).toString();
}

test('authorization code flow issues and refreshes tokens', async (t) => {
  const app = await buildServer();
  t.teardown(async () => {
    if (typeof app.close === 'function') {
      await app.close();
    }
  });
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = createChallenge(verifier);
  const authorizeResponse = await app.inject({
    method: 'GET',
    url:
      '/oauth/authorize?response_type=code&client_id=test-client&redirect_uri=https://example.com/cb&state=xyz&scope=read&code_challenge=' +
      `${challenge}&code_challenge_method=S256&login_hint=user1`,
  });
  const { code, state } = parseAuthorizeResponse(authorizeResponse.headers.location);
  t.deepEqual({ status: authorizeResponse.statusCode, state }, { status: 302, state: 'xyz' });
  const tokenResponse = await app.inject({
    method: 'POST',
    url: '/oauth/token',
    headers: FORM_HEADERS,
    payload: encodeForm({
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'https://example.com/cb',
      client_id: 'test-client',
      code_verifier: verifier,
    }),
  });
  const tokenBody: unknown = tokenResponse.json();
  assertTokenResponse(tokenBody);
  t.true(
    tokenResponse.statusCode === 200 && Boolean(tokenBody.access_token && tokenBody.refresh_token),
  );

  const refreshResponse = await app.inject({
    method: 'POST',
    url: '/oauth/token',
    headers: FORM_HEADERS,
    payload: encodeForm({
      grant_type: 'refresh_token',
      refresh_token: tokenBody.refresh_token,
      client_id: 'test-client',
    }),
  });
  const refreshBody: unknown = refreshResponse.json();
  assertAccessTokenResponse(refreshBody);
  t.true(refreshResponse.statusCode === 200 && Boolean(refreshBody.access_token));
});
