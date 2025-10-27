import type { SessionInfo } from '../../types/SessionInfo.js';
export type SearchSessionsResult = {
    readonly query: string;
    readonly results: (SessionInfo & {
        readonly error?: string;
    })[];
    readonly totalCount: number;
} | {
    readonly error: string;
};
export declare function search({ query, k, sessionId, }: {
    query: string;
    k?: number;
    sessionId?: string;
}): Promise<SearchSessionsResult>;
//# sourceMappingURL=search.d.ts.map