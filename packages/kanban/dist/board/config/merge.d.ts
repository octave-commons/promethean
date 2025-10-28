import { type Defaults, type KanbanConfig, type OverrideMap, type RawKanbanConfig } from "./shared.js";
type MergeInputs = Readonly<{
    readonly defaults: Defaults;
    readonly repo: string;
    readonly cwd: string;
    readonly envValues: OverrideMap;
    readonly argValues: OverrideMap;
    readonly fileConfig: RawKanbanConfig;
    readonly configDir: string;
}>;
export declare const mergeConfig: (inputs: MergeInputs) => KanbanConfig;
export {};
//# sourceMappingURL=merge.d.ts.map