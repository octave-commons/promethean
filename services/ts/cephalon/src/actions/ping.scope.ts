import type { Logger } from '../factories/logger.js';
import { makeLogger } from '../factories/logger.js';
import { makePolicy, type PolicyChecker } from '../factories/policy.js';

export type PingScope = {
    logger: Logger;
    policy: PolicyChecker;
    time: () => Date;
};

export async function buildPingScope(): Promise<PingScope> {
    return {
        logger: makeLogger('ping'),
        policy: makePolicy(),
        time: () => new Date(),
    };
}
