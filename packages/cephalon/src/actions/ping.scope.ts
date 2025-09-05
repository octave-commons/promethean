import { makePolicy, type PolicyChecker } from "@promethean/security";
import { checkPermission } from "@promethean/legacy";

import type { Logger } from "../factories/logger.js";
import { makeLogger } from "../factories/logger.js";

export type PingScope = {
  logger: Logger;
  policy: PolicyChecker;
  time: () => Date;
};

export async function buildPingScope(): Promise<PingScope> {
  return {
    logger: makeLogger("ping"),
    policy: makePolicy({ permissionGate: checkPermission }),
    time: () => new Date(),
  };
}
