import type { DualStoreEntry } from '../types.js';
import type { CompileContextInputs, ContextMessage, ContextState } from '../actions/context-store/index.js';
import { type DualStoreAdapter } from '../actions/context-store/index.js';
import type { CreateCollectionInputs, GetOrCreateCollectionInputs, RelatedDocumentsInputs, LatestDocumentsInputs } from '../actions/context-store/types.js';
export type ContextStoreFactoryConfig = {
    formatTime?: (epochMs: number) => string;
    assistantName?: string;
    createDualStore?: (name: string, textKey: string, timeStampKey: string) => Promise<DualStoreAdapter>;
};
export type ContextStoreImplementation = {
    readonly state: ContextState;
    createCollection(inputs: CreateCollectionInputs): Promise<DualStoreAdapter>;
    getOrCreateCollection(inputs: GetOrCreateCollectionInputs): Promise<DualStoreAdapter>;
    getCollection(name: string): DualStoreAdapter;
    collectionCount(): number;
    listCollectionNames(): readonly string[];
    getAllRelatedDocuments(inputs: RelatedDocumentsInputs): Promise<DualStoreEntry<'text', 'timestamp'>[]>;
    getLatestDocuments(inputs: LatestDocumentsInputs): Promise<DualStoreEntry<'text', 'timestamp'>[]>;
    compileContext(inputs?: CompileContextInputs): Promise<ContextMessage[]>;
};
export declare const createContextStoreImplementation: (config?: ContextStoreFactoryConfig) => ContextStoreImplementation;
//# sourceMappingURL=contextStore.d.ts.map