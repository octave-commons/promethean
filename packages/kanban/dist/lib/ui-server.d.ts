import { createServer } from 'node:http';
type Primitive = string | number | boolean | symbol | null | undefined | bigint;
type DeepReadonlyTuple<T extends ReadonlyArray<unknown>> = {
    readonly [K in keyof T]: DeepReadonly<T[K]>;
};
type DeepReadonly<T> = T extends Primitive ? T : T extends (...args: infer A) => infer R ? (...args: DeepReadonlyTuple<A>) => DeepReadonly<R> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepReadonly<U>> : T extends object ? {
    readonly [K in keyof T]: DeepReadonly<T[K]>;
} : T;
export type KanbanUiServerOptions = {
    readonly boardFile: string;
    readonly tasksDir: string;
    readonly host?: string;
    readonly port?: number;
};
type ImmutableOptions = DeepReadonly<KanbanUiServerOptions>;
type ServerInstance = ReturnType<typeof createServer>;
type ServerControls = ServerInstance;
export declare const createKanbanUiServer: (options: ImmutableOptions) => ServerControls;
export declare const serveKanbanUI: (options: ImmutableOptions) => Promise<void>;
export {};
//# sourceMappingURL=ui-server.d.ts.map