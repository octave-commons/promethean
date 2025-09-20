import test from "ava";

import type {
  ChatCompletionHandler,
  ChatCompletionResponse,
} from "../openai/types.js";
import type { QueueSnapshot } from "../queue/taskQueue.js";
import { createOpenAICompliantServer } from "../server/createServer.js";

type UnknownRecord = Record<string, unknown>;

const createEchoHandler =
  (): ChatCompletionHandler =>
  async ({ metadata, request }) => ({
    id: `test-${metadata.id}`,
    object: "chat.completion",
    created: 123,
    model: request.model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: request.messages.at(-1)?.content ?? "",
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: request.messages.length,
      completion_tokens: 1,
      total_tokens: request.messages.length + 1,
    },
  });

const chatPayload = {
  model: "gpt-test",
  messages: [
    { role: "system", content: "You are a test." },
    { role: "user", content: "Hello server" },
  ],
} as const;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const isChatCompletionResponse = (
  value: unknown,
): value is ChatCompletionResponse =>
  isRecord(value) &&
  typeof value.id === "string" &&
  value.object === "chat.completion" &&
  typeof value.model === "string";

const isQueueSnapshot = (value: unknown): value is QueueSnapshot => {
  if (!isRecord(value)) {
    return false;
  }
  const { metrics } = value as { metrics?: unknown };
  if (!isRecord(metrics)) {
    return false;
  }
  return ["enqueued", "completed", "failed"].every(
    (key) => typeof metrics[key] === "number",
  );
};

const documentHasPath = (document: unknown, path: string): boolean => {
  if (!isRecord(document)) {
    return false;
  }
  const paths = document.paths;
  if (!isRecord(paths)) {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(paths, path);
};

test("chat completions endpoint delegates to the provided handler", async (t) => {
  const { app, queue } = createOpenAICompliantServer({
    handler: createEchoHandler(),
  });

  t.teardown(async () => {
    await app.close();
  });

  await app.ready();

  const response = await app.inject({
    method: "POST",
    url: "/v1/chat/completions",
    payload: chatPayload,
  });

  t.is(response.statusCode, 200);
  const body: unknown = response.json();
  t.true(isChatCompletionResponse(body));
  if (isChatCompletionResponse(body)) {
    t.true(body.id.startsWith("test-"));
    t.is(body.model, "gpt-test");
  }
  t.is(queue.snapshot().metrics.completed, 1);
});

test("exposes queue snapshot and openapi documentation", async (t) => {
  const { app } = createOpenAICompliantServer();
  t.teardown(async () => {
    await app.close();
  });
  await app.ready();

  const snapshotResponse = await app.inject({
    method: "GET",
    url: "/queue/snapshot",
  });
  t.is(snapshotResponse.statusCode, 200);
  const snapshotCandidate: unknown = snapshotResponse.json();
  t.true(isQueueSnapshot(snapshotCandidate));
  if (isQueueSnapshot(snapshotCandidate)) {
    t.deepEqual(snapshotCandidate.metrics, {
      enqueued: 0,
      completed: 0,
      failed: 0,
    });
  }

  const openApiResponse = await app.inject({
    method: "GET",
    url: "/openapi.json",
  });
  t.is(openApiResponse.statusCode, 200);
  const document: unknown = openApiResponse.json();
  t.true(documentHasPath(document, "/v1/chat/completions"));
});
