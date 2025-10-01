import { ObjectId } from 'mongodb';

export type AliasDoc = {
    readonly _id: string;
    readonly target: string;
    readonly embed?: {
        readonly driver: string;
        readonly fn: string;
        readonly dims: number;
        readonly version: string;
    };
};

export type DualStoreTimestamp = number | Date | string;

export type DualStoreMetadata = {
    readonly userName?: string;
    readonly isThought?: boolean;
    readonly type?: string;
    readonly caption?: string;
    readonly timeStamp?: DualStoreTimestamp;
    readonly [key: string]: unknown;
};

export type DualStoreEntry<
    TextKey extends string = 'text',
    TimeKey extends string = 'createdAt',
    Metadata extends DualStoreMetadata = DualStoreMetadata,
> = {
    readonly _id?: ObjectId; // MongoDB internal ID
    readonly id?: string;
    readonly metadata?: Metadata;
} & {
    readonly [K in TextKey]: string;
} & {
    readonly [K in TimeKey]: DualStoreTimestamp;
};

export type DiscordEntry = DualStoreEntry<'content', 'created_at'>;
export type ThoughtEntry = DualStoreEntry<'text', 'createdAt'>;

export type DualStoreQueryResult<Metadata extends DualStoreMetadata = DualStoreMetadata> = {
    readonly ids: ReadonlyArray<ReadonlyArray<string>>;
    readonly documents: ReadonlyArray<ReadonlyArray<string | null>>;
    readonly metadatas: ReadonlyArray<ReadonlyArray<Metadata | null>>;
    readonly distances?: ReadonlyArray<ReadonlyArray<number | null>>;
};
