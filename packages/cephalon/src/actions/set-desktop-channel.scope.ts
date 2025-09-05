import { makeLogger, type Logger } from "../factories/logger.js";
import { makePolicy, type PolicyChecker } from "@promethean/security/policy.js";
import { checkPermission } from "@promethean/legacy/permissionGate.js";

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
