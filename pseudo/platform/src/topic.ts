import type { ReadonlyDeep } from 'type-fest';

export type TopicParts = ReadonlyDeep<{
    provider: string;
    tenant: string;
    area: string;
    name: string;
}>;

export const topic = (parts: TopicParts): string =>
    `promethean.p.${parts.provider}.t.${parts.tenant}.${parts.area}.${parts.name}`;
