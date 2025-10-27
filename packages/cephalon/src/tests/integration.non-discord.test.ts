import test from "ava";
import { NotAllowedError } from "@promethean-os/security";

import runLeave from "../actions/leave-voice.js";
import { buildLeaveVoiceScope } from "../actions/leave-voice.scope.js";

test("leave-voice action invokable via non-Discord scope builder (no bot ctx)", async (t) => {
  const scope = await buildLeaveVoiceScope();
  try {
    const res = await runLeave(scope, { guildId: "g1", by: "tester" });
    // If permission gate allows, ensure action returns a boolean left flag (no-op adapter -> false)
    t.is(typeof res.left, "boolean");
  } catch (err: any) {
    // If permission gate denies, we still proved invocation path; must be typed error
    t.true(err instanceof NotAllowedError);
  }
});
