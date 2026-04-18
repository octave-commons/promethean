import assert from "node:assert/strict";
import test from "node:test";

import { OpenAiOAuthManager } from "../lib/openai-oauth.js";

function jsonResponse(payload: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(payload), {
    status: init.status ?? 200,
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.sig`;
}

test("device polling reuses cached authorized result", async () => {
  let now = 1_000;
  let devicePollCalls = 0;
  let tokenExchangeCalls = 0;

  const manager = new OpenAiOAuthManager({
    now: () => now,
    fetchFn: async (input, init) => {
      const url = String(input);
      if (url.endsWith("/api/accounts/deviceauth/usercode")) {
        return jsonResponse({
          device_auth_id: "device-1",
          user_code: "USER-CODE",
          interval: "5",
        });
      }

      if (url.endsWith("/api/accounts/deviceauth/token")) {
        devicePollCalls += 1;
        return jsonResponse({
          authorization_code: "auth-code-1",
          code_verifier: "verifier-1",
        });
      }

      if (url.endsWith("/oauth/token")) {
        tokenExchangeCalls += 1;
        const bodyText = typeof init?.body === "string" ? init.body : "";
        assert.match(bodyText, /code=auth-code-1/);
        return jsonResponse({
          access_token: makeJwt({ chatgpt_account_id: "acct-1" }),
          refresh_token: "refresh-1",
          expires_in: 3600,
        });
      }

      throw new Error(`Unexpected URL: ${url}`);
    },
  });

  await manager.startDeviceFlow();
  const first = await manager.pollDeviceFlow("device-1", "USER-CODE");
  const second = await manager.pollDeviceFlow("device-1", "USER-CODE");

  assert.equal(first.state, "authorized");
  assert.deepEqual(second, first);
  assert.equal(devicePollCalls, 1);
  assert.equal(tokenExchangeCalls, 1);

  now += 1_000;
  const third = await manager.pollDeviceFlow("device-1", "USER-CODE");
  assert.deepEqual(third, first);
  assert.equal(devicePollCalls, 1);
  assert.equal(tokenExchangeCalls, 1);
});

test("device polling respects cached pending interval", async () => {
  let now = 5_000;
  let devicePollCalls = 0;

  const manager = new OpenAiOAuthManager({
    now: () => now,
    fetchFn: async (input) => {
      const url = String(input);
      if (url.endsWith("/api/accounts/deviceauth/usercode")) {
        return jsonResponse({
          device_auth_id: "device-2",
          user_code: "USER-CODE-2",
          interval: "7",
        });
      }

      if (url.endsWith("/api/accounts/deviceauth/token")) {
        devicePollCalls += 1;
        return jsonResponse({ error: "pending" }, { status: 403 });
      }

      throw new Error(`Unexpected URL: ${url}`);
    },
  });

  await manager.startDeviceFlow();

  const first = await manager.pollDeviceFlow("device-2", "USER-CODE-2");
  const second = await manager.pollDeviceFlow("device-2", "USER-CODE-2");

  assert.deepEqual(first, { state: "pending" });
  assert.deepEqual(second, { state: "pending" });
  assert.equal(devicePollCalls, 1);

  now += 7_001;
  const third = await manager.pollDeviceFlow("device-2", "USER-CODE-2");
  assert.deepEqual(third, { state: "pending" });
  assert.equal(devicePollCalls, 2);
});

test("browser completion reuses cached callback result", async () => {
  let tokenExchangeCalls = 0;

  const manager = new OpenAiOAuthManager({
    fetchFn: async (input) => {
      const url = String(input);
      if (url.endsWith("/oauth/token")) {
        tokenExchangeCalls += 1;
        return jsonResponse({
          id_token: makeJwt({ chatgpt_account_id: "acct-browser" }),
          access_token: "access-browser",
          refresh_token: "refresh-browser",
          expires_in: 1800,
        });
      }

      throw new Error(`Unexpected URL: ${url}`);
    },
  });

  const started = await manager.startBrowserFlow("http://127.0.0.1:8789");
  const first = await manager.completeBrowserFlow(started.state, "browser-code");
  const second = await manager.completeBrowserFlow(started.state, "browser-code");

  assert.deepEqual(second, first);
  assert.equal(tokenExchangeCalls, 1);
});


test("browser flow normalizes loopback callback to localhost auth callback route on the Codex callback port", async () => {
  const manager = new OpenAiOAuthManager();
  const started = await manager.startBrowserFlow("http://127.0.0.1:8789");

  assert.equal(started.redirectUri, "http://localhost:1455/auth/callback");
  assert.match(started.authorizeUrl, /redirect_uri=http%3A%2F%2Flocalhost%3A1455%2Fauth%2Fcallback/);
});

test("browser flow derives distinct storage ids for different identities on the same ChatGPT account", async () => {
  let tokenExchangeCalls = 0;

  const tokenResponses = [
    {
      id_token: makeJwt({ chatgpt_account_id: "acct-shared", sub: "user-a" }),
      access_token: "access-a",
      refresh_token: "refresh-a",
      expires_in: 1800,
    },
    {
      id_token: makeJwt({ chatgpt_account_id: "acct-shared", sub: "user-b" }),
      access_token: "access-b",
      refresh_token: "refresh-b",
      expires_in: 1800,
    },
  ];

  const manager = new OpenAiOAuthManager({
    fetchFn: async (input) => {
      const url = String(input);
      if (url.endsWith("/oauth/token")) {
        const payload = tokenResponses[tokenExchangeCalls];
        tokenExchangeCalls += 1;
        if (!payload) {
          throw new Error("Unexpected extra token exchange");
        }
        return jsonResponse(payload);
      }

      throw new Error(`Unexpected URL: ${url}`);
    },
  });

  const firstStart = await manager.startBrowserFlow("http://127.0.0.1:8789");
  const secondStart = await manager.startBrowserFlow("http://127.0.0.1:8789");
  const first = await manager.completeBrowserFlow(firstStart.state, "browser-code-1");
  const second = await manager.completeBrowserFlow(secondStart.state, "browser-code-2");

  assert.equal(first.chatgptAccountId, "acct-shared");
  assert.equal(second.chatgptAccountId, "acct-shared");
  assert.notEqual(first.accountId, second.accountId);
});
