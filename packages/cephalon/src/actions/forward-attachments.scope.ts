import { checkPermission } from "@promethean-os/legacy";
import { makePolicy, type PolicyChecker } from "@promethean-os/security";
import { createLogger, type Logger } from "@promethean-os/utils";

import type { Bot } from "../bot.js";

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
		logger: createLogger({
			service: "cephalon",
			base: { component: "forward-attachments" },
		}),
		policy: makePolicy({ permissionGate: checkPermission }),
		getCaptureChannel: () => ctx.bot.captureChannel,
		getAgentWorld: () => ctx.bot.agentWorld,
	};
}
