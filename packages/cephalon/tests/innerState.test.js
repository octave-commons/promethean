import anyTest from "ava";
import { rm } from "node:fs/promises";
import { openLevelCache } from "@promethean/level-cache";
import { loadInnerState, updateInnerState } from "../dist/agent/innerState.js";
import { defaultState } from "../dist/prompts.js";

const test = anyTest.serial;
const CACHE_PATH = ".cache/cephalon.level";
let STATE_KEY = "Agent-inner-state";
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
  t.deepEqual(agent.innerState, defaultState);
  const cache = await openLevelCache({ path: CACHE_PATH });
  const stored = await cache.get(STATE_KEY);
  await cache.close();
  t.deepEqual(stored, defaultState);
});

test("updateInnerState persists and load retrieves", async (t) => {
  const agent = { innerState: defaultState };
  await updateInnerState.call(agent, { currentMood: "happy" });
  const agent2 = { innerState: {} };
  await loadInnerState.call(agent2);
  t.is(agent2.innerState.currentMood, "happy");
});
