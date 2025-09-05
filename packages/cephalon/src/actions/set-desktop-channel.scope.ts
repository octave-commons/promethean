import { makePolicy, type PolicyChecker } from "@promethean/security";
import { checkPermission } from "@promethean/legacy";

import { createLogger, type Logger } from "@promethean/utils/logger.js";

export type SetDesktopChannelScope = {
  logger: Logger;
  policy: PolicyChecker;
};

export async function buildSetDesktopChannelScope(): Promise<SetDesktopChannelScope> {
  return {
    logger: createLogger({ service: "set-desktop-channel" }),
    policy: makePolicy({ permissionGate: checkPermission }),
  };
}
