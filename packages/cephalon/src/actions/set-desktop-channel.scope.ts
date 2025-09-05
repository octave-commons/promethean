import { makePolicy, type PolicyChecker } from "@promethean/security";
import { checkPermission } from "@promethean/legacy";

import { makeLogger, type Logger } from "../factories/logger.js";

export type SetDesktopChannelScope = {
  logger: Logger;
  policy: PolicyChecker;
};

export async function buildSetDesktopChannelScope(): Promise<SetDesktopChannelScope> {
  return {
    logger: makeLogger("set-desktop-channel"),
    policy: makePolicy({ permissionGate: checkPermission }),
  };
}
