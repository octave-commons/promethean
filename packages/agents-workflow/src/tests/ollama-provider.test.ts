import test from "ava";

import type { ModelRequest } from "@openai/agents";
import type { ChatRequest, ChatResponse } from "ollama";

import { createOllamaModelProvider } from "../index.js";

interface RecordedRequest extends ChatRequest {
  stream?: boolean;
}

test("ollama provider issues chat requests with expected payload", async (t) => {
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

  const client = {
    async chat(request: ChatRequest & { stream?: boolean }): Promise<any> {
      calls.push({ ...request });
      if (request.stream) {
        async function* generator(): AsyncIterable<ChatResponse> {
          yield {
            ...responses,
            message: { role: "assistant", content: "hel" },
            done: false,
          };
          yield {
            ...responses,
            message: { role: "assistant", content: "lo" },
          };
        }
        return generator();
      }
      return responses;
    },
  };

  const provider = createOllamaModelProvider({ client: client as any });
  const model = await provider.getModel("test-model");

  const baseRequest = {
    input: "hi",
    systemInstructions: "system prompt",
    modelSettings: { temperature: 0.5 },
    tools: [],
    outputType: "text" as const,
    handoffs: [],
    tracing: false,
  } satisfies ModelRequest;

  const result = await model.getResponse(baseRequest);
  const message = result.output[0];
  if (!message || !("role" in message) || message.role !== "assistant") {
    t.fail("expected assistant message output");
    return;
  }
  const contentEntry = Array.isArray(message.content)
    ? message.content[0]
    : undefined;
  if (!contentEntry || contentEntry.type !== "output_text") {
    t.fail("expected output_text content");
    return;
  }
  t.is(contentEntry.text, "hello");
  t.is(result.usage.totalTokens, 10);

  const streamEvents: string[] = [];
  for await (const event of model.getStreamedResponse(baseRequest)) {
    streamEvents.push(event.type);
  }
  t.is(streamEvents[0], "response_started");
  t.true(
    streamEvents.slice(1, -1).every((event) => event === "output_text_delta"),
  );
  t.is(streamEvents.at(-1), "response_done");

  t.is(calls.length, 2);
  t.deepEqual(calls[0]!.messages, [
    { role: "system", content: "system prompt" },
    { role: "user", content: "hi" },
  ]);
  t.is(calls[0]!.options?.temperature, 0.5);
  t.true(calls[1]!.stream ?? false);
});
