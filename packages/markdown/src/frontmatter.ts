import { randomUUID as nodeRandomUUID } from 'node:crypto';
import * as path from 'node:path';
import matter, { type GrayMatterFile } from 'gray-matter';

export type ParsedMarkdown<T extends Record<string, unknown>> = GrayMatterFile<string> & {
    readonly data: Readonly<T>;
};

export type EnsureBaselineOptions<T extends Record<string, unknown>> = {
    readonly filePath?: string;
    readonly content?: string;
    readonly uuidFactory?: () => string;
    readonly createdAtFactory?: (args: {
        readonly frontmatter: Readonly<T>;
        readonly filePath?: string;
    }) => string | undefined;
    readonly fallbackCreatedAt?: string;
    readonly now?: () => string;
    readonly titleFactory?: (args: {
        readonly frontmatter: Readonly<T>;
        readonly filePath?: string;
        readonly content?: string;
    }) => string | undefined;
    readonly fallbackTitle?: string;
};

export type BaselineFrontmatter = {
    readonly uuid: string;
    readonly created_at: string;
    readonly title: string;
};

export type MergeGenerated = {
    readonly filename?: string;
    readonly description?: string;
    readonly tags?: readonly string[];
    readonly title?: string;
};

export type MergeOptions = {
    readonly filePath?: string;
    readonly descriptionFallback?: string;
    readonly deriveFilename?: (args: { readonly filePath?: string }) => string;
};

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const defaultNow = () => new Date().toISOString();

const defaultUuidFactory = () => nodeRandomUUID();

const defaultTitleFromPath = (filePath?: string) => (filePath ? path.parse(filePath).name : undefined);

const toTrimmed = (value: string) => value.trim();

export const parseFrontmatter = <T extends Record<string, unknown> = Record<string, unknown>>(
    raw: string,
): ParsedMarkdown<T> => matter(raw) as ParsedMarkdown<T>;

export const stringifyFrontmatter = <T extends Record<string, unknown>>(
    content: string,
    frontmatter: Readonly<T>,
): string => matter.stringify(content, frontmatter, { language: 'yaml' });

export const normalizeStringList = (values: readonly unknown[] | undefined): string[] =>
    Array.from(
        new Set(
            (values ?? [])
                .filter((value): value is string => typeof value === 'string')
                .map(toTrimmed)
                .filter((value) => value.length > 0),
        ),
    );

export const deriveFilenameFromPath = (filePath: string): string => path.parse(filePath).name;

export const ensureBaselineFrontmatter = <T extends Record<string, unknown>>(
    frontmatter: Readonly<T>,
    options: EnsureBaselineOptions<T> = {},
): Readonly<T & BaselineFrontmatter> => {
    const {
        filePath,
        content,
        uuidFactory = defaultUuidFactory,
        createdAtFactory,
        fallbackCreatedAt,
        now = defaultNow,
        titleFactory,
        fallbackTitle,
    } = options;

    const uuid = isNonEmptyString((frontmatter as Record<string, unknown>).uuid)
        ? toTrimmed((frontmatter as Record<string, unknown>).uuid as string)
        : uuidFactory();

    const createdAtFromFront = (frontmatter as Record<string, unknown>).created_at;
    const createdAt = isNonEmptyString(createdAtFromFront)
        ? toTrimmed(createdAtFromFront)
        : (() => {
              const fromFactory = createdAtFactory?.({ frontmatter, filePath });
              if (isNonEmptyString(fromFactory)) return toTrimmed(fromFactory);
              if (isNonEmptyString(fallbackCreatedAt)) return toTrimmed(fallbackCreatedAt);
              return now();
          })();

    const title = (() => {
        const existing = (frontmatter as Record<string, unknown>).title;
        if (isNonEmptyString(existing)) return toTrimmed(existing);
        const fromFilename = (frontmatter as Record<string, unknown>).filename;
        if (isNonEmptyString(fromFilename)) return toTrimmed(fromFilename);
        const generated = titleFactory?.({ frontmatter, filePath, content });
        if (isNonEmptyString(generated)) return toTrimmed(generated);
        if (isNonEmptyString(fallbackTitle)) return toTrimmed(fallbackTitle);
        const fromPath = defaultTitleFromPath(filePath);
        return fromPath && fromPath.length > 0 ? fromPath : 'Untitled';
    })();

    return Object.freeze({
        ...frontmatter,
        uuid,
        created_at: createdAt,
        title,
    }) as Readonly<T & BaselineFrontmatter>;
};

export const mergeFrontmatterWithGenerated = <T extends Record<string, unknown>, G extends MergeGenerated>(
    base: Readonly<T>,
    generated: Readonly<G>,
    options: MergeOptions = {},
): Readonly<
    T & {
        filename: string;
        title: string;
        description: string;
        tags: string[];
    }
> => {
    const { filePath, descriptionFallback = '', deriveFilename } = options;

    const derive =
        deriveFilename ??
        ((args: { readonly filePath?: string }) => {
            if (args.filePath) return deriveFilenameFromPath(args.filePath);
            return 'untitled';
        });

    const filenameCandidate = (() => {
        const fromBase = (base as Record<string, unknown>).filename;
        if (isNonEmptyString(fromBase)) return toTrimmed(fromBase);
        if (isNonEmptyString(generated.filename)) return toTrimmed(generated.filename);
        return derive({ filePath });
    })();

    const description = (() => {
        const fromBase = (base as Record<string, unknown>).description;
        if (isNonEmptyString(fromBase)) return toTrimmed(fromBase);
        if (isNonEmptyString(generated.description)) return toTrimmed(generated.description);
        return descriptionFallback;
    })();

    const baseTags = (base as Record<string, unknown>).tags;
    const tags =
        Array.isArray(baseTags) && baseTags.length > 0
            ? normalizeStringList(baseTags)
            : normalizeStringList(generated.tags);

    const title = (() => {
        const fromBase = (base as Record<string, unknown>).title;
        if (isNonEmptyString(fromBase)) return toTrimmed(fromBase);
        if (isNonEmptyString(generated.title)) return toTrimmed(generated.title);
        return filenameCandidate;
    })();

    return Object.freeze({
        ...base,
        filename: filenameCandidate,
        description,
        tags,
        title,
    });
};
