import { makeLogger, type Logger } from "../factories/logger.js";
import { makePolicy, type PolicyChecker } from "@promethean/security/policy.js";
import { checkPermission } from "@promethean/legacy/permissionGate.js";

export type SetCaptureChannelScope = {
  logger: Logger;
  policy: PolicyChecker;
};

export async function buildSetCaptureChannelScope(): Promise<SetCaptureChannelScope> {
  return {
    logger: makeLogger("set-capture-channel"),
    policy: makePolicy({ permissionGate: checkPermission }),
  };
}
