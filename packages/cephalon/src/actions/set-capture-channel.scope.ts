import { checkPermission } from "@promethean-os/legacy";
import { makePolicy, type PolicyChecker } from "@promethean-os/security";
import { createLogger, type Logger } from "@promethean-os/utils";

export type SetCaptureChannelScope = {
	logger: Logger;
	policy: PolicyChecker;
};

export async function buildSetCaptureChannelScope(): Promise<SetCaptureChannelScope> {
	return {
		logger: createLogger({
			service: "cephalon",
			base: { component: "set-capture-channel" },
		}),
		policy: makePolicy({ permissionGate: checkPermission }),
	};
}
