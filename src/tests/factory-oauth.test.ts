import assert from "node:assert/strict";
import test from "node:test";

import { FactoryOAuthManager } from "../lib/factory-oauth.js";

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

// ─── Device Flow Tests ──────────────────────────────────────────────────────

test("device flow start returns expected shape", async () => {
  const manager = new FactoryOAuthManager({
    fetchFn: async (input, init) => {
      const url = String(input);
      if (url.includes("/user_management/authorize/device")) {
        const bodyText = typeof init?.body === "string" ? init.body : "";
        assert.match(bodyText, /client_id=client_01HNM792M5G5G1A2THWPXKFMXB/);
        return jsonResponse({
          device_code: "dc-test-123",
          user_code: "ABCD-EFGH",
          verification_uri: "https://factory.authkit.app/device",
          verification_uri_complete: "https://factory.authkit.app/device?user_code=ABCD-EFGH",
          expires_in: 300,
          interval: 5,
        });
      }
      throw new Error(`Unexpected URL: ${url}`);
    },
  });

  const result = await manager.startDeviceFlow();

  assert.ok(result.verificationUrl.length > 0, "verificationUrl should not be empty");
  assert.equal(result.userCode, "ABCD-EFGH");
  assert.ok(result.deviceAuthId.length > 0, "deviceAuthId should not be empty");
  assert.equal(result.intervalMs, 5000);
});

test("device flow poll returns authorized with tokens", async () => {
  const fakeAccessToken = makeJwt({
    sub: "user_01TEST",
    email: "test@factory.ai",
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

  let deviceAuthCalls = 0;
  let authenticateCalls = 0;

  const manager = new FactoryOAuthManager({
    fetchFn: async (input) => {
      const url = String(input);
      if (url.includes("/user_management/authorize/device")) {
        deviceAuthCalls += 1;
        return jsonResponse({
          device_code: "dc-poll-test",
          user_code: "POLL-CODE",
          verification_uri: "https://factory.authkit.app/device",
          verification_uri_complete: "https://factory.authkit.app/device?user_code=POLL-CODE",
          expires_in: 300,
          interval: 5,
        });
      }
      if (url.includes("/user_management/authenticate")) {
        authenticateCalls += 1;
        return jsonResponse({
          access_token: fakeAccessToken,
          refresh_token: "rt-new-refresh",
          user: { id: "user_01TEST", email: "test@factory.ai", first_name: "Test", last_name: "User" },
          organization_id: "org_01TEST",
        });
      }
      throw new Error(`Unexpected URL: ${url}`);
    },
  });

  const started = await manager.startDeviceFlow();
  assert.equal(deviceAuthCalls, 1);

  const result = await manager.pollDeviceFlow(started.deviceAuthId);
  assert.equal(result.state, "authorized");
  assert.equal(authenticateCalls, 1);

  if (result.state === "authorized") {
    assert.equal(result.tokens.accessToken, fakeAccessToken);
    assert.equal(result.tokens.refreshToken, "rt-new-refresh");
    assert.ok(result.tokens.accountId.startsWith("factory-"));
    assert.equal(result.tokens.email, "test@factory.ai");
    assert.ok(typeof result.tokens.expiresAt === "number");
  }
});

test("device flow poll returns pending when authorization_pending", async () => {
  let now = 1_000;

  const manager = new FactoryOAuthManager({
    now: () => now,
    fetchFn: async (input) => {
      const url = String(input);
      if (url.includes("/user_management/authorize/device")) {
        return jsonResponse({
          device_code: "dc-pending",
          user_code: "PEND-CODE",
          verification_uri: "https://factory.authkit.app/device",
          verification_uri_complete: "https://factory.authkit.app/device?user_code=PEND-CODE",
          expires_in: 300,
          interval: 5,
        });
      }
      if (url.includes("/user_management/authenticate")) {
        return jsonResponse({ error: "authorization_pending" }, { status: 400 });
      }
      throw new Error(`Unexpected URL: ${url}`);
    },
  });

  const started = await manager.startDeviceFlow();
  const result = await manager.pollDeviceFlow(started.deviceAuthId);
  assert.deepEqual(result, { state: "pending" });

  // Immediate re-poll should return pending from interval throttle
  const result2 = await manager.pollDeviceFlow(started.deviceAuthId);
  assert.deepEqual(result2, { state: "pending" });
});

test("device flow poll returns failed on expired_token", async () => {
  const manager = new FactoryOAuthManager({
    fetchFn: async (input) => {
      const url = String(input);
      if (url.includes("/user_management/authorize/device")) {
        return jsonResponse({
          device_code: "dc-expired",
          user_code: "EXPI-CODE",
          verification_uri: "https://factory.authkit.app/device",
          verification_uri_complete: "https://factory.authkit.app/device?user_code=EXPI-CODE",
          expires_in: 300,
          interval: 5,
        });
      }
      if (url.includes("/user_management/authenticate")) {
        return jsonResponse({ error: "expired_token" }, { status: 400 });
      }
      throw new Error(`Unexpected URL: ${url}`);
    },
  });

  const started = await manager.startDeviceFlow();
  const result = await manager.pollDeviceFlow(started.deviceAuthId);
  assert.equal(result.state, "failed");
  if (result.state === "failed") {
    assert.match(result.reason, /expired_token/);
  }
});

test("device flow poll returns failed for unknown deviceAuthId", async () => {
  const manager = new FactoryOAuthManager();
  const result = await manager.pollDeviceFlow("nonexistent-id");
  assert.equal(result.state, "failed");
  if (result.state === "failed") {
    assert.match(result.reason, /Unknown or expired/);
  }
});

test("device flow start throws on HTTP error", async () => {
  const manager = new FactoryOAuthManager({
    fetchFn: async () => {
      return new Response("Service Unavailable", { status: 503 });
    },
  });

  await assert.rejects(
    manager.startDeviceFlow(),
    (err: Error) => err.message.includes("503"),
  );
});

test("device polling reuses cached authorized result", async () => {
  let now = 1_000;
  let authenticateCalls = 0;

  const fakeAccessToken = makeJwt({ sub: "user_cache", exp: Math.floor(Date.now() / 1000) + 3600 });

  const manager = new FactoryOAuthManager({
    now: () => now,
    fetchFn: async (input) => {
      const url = String(input);
      if (url.includes("/user_management/authorize/device")) {
        return jsonResponse({
          device_code: "dc-cache",
          user_code: "CACHE-CODE",
          verification_uri: "https://factory.authkit.app/device",
          verification_uri_complete: "https://factory.authkit.app/device?user_code=CACHE-CODE",
          expires_in: 300,
          interval: 5,
        });
      }
      if (url.includes("/user_management/authenticate")) {
        authenticateCalls += 1;
        return jsonResponse({
          access_token: fakeAccessToken,
          refresh_token: "rt-cache",
          user: { id: "user_cache", email: "cache@factory.ai" },
        });
      }
      throw new Error(`Unexpected URL: ${url}`);
    },
  });

  const started = await manager.startDeviceFlow();
  const first = await manager.pollDeviceFlow(started.deviceAuthId);
  const second = await manager.pollDeviceFlow(started.deviceAuthId);

  assert.equal(first.state, "authorized");
  assert.deepEqual(second, first);
  assert.equal(authenticateCalls, 1);
});

// ─── Browser Flow Tests ─────────────────────────────────────────────────────

test("browser flow start returns authorizeUrl and state", () => {
  const manager = new FactoryOAuthManager();
  const result = manager.startBrowserFlow("http://127.0.0.1:8789/auth/factory/callback");

  assert.ok(result.authorizeUrl.length > 0, "authorizeUrl should not be empty");
  assert.ok(result.state.length > 0, "state should not be empty");
  assert.match(result.authorizeUrl, /client_id=client_01HNM792M5G5G1A2THWPXKFMXB/);
  assert.match(result.authorizeUrl, /response_type=code/);
  assert.match(result.authorizeUrl, /redirect_uri=/);
  assert.match(result.authorizeUrl, /state=/);
});

test("browser flow callback processes tokens correctly", async () => {
  const fakeAccessToken = makeJwt({
    sub: "user_01BROWSER",
    email: "browser@factory.ai",
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

  let tokenExchangeCalls = 0;

  const manager = new FactoryOAuthManager({
    fetchFn: async (input, init) => {
      const url = String(input);
      if (url.includes("/user_management/authenticate")) {
        tokenExchangeCalls += 1;
        const bodyText = typeof init?.body === "string" ? init.body : "";
        assert.match(bodyText, /grant_type=authorization_code/);
        assert.match(bodyText, /client_id=client_01HNM792M5G5G1A2THWPXKFMXB/);
        assert.match(bodyText, /code=test-auth-code/);
        return jsonResponse({
          access_token: fakeAccessToken,
          refresh_token: "rt-browser-refresh",
          user: { id: "user_01BROWSER", email: "browser@factory.ai", first_name: "Browser", last_name: "User" },
        });
      }
      throw new Error(`Unexpected URL: ${url}`);
    },
  });

  const started = manager.startBrowserFlow("http://127.0.0.1:8789/auth/factory/callback");
  const tokens = await manager.completeBrowserFlow(started.state, "test-auth-code");

  assert.equal(tokenExchangeCalls, 1);
  assert.equal(tokens.accessToken, fakeAccessToken);
  assert.equal(tokens.refreshToken, "rt-browser-refresh");
  assert.ok(tokens.accountId.startsWith("factory-"));
  assert.equal(tokens.email, "browser@factory.ai");
  assert.ok(typeof tokens.expiresAt === "number");
});

test("browser flow completeBrowserFlow reuses cached result", async () => {
  let tokenExchangeCalls = 0;
  const fakeAccessToken = makeJwt({ sub: "user_cached", exp: Math.floor(Date.now() / 1000) + 3600 });

  const manager = new FactoryOAuthManager({
    fetchFn: async (input) => {
      const url = String(input);
      if (url.includes("/user_management/authenticate")) {
        tokenExchangeCalls += 1;
        return jsonResponse({
          access_token: fakeAccessToken,
          refresh_token: "rt-cached",
          user: { id: "user_cached", email: "cached@factory.ai" },
        });
      }
      throw new Error(`Unexpected URL: ${url}`);
    },
  });

  const started = manager.startBrowserFlow("http://127.0.0.1:8789/auth/factory/callback");
  const first = await manager.completeBrowserFlow(started.state, "code-cached");
  const second = await manager.completeBrowserFlow(started.state, "code-cached");

  assert.deepEqual(second, first);
  assert.equal(tokenExchangeCalls, 1);
});

test("browser flow completeBrowserFlow throws on unknown state", async () => {
  const manager = new FactoryOAuthManager();
  await assert.rejects(
    manager.completeBrowserFlow("nonexistent-state", "some-code"),
    (err: Error) => err.message.includes("Unknown or expired"),
  );
});

test("browser flow completeBrowserFlow throws on token exchange failure", async () => {
  const manager = new FactoryOAuthManager({
    fetchFn: async () => {
      return new Response("Unauthorized", { status: 401 });
    },
  });

  const started = manager.startBrowserFlow("http://127.0.0.1:8789/auth/factory/callback");
  await assert.rejects(
    manager.completeBrowserFlow(started.state, "bad-code"),
    (err: Error) => err.message.includes("401"),
  );
});

// ─── Token Extraction Tests ─────────────────────────────────────────────────

test("tokens without user.id generate a factory-prefixed account id", async () => {
  const fakeAccessToken = makeJwt({ sub: "anon", exp: Math.floor(Date.now() / 1000) + 3600 });

  const manager = new FactoryOAuthManager({
    fetchFn: async (input) => {
      const url = String(input);
      if (url.includes("/user_management/authenticate")) {
        return jsonResponse({
          access_token: fakeAccessToken,
          refresh_token: "rt-anon",
          // no user field
        });
      }
      throw new Error(`Unexpected URL: ${url}`);
    },
  });

  const started = manager.startBrowserFlow("http://127.0.0.1:8789/auth/factory/callback");
  const tokens = await manager.completeBrowserFlow(started.state, "anon-code");

  assert.ok(tokens.accountId.startsWith("factory-"), `Expected factory- prefix, got ${tokens.accountId}`);
  assert.equal(tokens.email, undefined);
});

test("tokens with user.id derive deterministic account id", async () => {
  const fakeAccessToken = makeJwt({ sub: "user_01DET", exp: Math.floor(Date.now() / 1000) + 3600 });

  const manager = new FactoryOAuthManager({
    fetchFn: async (input) => {
      const url = String(input);
      if (url.includes("/user_management/authenticate")) {
        return jsonResponse({
          access_token: fakeAccessToken,
          refresh_token: "rt-det",
          user: { id: "user_01DET", email: "det@factory.ai" },
        });
      }
      throw new Error(`Unexpected URL: ${url}`);
    },
  });

  const started = manager.startBrowserFlow("http://127.0.0.1:8789/auth/factory/callback");
  const tokens = await manager.completeBrowserFlow(started.state, "det-code");

  assert.equal(tokens.accountId, "factory-user_01DET");
});

test("access token without exp claim sets expiresAt to undefined", async () => {
  // JWT without exp
  const fakeAccessToken = makeJwt({ sub: "no-exp" });

  const manager = new FactoryOAuthManager({
    fetchFn: async (input) => {
      const url = String(input);
      if (url.includes("/user_management/authenticate")) {
        return jsonResponse({
          access_token: fakeAccessToken,
          refresh_token: "rt-no-exp",
          user: { id: "user_no_exp", email: "noexp@factory.ai" },
        });
      }
      throw new Error(`Unexpected URL: ${url}`);
    },
  });

  const started = manager.startBrowserFlow("http://127.0.0.1:8789/auth/factory/callback");
  const tokens = await manager.completeBrowserFlow(started.state, "noexp-code");

  assert.equal(tokens.expiresAt, undefined);
});

// ─── State Pruning Tests ────────────────────────────────────────────────────

test("device flow state is pruned after TTL", async () => {
  let now = 1_000;

  const manager = new FactoryOAuthManager({
    now: () => now,
    deviceStateTtlMs: 1000, // 1 second TTL for testing
    fetchFn: async (input) => {
      const url = String(input);
      if (url.includes("/user_management/authorize/device")) {
        return jsonResponse({
          device_code: "dc-prune",
          user_code: "PRUNE-CODE",
          verification_uri: "https://factory.authkit.app/device",
          verification_uri_complete: "https://factory.authkit.app/device?user_code=PRUNE-CODE",
          expires_in: 300,
          interval: 5,
        });
      }
      throw new Error(`Unexpected URL: ${url}`);
    },
  });

  const started = await manager.startDeviceFlow();

  // Advance past TTL
  now = 3_000;

  // After pruning, the device flow state should be gone
  const result = await manager.pollDeviceFlow(started.deviceAuthId);
  assert.equal(result.state, "failed");
  if (result.state === "failed") {
    assert.match(result.reason, /Unknown or expired/);
  }
});

test("browser pending state is pruned after TTL", async () => {
  let now = 1_000;

  const manager = new FactoryOAuthManager({
    now: () => now,
    browserStateTtlMs: 1000, // 1 second TTL for testing
  });

  const started = manager.startBrowserFlow("http://127.0.0.1:8789/auth/factory/callback");

  // Advance past TTL
  now = 3_000;

  // Trigger pruning by starting another browser flow
  manager.startBrowserFlow("http://127.0.0.1:8789/auth/factory/callback");

  // Original state should be pruned
  await assert.rejects(
    manager.completeBrowserFlow(started.state, "pruned-code"),
    (err: Error) => err.message.includes("Unknown or expired"),
  );
});

// ─── FactoryResponsesProviderStrategy max_output_tokens fix ──────────────────

async function withEnv(values: Record<string, string | undefined>, fn: () => Promise<void> | void): Promise<void> {
  const previous = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(values)) {
    previous.set(key, process.env[key]);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    await fn();
  } finally {
    for (const [key, value] of previous.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test("FactoryResponsesProviderStrategy.buildPayload deletes max_output_tokens", async () => {
  // This is a regression test for the scrutiny fix: Factory returns 400 on max_output_tokens
  // We verify that the strategy strips this field, matching OpenAiResponsesProviderStrategy behavior.

  await withEnv({ PROXY_AUTH_TOKEN: "test-token" }, async () => {
    // We import dynamically since provider-strategy has many dependencies
    const { selectProviderStrategy } = await import("../lib/provider-strategy.js");

    // Build a minimal config matching factory routing
    const { loadConfig } = await import("../lib/config.js");
    const config = loadConfig();

    const requestBody = {
      model: "factory/gpt-5",
      messages: [{ role: "user", content: "test" }],
      stream: false,
      max_output_tokens: 4096,
    };

    const { strategy } = selectProviderStrategy(
      config,
      {},
      requestBody,
      "factory/gpt-5",
      "factory/gpt-5",
    );

    const payload = strategy.buildPayload({
      config,
      clientHeaders: {},
      requestBody,
      requestedModelInput: "factory/gpt-5",
      routingModelInput: "factory/gpt-5",
      routedModel: "gpt-5",
      explicitOllama: false,
      openAiPrefixed: false,
      factoryPrefixed: true,
      localOllama: false,
      clientWantsStream: false,
      needsReasoningTrace: false,
      upstreamAttemptTimeoutMs: 180000,
    });

    const parsed = JSON.parse(payload.bodyText) as Record<string, unknown>;
    assert.equal(parsed["max_output_tokens"], undefined, "max_output_tokens should be deleted from Factory Responses payload");
    assert.equal(parsed["store"], false, "store should be false");
    assert.equal(parsed["stream"], true, "stream should be true");
  });
});
