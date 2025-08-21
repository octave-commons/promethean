import fs from 'fs/promises';
import path from 'path';

export function splitCSVish(s) {
    if (!s) return [];
    return s
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
}

async function readJson(p) {
    try {
        const raw = await fs.readFile(p, 'utf8');
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export async function loadSmartEnv(vaultPath) {
    const envDirCandidates = ['.smart_env', '.smart-env'].map((d) => path.join(vaultPath, d));
    let envDir = null;
    for (const d of envDirCandidates) {
        try {
            const st = await fs.stat(d);
            if (st.isDirectory()) {
                envDir = d;
                break;
            }
        } catch {}
    }
    if (!envDir) {
        throw new Error(`No .smart_env or .smart-env found under: ${vaultPath}`);
    }

    const cfgPath = path.join(envDir, 'smart_env.json');
    const cfg = await readJson(cfgPath);
    if (!cfg) throw new Error(`Could not read ${cfgPath}`);

    const minChars =
        Number(cfg?.smart_blocks?.min_chars) || Number(cfg?.smart_sources?.min_chars) || 200;

    const em = cfg?.smart_sources?.embed_model || {};
    const adapter = em.adapter || 'transformers';
    let model_key = '';
    let host = undefined;
    let legacy = Boolean(em?.transformers?.legacy_transformers);

    if (adapter === 'ollama') {
        model_key = em?.ollama?.model_key || 'nomic-embed-text:latest';
        host = em?.ollama?.host || 'http://127.0.0.1:11434';
    } else if (adapter === 'transformers') {
        model_key = em?.transformers?.model_key || 'Xenova/bge-base-en-v1.5';
    } else if (adapter === 'openai') {
        model_key = em?.openai?.model_key || 'text-embedding-3-large';
        host = em?.openai?.host;
    } else if (adapter === 'gemini') {
        model_key = em?.gemini?.model_key || 'text-embedding-004';
    } else {
        model_key = 'Xenova/bge-base-en-v1.5';
    }

    const fileEx = splitCSVish(cfg?.file_exclusions);
    const folderEx = splitCSVish(cfg?.folder_exclusions);

    const singleFile = cfg?.smart_sources?.single_file_data_path
        ? path.join(vaultPath, cfg.smart_sources.single_file_data_path)
        : undefined;

    const indexDir = path.join(path.dirname(envDir), path.basename(envDir) + '-index'); // sibling to .smart_env

    return {
        server: { hostname: '0.0.0.0', port: 3210, https: false },
        sources: {
            vault_path: vaultPath,
            include_glob: ['**/*.md'],
            exclude_glob: [
                '.git/**',
                '.obsidian/**',
                ...folderEx.map((f) => `${f.replace(/^\/+/, '')}/**`),
            ],
            min_chars: minChars,
            file_exclusions: fileEx,
            folder_exclusions: folderEx,
            single_file_data_path: singleFile,
            env_dir: envDir,
        },
        embedding: {
            adapter,
            model: model_key,
            host,
            legacy_transformers: legacy,
        },
        index: { dir: indexDir, shard_size: 1000 },
    };
}
