import test from "ava";
import { NotAllowedError } from "@promethean-os/security";

import runPing from "../actions/ping.js";
import type { PingScope } from "../actions/ping.scope.js";

function makeScope(allow = true): PingScope {
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
        subject: string,
        _action: string,
        _resource?: string,
      ) {
        if (!allow || subject === "deny")
          throw new NotAllowedError("Permission denied");
      },
      async checkCapability(_agentId: string, _cap: unknown) {},
    },
    time: () => new Date("2020-01-01T00:00:00Z"),
  };
}

test("ping action returns pong on happy path", async (t) => {
  const scope = makeScope(true);
  const res = await runPing(scope, { userId: "user-1" });
  t.is(res.message, "pong");
});

test("ping action denies via policy", async (t) => {
  const scope = makeScope(false);
  await t.throwsAsync(() => runPing(scope, { userId: "deny" }), {
    instanceOf: NotAllowedError,
  });
});
