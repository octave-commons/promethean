type EnhancedEvent = {
    readonly type: string;
    readonly properties?: {
        readonly info?: {
            readonly id?: string;
            readonly sessionID?: string;
        };
        readonly part?: {
            readonly sessionID?: string;
            readonly messageID?: string;
        };
    };
};
export declare const eventToMarkdown: (event: EnhancedEvent) => string;
export declare const sessionToMarkdown: (session: any) => string;
export declare const messageToMarkdown: (message: any) => string;
export {};
//# sourceMappingURL=indexer-formatters.d.ts.map