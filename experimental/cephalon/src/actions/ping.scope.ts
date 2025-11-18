import { checkPermission } from "@promethean-os/legacy";
import { makePolicy, type PolicyChecker } from "@promethean-os/security";
import { createLogger, type Logger } from "@promethean-os/utils";

export type PingScope = {
	logger: Logger;
	policy: PolicyChecker;
	time: () => Date;
};

export async function buildPingScope(): Promise<PingScope> {
	return {
		logger: createLogger({
			service: "cephalon",
			base: { component: "ping" },
		}),
		policy: makePolicy({ permissionGate: checkPermission }),
		time: () => new Date(),
	};
}
