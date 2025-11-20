import { checkPermission } from "@promethean-os/legacy";
import { makePolicy, type PolicyChecker } from "@promethean-os/security";
import { createLogger, type Logger } from "@promethean-os/utils";

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
