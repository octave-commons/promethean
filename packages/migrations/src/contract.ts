import type { Db } from 'mongodb';

import type { ChromaWrapper } from './chroma.js';

export type ValidationReport = {
    ok: boolean;
    issues: string[];
};

export type MongoContract = {
    collections: Record<string, { indexes?: string[] }>;
};

export type ChromaContract = {
    collections: Record<string, { embedding_dim: number; embedding_model: string }>;
};

export async function validateMongoContract(db: Db, contract: MongoContract): Promise<ValidationReport> {
    const issues: string[] = [];
    const existing = await db.collections();
    const names = existing.map((c) => c.collectionName);

    for (const [name, cfg] of Object.entries(contract.collections)) {
        if (!names.includes(name)) {
            issues.push(`missing collection ${name}`);
            continue;
        }
        if (cfg.indexes) {
            const idx = await db.collection(name).indexes();
            for (const indexName of cfg.indexes) {
                if (!idx.some((i) => i.name === indexName)) {
                    issues.push(`missing index ${indexName} on ${name}`);
                }
            }
        }
    }
    return { ok: issues.length === 0, issues };
}

export async function validateChromaContract(wrapper: ChromaWrapper): Promise<ValidationReport> {
    try {
        await wrapper.ensureCollection();
        return { ok: true, issues: [] };
    } catch (err) {
        return { ok: false, issues: [String(err)] };
    }
}
