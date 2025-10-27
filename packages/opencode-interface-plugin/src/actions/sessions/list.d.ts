import type { SessionInfo } from '../../types/SessionInfo.js';
export type ListSessionsResult = {
    readonly sessions: SessionInfo[];
    readonly totalCount: number;
    readonly pagination: {
        readonly limit: number;
        readonly offset: number;
        readonly hasMore: boolean;
        readonly currentPage: number;
        readonly totalPages: number;
    };
    readonly summary: {
        readonly active: number;
        readonly waiting_for_input: number;
        readonly idle: number;
        readonly agentTasks: number;
    };
} | {
    readonly error: string;
};
export declare function list({ limit, offset, }: {
    limit: number;
    offset: number;
}): Promise<ListSessionsResult>;
//# sourceMappingURL=list.d.ts.map