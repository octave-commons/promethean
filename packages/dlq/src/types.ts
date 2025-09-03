// SPDX-License-Identifier: GPL-3.0-only
export interface DLQRecord {
    topic: string;
    group?: string;
    original: any; // original EventRecord
    err: string; // error message/stack
    ts: number;
    attempts?: number;
}
export const DLQ_TOPIC_PREFIX = 'dlq.';
export const dlqTopic = (t: string) => `${DLQ_TOPIC_PREFIX}${t}`;
