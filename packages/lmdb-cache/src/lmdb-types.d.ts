// Temporary type declarations to fix LMDB ES module compatibility
declare module 'lmdb' {
  export type Key = Key[] | string | symbol | number | boolean | Uint8Array;

  export interface DatabaseOptions {
    name?: string;
    cache?: boolean | {};
    compression?: boolean | any;
    encoding?: 'msgpack' | 'json' | 'string' | 'binary' | 'ordered-binary';
    sharedStructuresKey?: Key;
    useVersions?: boolean;
    keyEncoding?: 'uint32' | 'binary' | 'ordered-binary';
    dupSort?: boolean;
    strictAsyncOrder?: boolean;
  }

  export interface RootDatabaseOptions extends DatabaseOptions {
    maxDbs?: number;
    commitDelay?: number;
    mapSize?: number;
    pageSize?: number;
    overlappingSync?: boolean;
    separateFlushed?: boolean;
    remapChunks?: boolean;
    noMemInit?: boolean;
    useWritemap?: boolean;
    noSubdir?: boolean;
    noSync?: boolean;
    noMetaSync?: boolean;
    readOnly?: boolean;
    maxReaders?: number;
    encryptionKey?: string | Buffer;
    eventTurnBatching?: boolean;
    encoder?: any;
    decoder?: any;
  }

  export interface RootDatabaseOptionsWithPath extends RootDatabaseOptions {
    path?: string;
  }

  export class Database<V = any, K extends Key = Key> {
    get(id: K, options?: any): V | undefined;
    getEntry(id: K, options?: any): { value: V; version?: number } | undefined;
    getBinary(id: K): Buffer | undefined;
    getBinaryFast(id: K): Buffer | undefined;
    retain(data: any): any;

    put(key: K, value: V, options?: any): void;
    remove(key: K): void;
    delete(key: K): void;

    transaction(): Transaction;
    getRange(options?: any): IterableIterator<[K, V]>;

    close(): void;

    on(event: string, callback: (event: any) => void): void;
  }

  export class Transaction {
    done(): void;
    remove(key: any): void;
    put(key: any, value: any): void;
    commit(): void;
    abort(): void;
  }

  export const ABORT: {};
  export const SKIP: {};
  export const IF_EXISTS: number;

  export function open<V = any, K extends Key = Key>(
    path: string,
    options: RootDatabaseOptions,
  ): Database<V, K>;

  export function open<V = any, K extends Key = Key>(
    options: RootDatabaseOptionsWithPath,
  ): Database<V, K>;

  export function getLastVersion(): number;
  export function compareKeys(a: Key, b: Key): number;

  export class Binary {}
  export function asBinary(buffer: Uint8Array): Binary;
  export let v8AccelerationEnabled: boolean;
  export function levelup(database: Database): Database;
}
