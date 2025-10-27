export type CloseSessionResult = {
    readonly success: boolean;
    readonly sessionId: string;
    readonly message: string;
};
export declare function close({ sessionId, }: {
    readonly sessionId: string;
}): Promise<CloseSessionResult>;
//# sourceMappingURL=close.d.ts.map