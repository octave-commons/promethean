export type GetSessionResult = {
    readonly session: unknown;
    readonly messages: unknown[];
} | {
    readonly error: string;
};
export declare function get({ sessionId, limit, offset, }: {
    readonly sessionId: string;
    readonly limit?: number;
    readonly offset?: number;
}): Promise<GetSessionResult>;
//# sourceMappingURL=get.d.ts.map