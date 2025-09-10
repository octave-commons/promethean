import { checkPermission } from "@promethean/legacy";
import { makePolicy, type PolicyChecker } from "@promethean/security";
import { createLogger, type Logger } from "@promethean/utils";

export type SetDesktopChannelScope = {
	logger: Logger;
	policy: PolicyChecker;
};

export async function buildSetDesktopChannelScope(): Promise<SetDesktopChannelScope> {
	return {
		logger: createLogger({
			service: "cephalon",
			base: { component: "set-desktop-channel" },
		}),
		policy: makePolicy({ permissionGate: checkPermission }),
	};
}
