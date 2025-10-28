import type { Where } from 'chromadb';
import type { ContextMessage, ContextState } from './actions/context-store/index.js';
import { formatMessage } from './actions/context-store/index.js';
import { DualStoreManager } from './dualStore.js';
import { type ContextStoreImplementation, type ContextStoreFactoryConfig } from './factories/contextStore.js';
import type { DualStoreEntry } from './types.js';
export { formatMessage };
export type ContextStoreState = ContextState;
type CompileContextOptions = {
    readonly texts?: readonly string[];
    readonly recentLimit?: number;
    readonly queryLimit?: number;
    readonly limit?: number;
    readonly formatAssistantMessages?: boolean;
};
type LegacyCompileArgs = Readonly<[number?, number?, number?, boolean?]>;
export declare const createContextStore: (formatTime?: (epochMs: number) => string, assistantName?: string) => ContextStoreState;
export declare const createCollection: (state: ContextStoreState, name: string, textKey: string, timeStampKey: string) => Promise<[ContextStoreState, DualStoreManager<string, string>]>;
export declare const getOrCreateCollection: (state: ContextStoreState, name: string) => Promise<[ContextStoreState, DualStoreManager<string, string>]>;
export declare const getCollection: (state: ContextStoreState, name: string) => DualStoreManager<string, string>;
export declare const collectionCount: (state: ContextStoreState) => number;
export declare const listCollectionNames: (state: ContextStoreState) => readonly string[];
export declare const getAllRelatedDocuments: (state: ContextStoreState, queries: readonly string[], limit?: number, where?: Where) => Promise<DualStoreEntry<"text", "timestamp">[]>;
export declare const getLatestDocuments: (state: ContextStoreState, limit?: number) => Promise<DualStoreEntry<"text", "timestamp">[]>;
export declare const compileContext: (state: ContextStoreState, textsOrOptions?: readonly string[] | CompileContextOptions | undefined, ...legacyArgs: LegacyCompileArgs) => Promise<ContextMessage[]>;
export declare class ContextStore {
    collections: Map<string, DualStoreManager<string, string>>;
    formatTime: (epochMs: number) => string;
    assistantName: string;
    private implementation;
    constructor(formatTime?: (epochMs: number) => string, assistantName?: string);
    private syncState;
    createCollection(name: string, textKey: string, timeStampKey: string): Promise<DualStoreManager<string, string>>;
    getOrCreateCollection(name: string): Promise<DualStoreManager<string, string>>;
    getCollection(name: string): DualStoreManager<string, string>;
    collectionCount(): number;
    listCollectionNames(): readonly string[];
    getAllRelatedDocuments(queries: readonly string[], limit?: number, where?: Where): Promise<DualStoreEntry<"text", "timestamp">[]>;
    getLatestDocuments(limit?: number): Promise<DualStoreEntry<"text", "timestamp">[]>;
    compileContext(textsOrOptions?: readonly string[] | CompileContextOptions | undefined, ...legacyArgs: LegacyCompileArgs): Promise<ContextMessage[]>;
}
export declare const createContextStoreFactory: (config?: ContextStoreFactoryConfig) => ContextStoreImplementation;
//# sourceMappingURL=contextStore.d.ts.map