type FetchLike = typeof fetch;
export type GitHubEnv = {
    token?: string;
    owner?: string;
    repo?: string;
};
export declare const makeGh: (env: GitHubEnv, f?: FetchLike) => {
    readonly applyLabels: (issueNumber: number, labels: string[]) => Promise<{
        readonly skipped: true;
        readonly reason: "no-token";
        ok?: undefined;
        status?: undefined;
    } | {
        ok: boolean;
        status: number;
        readonly skipped?: undefined;
        readonly reason?: undefined;
    }>;
    readonly comment: (issueNumber: number, body: string) => Promise<{
        readonly skipped: true;
        readonly reason: "no-token";
        ok?: undefined;
        status?: undefined;
    } | {
        ok: boolean;
        status: number;
        readonly skipped?: undefined;
        readonly reason?: undefined;
    }>;
};
export {};
//# sourceMappingURL=github.d.ts.map