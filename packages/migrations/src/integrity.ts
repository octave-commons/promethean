import crypto from 'node:crypto';

export function sha256(s: string): string {
    return crypto.createHash('sha256').update(s).digest('hex');
}

export function checksumFor(id: string, text: string, meta: Record<string, any>, embedDim: number, salt = 'v1') {
    const payload = JSON.stringify({ id, text, meta, embedDim, salt });
    return sha256(payload);
}

export type IntegrityReport = {
    runId: string;
    modelId: string;
    embedDim: number;
    counts: { mongo: number; chroma: number };
    orphans: { mongoOnly: string[]; chromaOnly: string[] };
    sampleChecksums: Array<{ id: string; checksum: string }>;
    failures: Array<{ id: string; reason: string }>;
    startedAt: string;
    finishedAt: string;
};
