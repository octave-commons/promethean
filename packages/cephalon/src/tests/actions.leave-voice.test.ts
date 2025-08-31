import test from "ava";
import runLeave from "../actions/leave-voice.js";
import type { LeaveVoiceScope } from "../actions/leave-voice.scope.js";
import { NotAllowedError } from "../factories/policy.js";

function makeScope(allow = true, left = true): LeaveVoiceScope {
  return {
    logger: { debug() {}, info() {}, warn() {}, error() {} },
    policy: {
      async assertAllowed() {
        if (!allow) throw new NotAllowedError("Permission denied");
      },
    },
    voice: {
      async leaveGuild() {
        return left;
      },
    },
  };
}

test("leave-voice action leaves via adapter and returns result", async (t) => {
  const scope = makeScope(true, true);
  const res = await runLeave(scope, { guildId: "g1", by: "u1" });
  t.true(res.left);
});

test("leave-voice action policy denied", async (t) => {
  const scope = makeScope(false);
  await t.throwsAsync(() => runLeave(scope, { guildId: "g1", by: "u1" }), {
    instanceOf: NotAllowedError,
  });
});
