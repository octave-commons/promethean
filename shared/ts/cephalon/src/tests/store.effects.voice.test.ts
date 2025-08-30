import test from "ava";
import { createStore } from "../store/createStore.js";
import { reducer, initialState } from "../store/reducer.js";
import { registerVoiceEffects } from "../store/effects/voice.js";

test("VOICE/LEAVE_REQUESTED triggers VOICE/LEFT and updates state", async (t) => {
  const store = createStore(initialState, reducer);
  const busCalls: any[] = [];
  registerVoiceEffects(store, { publish: (m: any) => busCalls.push(m) });
  await store.dispatch({
    type: "VOICE/LEAVE_REQUESTED",
    guildId: "g1",
    by: "u1",
  });
  const state = store.getState();
  const v = state.voice["g1"];
  t.truthy(v);
  t.false(v!.connected);
  t.like(busCalls[0], {
    topic: "VOICE/LEAVE_REQUESTED",
    guildId: "g1",
    by: "u1",
  });
});
