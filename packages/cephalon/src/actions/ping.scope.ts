import { makePolicy, type PolicyChecker } from "@promethean/security";
import { checkPermission } from "@promethean/legacy";

import { createLogger, type Logger } from "@promethean/utils/logger.js";

export type PingScope = {
  logger: Logger;
  policy: PolicyChecker;
  time: () => Date;
};

export async function buildPingScope(): Promise<PingScope> {
  return {
    logger: createLogger({ service: "ping" }),
    policy: makePolicy({ permissionGate: checkPermission }),
    time: () => new Date(),
  };
}
