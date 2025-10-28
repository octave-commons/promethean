import { type OverrideMap } from './shared.js';
export declare const parseEnvConfig: (env: Readonly<NodeJS.ProcessEnv>) => OverrideMap;
export declare function parseArgv(argv: ReadonlyArray<string>): Readonly<{
    readonly values: OverrideMap;
    readonly rest: ReadonlyArray<string>;
}>;
export declare const findConfigPath: (repo: string, explicitPath: string | undefined, cwd: string) => Promise<string | undefined>;
export declare const resolveRepo: (argValues: OverrideMap, envValues: OverrideMap, cwd: string) => Promise<string>;
//# sourceMappingURL=sources.d.ts.map