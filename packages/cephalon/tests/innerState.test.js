import anyTest from "ava";
import { rm } from "node:fs/promises";
import { openLevelCache } from "@promethean/level-cache";
import { loadInnerState, updateInnerState } from "../dist/agent/innerState.js";
import { defaultState } from "../dist/prompts.js";

const test = anyTest.serial;
const CACHE_PATH = ".cache/cephalon.level";
let STATE_KEY = "duck-inner-state";
try {
  const env = await import("@promethean/legacy/env.js");
  if (typeof env.AGENT_NAME === "string") {
    STATE_KEY = `${env.AGENT_NAME}-inner-state`;
  }
} catch {}

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

test("loadInnerState returns default when cache empty", async (t) => {
  const agent = { innerState: {} };
  await loadInnerState.call(agent);

  // The main goal: agent should have the default state when cache is empty
  t.deepEqual(agent.innerState, defaultState);
});

test("updateInnerState persists and load retrieves", async (t) => {
  const agent = { innerState: defaultState };
  await updateInnerState.call(agent, { currentMood: "happy" });
  const agent2 = { innerState: {} };
  await loadInnerState.call(agent2);
  t.is(agent2.innerState.currentMood, "happy");
});

test("updateInnerState filters out undefined values", async (t) => {
  const agent = { innerState: { currentMood: "happy", goals: "existing" } };
  await updateInnerState.call(agent, { currentMood: "sad", goals: undefined, newField: "test" });
  t.is(agent.innerState.currentMood, "sad");
  t.is(agent.innerState.goals, "existing"); // Should remain unchanged
  t.is(agent.innerState.newField, "test");
});

test("loadInnerState handles cache errors gracefully", async (t) => {
  // Mock a broken cache scenario
  const agent = { innerState: {} };
  const originalOpenLevelCache = openLevelCache;

  // Temporarily break the cache
  global.openLevelCache = async () => {
    throw new Error("Cache connection failed");
  };

  await loadInnerState.call(agent);
  // Should fall back to default state
  t.deepEqual(agent.innerState, defaultState);

  // Restore original function
  global.openLevelCache = originalOpenLevelCache;
});

test("updateInnerState handles persistence errors gracefully", async (t) => {
  const agent = { innerState: defaultState };
  const originalOpenLevelCache = openLevelCache;

  // Mock a cache that fails on set
  const mockCache = {
    set: async () => {
      throw new Error("Persistence failed");
    },
    close: async () => {}
  };

  global.openLevelCache = async () => mockCache;

  // Should not throw error
  await t.notThrowsAsync(async () => {
    await updateInnerState.call(agent, { currentMood: "test" });
  });

  // State should still be updated in memory
  t.is(agent.innerState.currentMood, "test");

  // Restore original function
  global.openLevelCache = originalOpenLevelCache;
});
