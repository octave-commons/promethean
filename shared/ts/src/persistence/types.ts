import { ObjectId } from 'mongodb';

export type DualEntry<T = any> = {
    _id?: ObjectId;
    id?: string;
    text: string; // always required for embedding
    metadata?: any;
} & T;
