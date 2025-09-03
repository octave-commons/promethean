// SPDX-License-Identifier: GPL-3.0-only
// PM2 ecosystem for Discord access agents. Reads tenants from providers.yml at runtime.
module.exports = {
    apps: [
        {
            name: 'discord-gateway',
            script: 'services/ts/discord-gateway/src/index.ts',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production',
            },
        },
        {
            name: 'discord-rest',
            script: 'services/ts/discord-rest/src/index.ts',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};
