import test from "ava";
import type { ChatRequest, ChatResponse } from "ollama";
import type { ModelRequest } from "@openai/agents";

import type { OllamaModelProviderOptions } from "../providers/ollama.js";
import { createOllamaModelProvider } from "../index.js";

// Helper types
 type RecordedRequest = ChatRequest & { stream?: boolean };

// Shared setup for tests
async function setup() {
  const calls: RecordedRequest[] = [];
  const responses: ChatResponse = {
    model: "test-model",
    created_at: new Date(),
    message: { role: "assistant", content: "hello" },
    done: true,
    done_reason: "stop",
    total_duration: 0,
    load_duration: 0,
    prompt_eval_count: 4,
    prompt_eval_duration: 0,
    eval_count: 6,
    eval_duration: 0,
  };

  const client: OllamaModelProviderOptions["client"] = {
    async chat(request) {
      calls.push({ ...request });
      if (request.stream) {
        async function* gen(): AsyncIterable<ChatResponse> {
          yield { ...responses, message: { role: "assistant", content: "hel" }, done: false };
          yield { ...responses, message: { role: "assistant", content: "lo" }, done: true };
        }
        return gen();
      }
      return responses;
    },
  };

  const provider = createOllamaModelProvider({ client });
  const model = await provider.getModel("test-model");

  const baseRequest: ModelRequest = {
    input: "hi",
    systemInstructions: "system prompt",
    modelSettings: { temperature: 0.5 },
    tools: [],
    outputType: "text",
    handoffs: [],
    tracing: false,
  };

  return { calls, responses, model, baseRequest };
}

// Test getResponse returns transformed output and usage
 test("getResponse returns correct output and usage", async (t) => {
  const { model, responses, baseRequest } = await setup();
  const result = await model.getResponse(baseRequest);

  const output = result.output[0];
  t.truthy(output && output.role === "assistant");
  t.is(output.content, "hello");
  t.is(result.usage.inputTokens, responses.prompt_eval_count);
  t.is(result.usage.outputTokens, responses.eval_count);
});

// Test getResponse sends correct chat request payload
 test("getResponse sends correct chat request payload", async (t) => {
  const { calls, model, baseRequest } = await setup();
  await model.getResponse(baseRequest);

  t.is(calls.length, 1);
  t.deepEqual(calls[0].messages, [
    { role: "system", content: "system prompt" },
    { role: "user", content: "hi" },
  ]);
  t.is((calls[0].options?.temperature), 0.5);
});

// Test getStreamedResponse emits correct events sequence
 test("getStreamedResponse emits expected stream events", async (t) => {
  const { calls, model, baseRequest } = await setup();
  const events: string[] = [];
  for await (const ev of model.getStreamedResponse(baseRequest)) {
    events.push(ev.type);
  }

  t.is(events[0], "response_started");
  t.true(events.slice(1, -1).every((e) => e === "output_text_delta"));
  t.is(events.at(-1), "response_done");

  // Streaming should have been called once
  t.is(calls.length, 1);
  t.true(calls[0].stream ?? false);
});