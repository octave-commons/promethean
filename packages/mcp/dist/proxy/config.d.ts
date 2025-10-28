export type ProxyImplementation = 'manual' | 'sdk';
export type StdioServerSpec = Readonly<{
    name: string;
    command: string;
    args: readonly string[];
    env: Readonly<Record<string, string>>;
    cwd?: string;
    httpPath: string;
    proxy?: ProxyImplementation;
}>;
export declare const loadStdioServerSpecs: (filePath: string) => Promise<readonly StdioServerSpec[]>;
//# sourceMappingURL=config.d.ts.map