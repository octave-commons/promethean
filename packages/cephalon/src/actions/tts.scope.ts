import { checkPermission } from "@promethean-os/legacy";
import { makePolicy, type PolicyChecker } from "@promethean-os/security";
import { createLogger, type Logger } from "@promethean-os/utils";

import type { Bot } from "../bot.js";

export type TtsScope = {
	logger: Logger;
	policy: PolicyChecker;
	speak: (input: TtsInput) => Promise<TtsOutput>;
};

export type TtsInput = {
	bot: Bot;
	message: string;
};

export type TtsOutput = { ok: boolean };

export async function buildTtsScope(): Promise<
	Pick<TtsScope, "logger" | "policy">
> {
	return {
		logger: createLogger({
			service: "cephalon",
			base: { component: "tts" },
		}),
		policy: makePolicy({ permissionGate: checkPermission }),
	};
}

export function makeTtsAction(): TtsScope["speak"] {
	return async ({ bot, message }) => {
		if (!bot.currentVoiceSession) return { ok: false };
		await bot.currentVoiceSession.playVoice(message);
		return { ok: true };
	};
}
