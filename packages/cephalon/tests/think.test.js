import anyTest from "ava";
import { rm } from "node:fs/promises";
import { openLevelCache } from "@promethean/level-cache";
import { think } from "../dist/agent/innerState.js";

const test = anyTest.serial;
const CACHE_PATH = ".cache/cephalon.level";

const rmOptions = {
  recursive: true,
  force: true,
  maxRetries: 5,
  retryDelay: 100,
};

test.beforeEach(async () => {
  await rm(CACHE_PATH, rmOptions);
});

test.afterEach.always(async () => {
  await rm(CACHE_PATH, rmOptions);
});

test("think function generates and stores thoughts", async (t) => {
  const mockThoughts = {
    insert: async (entry) => {
      t.true(entry.text.includes("You thought to yourself:"));
      t.true(typeof entry.createdAt === "number");
      t.deepEqual(entry.metadata, {
        userName: "duck",
        isThought: true,
      });
    }
  };

  const mockContext = {
    getCollection: (name) => {
      t.is(name, "agent_messages");
      return mockThoughts;
    }
  };

  const agent = {
    isThinking: false,
    generateResponse: async ({ specialQuery }) => {
      t.true(specialQuery.includes("What are you thinking about right now"));
      return "I'm thinking about how to improve test coverage";
    },
    context: mockContext
  };

  await think.call(agent);
  t.false(agent.isThinking);
});