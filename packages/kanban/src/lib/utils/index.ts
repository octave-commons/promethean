/**
 * Utility functions for kanban operations
 * Extracted from @packages/markdown/src/kanban.ts
 */

export const clamp = (value: number, lower: number, upper: number): number => 
    Math.min(Math.max(value, lower), upper);

export const normalizeName = (value: string): string => value.trim().toLowerCase();

export const normalizeTags = (tags: readonly string[] | undefined): readonly string[] =>
    (tags ?? [])
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .map((tag) => (tag.startsWith('#') ? tag.slice(1) : tag));

export const normalizeLinks = (links: readonly string[] | undefined): readonly string[] =>
    (links ?? []).map((link) => link.trim()).filter((link) => link.length > 0);

export const normalizeAttrs = (attrs: Record<string, string> | undefined): Record<string, string> => {
    const entries = Object.entries(attrs ?? {})
        .map(([key, value]) => [key.trim(), value.trim()] as const)
        .filter(([key, value]) => key.length > 0 && value.length > 0);
    return Object.freeze(Object.fromEntries(entries));
};

export const freezeRecord = <T extends Record<string, unknown>>(record: Readonly<T>): Readonly<T> =>
    Object.freeze({ ...record });