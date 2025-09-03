// SPDX-License-Identifier: GPL-3.0-only
import type { Bot } from "../bot.js";
import { makeLogger, type Logger } from "../factories/logger.js";
import { makePolicy, type PolicyChecker } from "../factories/policy.js";

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
    logger: makeLogger("forward-attachments"),
    policy: makePolicy(),
    getCaptureChannel: () => ctx.bot.captureChannel,
    getAgentWorld: () => ctx.bot.agentWorld,
  };
}
