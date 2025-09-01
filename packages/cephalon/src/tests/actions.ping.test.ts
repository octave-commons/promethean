import test from "ava";
import runPing from "../actions/ping.js";
import type { PingScope } from "../actions/ping.scope.js";
import { NotAllowedError } from "../factories/policy.js";

function makeScope(allow = true): PingScope {
  return {
    logger: { debug() {}, info() {}, warn() {}, error() {} },
    policy: {
      async assertAllowed(subject: string) {
        if (!allow || subject === "deny")
          throw new NotAllowedError("Permission denied");
      },
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
