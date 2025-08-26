import { makeLogger, type Logger } from '../factories/logger.js';
import { makePolicy, type PolicyChecker } from '../factories/policy.js';

export type SetDesktopChannelScope = {
    logger: Logger;
    policy: PolicyChecker;
};

export async function buildSetDesktopChannelScope(): Promise<SetDesktopChannelScope> {
    return {
        logger: makeLogger('set-desktop-channel'),
        policy: makePolicy(),
    };
}
