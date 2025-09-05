import { makePolicy, type PolicyChecker } from "@promethean/security";
import { checkPermission } from "@promethean/legacy";

import { createLogger, type Logger } from "@promethean/utils/logger.js";

export type SetCaptureChannelScope = {
  logger: Logger;
  policy: PolicyChecker;
};

export async function buildSetCaptureChannelScope(): Promise<SetCaptureChannelScope> {
  return {
    logger: createLogger({ service: "set-capture-channel" }),
    policy: makePolicy({ permissionGate: checkPermission }),
  };
}
