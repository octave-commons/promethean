import { makePolicy, type PolicyChecker } from "@promethean/security";
import { checkPermission } from "@promethean/legacy";

import type { Bot } from "../bot.js";
import { createLogger, type Logger } from "@promethean/utils/logger.js";

export type ForwardAttachmentsScope = {
  logger: Logger;
  policy: PolicyChecker;
  getCaptureChannel: () => import("discord.js").TextChannel | undefined;
  getAgentWorld?: () => any;
};

export async function buildForwardAttachmentsScope(ctx: {
  bot: Bot;
}): Promise<ForwardAttachmentsScope> {
  return {
    logger: createLogger({ service: "forward-attachments" }),
    policy: makePolicy({ permissionGate: checkPermission }),
    getCaptureChannel: () => ctx.bot.captureChannel,
    getAgentWorld: () => ctx.bot.agentWorld,
  };
}
