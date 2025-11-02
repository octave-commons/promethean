import test from "ava";
import { NotAllowedError } from "@promethean-os/security";

import runLeave from "../actions/leave-voice.js";
import type { LeaveVoiceScope } from "../actions/leave-voice.scope.js";

function makeScope(allow = true, left = true): LeaveVoiceScope {
  const logger = {
    debug() {},
    info() {},
    warn() {},
    error() {},
    audit(_msg: string, _fields?: unknown) {},
    child() {
      return logger;
    },
  };
  return {
    logger,
    policy: {
      async assertAllowed(
        _subject: string,
        _action: string,
        _resource?: string,
      ) {
        if (!allow) throw new NotAllowedError("Permission denied");
      },
      async checkCapability(_agentId: string, _cap: unknown) {},
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
