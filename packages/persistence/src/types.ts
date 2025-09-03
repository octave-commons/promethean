// SPDX-License-Identifier: GPL-3.0-only
import { ObjectId } from 'mongodb';

export type AliasDoc = {
    _id: string;
    target: string;
    embed?: { driver: string; fn: string; dims: number; version: string };
};
export type DiscordEntry = DualStoreEntry<'content', 'created_at'>;
export type ThoughtEntry = DualStoreEntry<'text', 'createdAt'>;

export type DualStoreEntry<TextKey extends string = 'text', TimeKey extends string = 'createdAt'> = {
    _id?: ObjectId; // MongoDB internal ID
    id?: string;
    metadata?: any;
} & {
    [K in TextKey]: string;
} & {
    [K in TimeKey]: number;
};
export type DualStoreQueryResult = {
    ids: string[];
    documents: string[];
    metadatas: any[];
    distances?: number[];
};
