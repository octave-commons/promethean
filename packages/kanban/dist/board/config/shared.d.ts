export type RawKanbanConfig = Readonly<{
    readonly tasksDir?: string;
    readonly indexFile?: string;
    readonly boardFile?: string;
    readonly cachePath?: string;
    readonly exts?: ReadonlyArray<string>;
    readonly requiredFields?: ReadonlyArray<string>;
    readonly statusValues?: ReadonlyArray<string>;
    readonly priorityValues?: ReadonlyArray<string>;
    readonly wipLimits?: Readonly<Record<string, number>>;
}>;
export type KanbanConfig = Readonly<{
    readonly repo: string;
    readonly tasksDir: string;
    readonly indexFile: string;
    readonly boardFile: string;
    readonly cachePath: string;
    readonly exts: ReadonlySetLike<string>;
    readonly requiredFields: ReadonlyArray<string>;
    readonly statusValues: ReadonlySetLike<string>;
    readonly priorityValues: ReadonlySetLike<string>;
    readonly wipLimits: Readonly<Record<string, number>>;
}>;
export type LoadKanbanConfigResult = Readonly<{
    readonly config: KanbanConfig;
    readonly restArgs: ReadonlyArray<string>;
}>;
export declare const DEFAULT_CONFIG_BASENAME: "promethean.kanban.json";
export declare const CONFIG_SEARCH_PATHS: readonly ["docs/agile/tasks/promethean.kanban.json", "docs/agile/promethean.kanban.json", "docs/promethean.kanban.json", "promethean.kanban.json"];
export declare const MARKERS: readonly ["pnpm-workspace.yaml", "package.json", ".git"];
export declare const ENV_KEYS: {
    readonly repo: "KANBAN_REPO";
    readonly config: "KANBAN_CONFIG";
    readonly tasksDir: "KANBAN_TASKS_DIR";
    readonly indexFile: "KANBAN_INDEX_FILE";
    readonly boardFile: "KANBAN_BOARD_FILE";
    readonly cachePath: "KANBAN_CACHE_PATH";
    readonly exts: "KANBAN_EXTS";
    readonly requiredFields: "KANBAN_REQUIRED_FIELDS";
    readonly statusValues: "KANBAN_STATUS_VALUES";
    readonly priorityValues: "KANBAN_PRIORITY_VALUES";
};
export declare const ARG_KEYS: Map<string, "repo" | "config" | "tasksDir" | "indexFile" | "boardFile" | "cachePath" | "exts" | "requiredFields" | "statusValues" | "priorityValues">;
export type EnvArgKey = keyof typeof ENV_KEYS;
export type OverrideMap = Readonly<Partial<Record<EnvArgKey, string | ReadonlyArray<string>>>>;
export type ArrayKey = 'exts' | 'requiredFields' | 'statusValues' | 'priorityValues';
export declare const ARRAY_KEYS: ReadonlySet<EnvArgKey>;
export type Defaults = Readonly<{
    readonly tasksDir: string;
    readonly indexFile: string;
    readonly boardFile: string;
    readonly cachePath: string;
    readonly exts: ReadonlyArray<string>;
    readonly requiredFields: ReadonlyArray<string>;
    readonly statusValues: ReadonlyArray<string>;
    readonly priorityValues: ReadonlyArray<string>;
    readonly wipLimits: Readonly<Record<string, number>>;
}>;
export type ReadonlySetLike<T> = Readonly<{
    readonly has: (value: T) => boolean;
    readonly [Symbol.iterator]: () => IterableIterator<T>;
}>;
export declare const resolveWithBase: (base: string, candidate: string) => string;
export declare const parseList: (value: string | undefined) => ReadonlyArray<string>;
export declare const normalizeExts: (values: ReadonlyArray<string>) => ReadonlyArray<string>;
export declare const arrayHasKey: (key: EnvArgKey) => key is ArrayKey;
export declare const defaultConfigForRepo: (repo: string) => Defaults;
//# sourceMappingURL=shared.d.ts.map