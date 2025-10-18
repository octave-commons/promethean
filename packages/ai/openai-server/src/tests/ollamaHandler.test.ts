import test from "ava";
import type { ExecutionContext, TestFn } from "ava";

import { createOllamaChatCompletionHandler } from "../openai/ollamaHandler.js";
import type {
  ChatCompletionJob,
  ChatCompletionRequest,
} from "../openai/types.js";
import type { DeepReadonly } from "../types/deepReadonly.js";

type RecordedInit = DeepReadonly<{
  readonly method?: string;
  readonly body?: string;
}>;

type FetchInvocation = DeepReadonly<{
  readonly input: string;
  readonly init: RecordedInit | undefined;
}>;

type InvocationRecorder = Readonly<{
  readonly record: (invocation: Readonly<FetchInvocation>) => void;
  readonly read: () => ReadonlyArray<FetchInvocation>;
}>;

const createRecordedInit = (
  method: string | undefined,
  body: string | undefined,
): RecordedInit | undefined =>
  method || body
    ? ({
        ...(method ? { method } : {}),
        ...(body ? { body } : {}),
      } satisfies RecordedInit)
    : undefined;

/* eslint-disable functional/no-let */
const createInvocationRecorder = (): InvocationRecorder => {
  let invocations: ReadonlyArray<FetchInvocation> = [];
  return {
    record: (invocation) => {
      invocations = [...invocations, invocation];
    },
    read: () => invocations,
  };
};
/* eslint-enable functional/no-let */

const buildChatRequest = (): DeepReadonly<ChatCompletionRequest> => ({
  model: "llama3",
  messages: [
    { role: "system", content: "Keep it brief." },
    { role: "user", content: "Hi" },
  ],
  temperature: 0.7,
  top_p: 0.9,
  max_tokens: 128,
});

type SuccessfulScenario = Readonly<{
  readonly handler: ReturnType<typeof createOllamaChatCompletionHandler>;
  readonly job: ChatCompletionJob;
  readonly recorder: InvocationRecorder;
  readonly expectedBody: DeepReadonly<{
    readonly model: string;
    readonly messages: ReadonlyArray<{
      readonly role: string;
      readonly content: string;
    }>;
    readonly stream: false;
    readonly options: {
      readonly temperature: number;
      readonly top_p: number;
      readonly num_predict: number;
    };
  }>;
}>;

const createSuccessfulScenario = (): SuccessfulScenario => {
  const recorder = createInvocationRecorder();
  const request = buildChatRequest();
  const expectedBody = {
    model: request.model,
    messages: request.messages,
    stream: false as const,
    options: { temperature: 0.7, top_p: 0.9, num_predict: 128 } as const,
  };

  const handler = createOllamaChatCompletionHandler({
    baseUrl: "http://localhost:11434",
    fetch: async (...args) => {
      const [input, init] = args;
      const method = typeof init?.method === "string" ? init.method : undefined;
      const body = typeof init?.body === "string" ? init.body : undefined;
      const recordedInit = createRecordedInit(method, body);
      const normalisedInput = typeof input === "string" ? input : String(input);
      recorder.record({ input: normalisedInput, init: recordedInit });
      return new Response(
        JSON.stringify({
          model: "llama3",
          created_at: "2023-01-01T00:00:05Z",
          message: { role: "assistant", content: "Hello there" },
          done_reason: "stop",
          prompt_eval_count: 12,
          eval_count: 8,
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      );
    },
  });

  const job: ChatCompletionJob = {
    metadata: { id: "job-1", enqueuedAt: Date.UTC(2023, 0, 1, 0, 0, 0) },
    request: request as ChatCompletionRequest,
  };

  return { handler, job, recorder, expectedBody };
};

const readonlyTest = test as TestFn<DeepReadonly<ExecutionContext>>;

readonlyTest(
  "sends chat requests to the Ollama API and maps the response",
  async (context) => {
    const scenario = createSuccessfulScenario();
    const response = await scenario.handler(scenario.job);
    const invocations = scenario.recorder.read();
    context.is(invocations.length, 1);
    const invocation = invocations.at(0);
    context.truthy(invocation);
    if (!invocation?.init) {
      context.fail("fetch was not called with init parameters");
      return;
    }
    context.is(invocation.init.method, "POST");
    context.is(invocation.input, "http://localhost:11434/api/chat");
    const body = invocation.init.body;
    const serialised = typeof body === "string" ? body : "";
    context.deepEqual(JSON.parse(serialised), scenario.expectedBody);
    context.is(response.id, "job-1");
    context.is(response.object, "chat.completion");
    context.is(response.created, 1672531205);
    context.is(response.model, "llama3");
    context.deepEqual(response.choices, [
      {
        index: 0,
        message: { role: "assistant", content: "Hello there" },
        finish_reason: "stop",
      },
    ]);
    context.deepEqual(response.usage, {
      prompt_tokens: 12,
      completion_tokens: 8,
      total_tokens: 20,
    });
  },
);

readonlyTest(
  "throws descriptive error when Ollama responds with failure",
  async (context) => {
    const handler = createOllamaChatCompletionHandler({
      fetch: async () =>
        new Response("kaput", {
          status: 503,
          headers: { "content-type": "text/plain" },
        }),
    });

    const failingJob: ChatCompletionJob = {
      metadata: { id: "job-err", enqueuedAt: Date.now() },
      request: {
        model: "llama3",
        messages: [{ role: "user", content: "Ping" }],
      },
    };

    await context.throwsAsync(handler(failingJob), { message: /status 503/ });
  },
);
