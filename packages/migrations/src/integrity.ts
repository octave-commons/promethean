import crypto from 'node:crypto';

export function sha256(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
}

export type ChecksumInput = {
    readonly id: string;
    readonly text: string;
    readonly meta: Readonly<Record<string, unknown>>;
    readonly embedDim: number;
    readonly salt?: string;
};

export function checksumFor({ id, text, meta, embedDim, salt = 'v1' }: ChecksumInput): string {
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
