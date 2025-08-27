export type ClientCredsConfig = {
    authUrl: string;
    clientId: string;
    clientSecret: string;
    scope?: string;
    audience?: string | undefined;
};
export declare function createTokenProviderFromEnv(): (() => Promise<string | undefined>) | undefined;
//# sourceMappingURL=token-client.d.ts.map