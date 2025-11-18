import test from "ava";
import { EventEmitter } from "events";

import { AIAgent } from "../agent/index.js";
import type { AgentOptions } from "../types.js";

// Mock dependencies
class MockBot extends EventEmitter {
  applicationId = "test-app";
  currentVoiceSession = undefined;
  context = {
    getCollection: () => ({
      insert: async () => {},
    }),
  };
}

class MockLLMService {
  generateText = async () => "Mock response";
}

class MockContextStore {
  getCollection = () => ({
    insert: async () => {},
    find: async () => [],
  });
}

test("AIAgent constructs with basic options", (t) => {
  const bot = new MockBot() as any;
  const llm = new MockLLMService() as any;
  const context = new MockContextStore() as any;

  const options: AgentOptions = {
    bot,
    context,
    llm,
  };

  const agent = new AIAgent(options);

  t.truthy(agent);
  t.is(agent.bot, bot);
  t.is(agent.context, context);
  t.is(agent.llm, llm);
  t.false(agent.isThinking);
  t.truthy(agent.innerState);
});

test("AIAgent initializes with default inner state", (t) => {
  const bot = new MockBot() as any;
  const llm = new MockLLMService() as any;
  const context = new MockContextStore() as any;

  const agent = new AIAgent({
    bot,
    context,
    llm,
  });

  t.truthy(agent.innerState);
  t.is(typeof agent.innerState.currentMood, "string");
  t.is(typeof agent.innerState.currentGoal, "string");
  t.true(agent.innerState.currentMood.length > 0);
  t.true(agent.innerState.currentGoal.length > 0);
});

test("AIAgent handles thinking state correctly", async (t) => {
  const bot = new MockBot() as any;
  const llm = new MockLLMService() as any;
  const context = new MockContextStore() as any;

  const agent = new AIAgent({
    bot,
    context,
    llm,
  });

  t.false(agent.isThinking);

  // Test thinking state changes
  agent.isThinking = true;
  t.true(agent.isThinking);

  agent.isThinking = false;
  t.false(agent.isThinking);
});

test("AIAgent generates text responses", async (t) => {
  const bot = new MockBot() as any;
  const llm = {
    generateText: async () => "Generated response",
  } as any;
  const context = new MockContextStore() as any;

  const agent = new AIAgent({
    bot,
    context,
    llm,
  });

  const response = await agent.generateTextResponse("Hello", {
    context: [{ role: "user", content: "Hi" }],
  });

  t.is(response, "Generated response");
});

test("AIAgent handles context in responses", async (t) => {
  const bot = new MockBot() as any;
  let receivedContext: any = null;
  const llm = {
    generateText: async (_prompt: string, options: any) => {
      receivedContext = options?.context;
      return "Response";
    },
  } as any;
  const context = new MockContextStore() as any;

  const agent = new AIAgent({
    bot,
    context,
    llm,
  });

  const testContext = [{ role: "user", content: "Test message" }];
  await agent.generateTextResponse("Hello", { context: testContext });

  t.deepEqual(receivedContext, testContext);
});

test("AIAgent emits events correctly", async (t) => {
  const bot = new MockBot() as any;
  const llm = new MockLLMService() as any;
  const context = new MockContextStore() as any;

  const agent = new AIAgent({
    bot,
    context,
    llm,
  });

  let eventFired = false;
  let eventData: any = null;

  agent.on("test-event", (data) => {
    eventFired = true;
    eventData = data;
  });

  agent.emit("test-event", { test: "data" });

  t.true(eventFired);
  t.deepEqual(eventData, { test: "data" });
});

test("AIAgent updates inner state", async (t) => {
  const bot = new MockBot() as any;
  const llm = new MockLLMService() as any;
  const context = new MockContextStore() as any;

  const agent = new AIAgent({
    bot,
    context,
    llm,
  });

  const newState = {
    currentMood: "excited",
    currentGoal: "new goals",
  };

  await agent.updateInnerState(newState);

  t.is(agent.innerState.currentMood, "excited");
  t.is(agent.innerState.currentGoal, "new goals");
});

test("AIAgent handles errors gracefully", async (t) => {
  const bot = new MockBot() as any;
  const llm = {
    generateText: async () => {
      throw new Error("LLM service error");
    },
  } as any;
  const context = new MockContextStore() as any;

  const agent = new AIAgent({
    bot,
    context,
    llm,
  });

  await t.throwsAsync(async () => {
    await agent.generateTextResponse("Hello", {});
  }, { instanceOf: Error });
});