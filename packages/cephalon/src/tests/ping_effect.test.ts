// SPDX-License-Identifier: GPL-3.0-only
import test from "ava";
import { createStore } from "../store/createStore.js";
import { initialState, reducer } from "../store/reducer.js";
import type { Event } from "../store/events.js";
import { registerPingEffects } from "../store/effects/ping.js";

const store = createStore(initialState, reducer);
registerPingEffects(store);

const events: Event[] = [];
store.subscribe((e) => {
  events.push(e);
});

test("ping effect dispatches pong event", async (t) => {
  await store.dispatch({ type: "PING/TRIGGERED", by: "user" });
  const pong = events.find((e) => e.type === "PING/PONG");
  t.truthy(pong);
  if (pong && pong.type === "PING/PONG") {
    t.is(pong.message, "pong");
  }
});
