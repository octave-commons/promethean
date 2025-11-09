export function normalizeChat(res: any) {
    const { text, usage, finish_reason } = res || {};
    return { text, usage, finish_reason };
}

export function normalizeEmbed(res: any) {
    const embedding = Array.isArray(res?.embedding)
        ? res.embedding.map((n: number) => Number(n.toFixed(6)))
        : res?.embedding;
    return { ...res, embedding };
}

export function normalizeError(err: any) {
    const { code, message } = err || {};
    return { code, message };
}

export function normalizeStream(chunks: any[]) {
    return (chunks ?? []).map((c: any) => {
        const { id, ...rest } = c || {};
        return rest;
    });
}
