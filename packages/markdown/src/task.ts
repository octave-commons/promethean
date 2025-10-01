import matter from 'gray-matter';
import { v4 as uuidv4 } from 'uuid';

import { STATUS_SET } from './statuses.js';

export type TaskFrontmatter = Readonly<Record<string, unknown>>;

export type TaskDoc = {
    readonly id: string;
    readonly title: string;
    readonly hashtags: readonly string[];
};

type TaskState = {
    readonly frontmatter: TaskFrontmatter;
    readonly title: string | undefined;
    readonly bodyLines: readonly string[];
    readonly id: string | undefined;
    readonly status: string | undefined;
};

const HEADING_RE = /^\s*#\s+(.*)$/u;
const ID_RE = /^\s*id:\s*(.+)$/iu;
const TAG_RE = /(^|\s)#([\w.-]+)/gu;

const unique = (values: readonly string[]): readonly string[] =>
    values.reduce<readonly string[]>((acc, value) => (acc.includes(value) ? acc : [...acc, value]), []);

const trimLines = (lines: readonly string[]): readonly string[] => {
    const firstIndex = lines.findIndex((line) => line.trim().length > 0);
    if (firstIndex < 0) return [];
    const trimmedStart = lines.slice(firstIndex);
    const reversed = [...trimmedStart].reverse();
    const lastIndex = reversed.findIndex((line) => line.trim().length > 0);
    return lastIndex < 0 ? [] : reversed.slice(lastIndex).reverse();
};

const extractHeading = (
    lines: readonly string[],
): { readonly title: string | undefined; readonly rest: readonly string[] } => {
    if (lines.length === 0) return { title: undefined, rest: [] };
    const [first, ...rest] = lines;
    const match = first.match(HEADING_RE);
    if (!match) return { title: undefined, rest: lines };
    const title = (match[1] ?? '').trim();
    return { title, rest };
};

const extractId = (lines: readonly string[]): { readonly id: string | undefined; readonly rest: readonly string[] } => {
    const partitioned = lines.reduce<{
        readonly id: string | undefined;
        readonly rest: readonly string[];
    }>(
        (state, line) => {
            if (state.id) return { id: state.id, rest: [...state.rest, line] };
            const match = line.match(ID_RE);
            if (!match) return { id: undefined, rest: [...state.rest, line] };
            return { id: (match[1] ?? '').trim(), rest: state.rest };
        },
        { id: undefined, rest: [] },
    );
    return partitioned;
};

const extractStatus = (
    lines: readonly string[],
): { readonly status: string | undefined; readonly rest: readonly string[] } => {
    if (lines.length === 0) return { status: undefined, rest: [] };
    const reversed = [...lines].reverse();
    const index = reversed.findIndex((line) => STATUS_SET.has(line.trim()));
    if (index < 0) return { status: undefined, rest: lines };
    const status = reversed[index]?.trim();
    const rest = [...reversed.slice(index + 1), ...reversed.slice(0, index)].reverse();
    return { status, rest };
};

const safeRandomId = (): string => {
    const cryptoApi = globalThis?.crypto;
    if (cryptoApi && typeof cryptoApi.randomUUID === 'function') return cryptoApi.randomUUID();
    return uuidv4();
};

const normalizeBody = (lines: readonly string[]): readonly string[] => trimLines(lines);

export class MarkdownTask {
    private state: TaskState;

    private constructor(state: TaskState) {
        this.state = state;
    }

    static async load(markdown: string): Promise<MarkdownTask> {
        const { content, data } = matter(markdown);
        const rawLines = content.split(/\r?\n/u);
        const withoutWhitespace = trimLines(rawLines);
        const { title, rest: afterTitle } = extractHeading(withoutWhitespace);
        const { id, rest: afterId } = extractId(afterTitle);
        const { status, rest } = extractStatus(afterId);
        const bodyLines = normalizeBody(rest);
        const frontmatter = (data ?? {}) as Record<string, unknown>;
        const state: TaskState = {
            frontmatter,
            title: title && title.length > 0 ? title : undefined,
            bodyLines,
            id: id && id.length > 0 ? id : undefined,
            status: status && status.length > 0 ? status : undefined,
        };
        return new MarkdownTask(state);
    }

    static newWithId(id?: string): MarkdownTask {
        const state: TaskState = {
            frontmatter: {},
            title: undefined,
            bodyLines: [],
            id: id ?? safeRandomId(),
            status: undefined,
        };
        return new MarkdownTask(state);
    }

    private withState(next: TaskState): void {
        this.state = next;
    }

    ensureId(id?: string): string {
        if (this.state.id) return this.state.id;
        const value = id ?? safeRandomId();
        this.withState({ ...this.state, id: value });
        return value;
    }

    getId(): string {
        return this.state.id ?? '';
    }

    getTitle(): string {
        return this.state.title ?? '';
    }

    setTitle(title: string): void {
        const trimmed = title.trim();
        this.withState({ ...this.state, title: trimmed.length > 0 ? trimmed : undefined });
    }

    getHashtags(): readonly string[] {
        const fromBody = this.state.bodyLines.flatMap((line) =>
            Array.from(line.matchAll(TAG_RE), (match) => `#${match[2] ?? ''}`.trim()),
        );
        const fromStatus = this.state.status ? [this.state.status] : [];
        const all = [...fromBody, ...fromStatus].filter((tag) => tag.length > 0);
        return unique(all);
    }

    ensureStatus(status: string): void {
        const trimmed = status.trim();
        const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
        const restWithoutStatuses = this.state.bodyLines.filter((line) => !STATUS_SET.has(line.trim()));
        this.withState({ ...this.state, bodyLines: restWithoutStatuses, status: normalized });
    }

    async toMarkdown(): Promise<string> {
        const sections: readonly string[][] = [
            this.state.title ? [`# ${this.state.title}`] : [],
            this.state.bodyLines.length > 0 ? [...this.state.bodyLines] : [],
            this.state.id ? [`id: ${this.state.id}`] : [],
            this.state.status ? [this.state.status] : [],
        ];
        const lines = sections.reduce<readonly string[]>((acc, section) => {
            if (section.length === 0) return acc;
            const prefix = acc.length === 0 ? section : ['', ...section];
            return [...acc, ...prefix];
        }, []);
        const content = lines.join('\n');
        return matter.stringify(content, this.state.frontmatter);
    }
}
