// SPDX-License-Identifier: GPL-3.0-only
import { makeLogger, type Logger } from "../factories/logger.js";
import { makePolicy, type PolicyChecker } from "../factories/policy.js";

export type SetCaptureChannelScope = {
  logger: Logger;
  policy: PolicyChecker;
};

export async function buildSetCaptureChannelScope(): Promise<SetCaptureChannelScope> {
  return {
    logger: makeLogger("set-capture-channel"),
    policy: makePolicy(),
  };
}
