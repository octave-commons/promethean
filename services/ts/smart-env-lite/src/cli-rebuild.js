import { loadSmartEnv } from './env.js';
import { rebuildIndex } from './indexer.js';

const VAULT_PATH = process.env.VAULT_PATH || '';
if (!VAULT_PATH) {
    console.error(
        'Set VAULT_PATH to your Obsidian vault root (the folder containing .smart_env/smart_env.json).',
    );
    process.exit(1);
}

const env = await loadSmartEnv(VAULT_PATH);
const shards = await rebuildIndex(env);
console.log(JSON.stringify({ ok: true, shards, index_dir: env.index.dir }, null, 2));
