export type ChromaConnection = {
    readonly ns: string;
};

export function chromaForTenant(ns: string): ChromaConnection {
    // stubbed
    return { ns };
}
