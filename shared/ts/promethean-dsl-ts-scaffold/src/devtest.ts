import { buildAgentArtifacts } from './index.js';
import { coerceNode } from './types/sexpr.js';

const duck = [
    [
        'agent',
        ':id',
        'duck',
        ':name',
        'Duck',
        ['use', 'discord.bot/v1'],
        ['env', { DISCORD_TOKEN: ['secret', ':discord/duck'] }],
        ['perm', ['fs', ':read', ['/data/**']], ['net', ':egress', ['*.discord.com']], ['gpu', ':allow', true]],
        [
            'topology',
            ['proc', ':name', 'discord', ':service', 'services/ts/discord', ':args', { agent: 'duck' }],
            ['link', ':from', 'discord', ':to', 'cephalon', ':via', 'ws'],
        ],
    ],
    [
        'block',
        'discord.bot/v1',
        ':docs',
        'Discord bot',
        ['requires', ':services', ['discord']],
        ['exports', ':capabilities', ['gateway', 'voice']],
        ['env', { DISCORD_TOKEN: ['secret', ':discord/default'] }],
        ['topology', ['proc', ':name', 'discord', ':service', 'services/ts/discord']],
    ],
];

const ast = { t: 'list', items: duck.map(coerceNode) } as any;
const { agent, artifacts } = buildAgentArtifacts(ast);
console.log('Agent:', agent);
console.log('---- PM2 ----\n' + artifacts.pm2);
console.log('---- .env ----\n' + artifacts.env);
console.log('---- permissions.json ----\n' + artifacts.permissions);
