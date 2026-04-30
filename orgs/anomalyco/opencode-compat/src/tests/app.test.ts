import assert from "node:assert/strict";
import test from "node:test";

import { createApp } from "../app.js";
import type { CompatRuntimeConfig } from "../lib/config.js";

function testConfig(): CompatRuntimeConfig {
  return {
    host: "127.0.0.1",
    port: 4096,
    publicBaseUrl: "http://127.0.0.1:4096",
    apiKey: "test-key",
    databaseUrl: undefined,
    defaultDirectory: "/workspace/test",
    defaultProvider: "compat",
    defaultModel: "stub-1",
    defaultAgent: "general",
    logLevel: "INFO",
    version: "0.1.0"
  };
}

test("global health is public", async (t) => {
  const app = await createApp(testConfig());
  t.after(async () => {
    await app.close();
  });
  const response = await app.inject({
    method: "GET",
    url: "/global/health"
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    healthy: true,
    version: "0.1.0"
  });
});

test("session prompt scaffold stores conversation", async (t) => {
  const app = await createApp(testConfig());
  t.after(async () => {
    await app.close();
  });

  const headers = {
    authorization: "Bearer test-key"
  };

  const createSession = await app.inject({
    method: "POST",
    url: "/session",
    headers,
    payload: {
      title: "Harness Test"
    }
  });
  assert.equal(createSession.statusCode, 200);
  const session = createSession.json() as { id: string };

  const prompt = await app.inject({
    method: "POST",
    url: `/session/${session.id}/message`,
    headers,
    payload: {
      parts: [
        {
          type: "text",
          text: "Hello scaffold"
        }
      ]
    }
  });
  assert.equal(prompt.statusCode, 200);
  const assistant = prompt.json() as { info: { role: string } };
  assert.equal(assistant.info.role, "assistant");

  const messages = await app.inject({
    method: "GET",
    url: `/session/${session.id}/message`,
    headers
  });
  assert.equal(messages.statusCode, 200);
  const payload = messages.json() as Array<{ info: { role: string } }>;
  assert.equal(payload.length, 2);
  assert.deepEqual(payload.map((entry) => entry.info.role), ["user", "assistant"]);
});
