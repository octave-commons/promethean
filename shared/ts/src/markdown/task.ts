import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';
import matter from 'gray-matter';
import { v4 as uuidv4 } from 'uuid';
import { STATUS_SET } from './statuses.js';

export interface TaskFrontmatter {
    [key: string]: any;
}

export interface TaskDoc {
    id: string;
    title: string;
    hashtags: string[]; // includes status hashtag when present
}

export class MarkdownTask {
    private readonly original: string;
    private readonly tree: any; // MDAST
    private frontmatter: TaskFrontmatter;

    private constructor(original: string, tree: any, fm: TaskFrontmatter) {
        this.original = original;
        this.tree = tree;
        this.frontmatter = fm;
    }

    static async load(markdown: string): Promise<MarkdownTask> {
        const { content, data } = matter(markdown);
        const file = unified().use(remarkParse).use(remarkGfm).parse(content);
        return new MarkdownTask(markdown, file, (data as TaskFrontmatter) || {});
    }

    static newWithId(id?: string): MarkdownTask {
        const fm = {} as TaskFrontmatter;
        const file = unified().use(remarkParse).use(remarkGfm).parse('');
        const t = new MarkdownTask('', file, fm);
        t.ensureId(id);
        return t;
    }

    ensureId(id?: string): string {
        const have = this.getId();
        if (have) return have;
        const val = id ?? safeUUID();
        // Represent id as a leading paragraph if not in frontmatter
        const root = this.tree;
        root.children = root.children || [];
        root.children.unshift({ type: 'paragraph', children: [{ type: 'text', value: `id: ${val}` }] });
        return val;
    }

    getId(): string {
        // Try frontmatter
        const fmId = this.frontmatter?.id;
        if (typeof fmId === 'string' && fmId.trim()) return fmId.trim();
        // Try scanning for a paragraph starting with id:
        let found = '';
        visit(this.tree, (node: any) => {
            if (found) return;
            if (node.type === 'paragraph' && Array.isArray(node.children) && node.children[0]?.type === 'text') {
                const v = String(node.children[0].value ?? '');
                const m = /^id:\s*(.+)$/.exec(v.trim());
                if (m) found = m[1].trim();
            }
        });
        return found;
    }

    getTitle(): string {
        // First heading text, else empty
        let title = '';
        visit(this.tree, (node: any) => {
            if (!title && node.type === 'heading' && node.depth === 1) {
                const txt = (node.children || []).map((c: any) => c.value || '').join('');
                title = String(txt).trim();
            }
        });
        return title;
    }

    setTitle(title: string) {
        const root = this.tree;
        root.children = root.children || [];
        const idx = root.children.findIndex((n: any) => n.type === 'heading' && n.depth === 1);
        const node = { type: 'heading', depth: 1, children: [{ type: 'text', value: title }] };
        if (idx >= 0) root.children.splice(idx, 1, node);
        else root.children.unshift(node);
    }

    getHashtags(): string[] {
        const tags = new Set<string>();
        visit(this.tree, (node: any) => {
            if (node.type === 'text' && typeof node.value === 'string') {
                const v = node.value as string;
                const re = /(^|\s)#([\w.-]+)/g;
                let m: RegExpExecArray | null;
                while ((m = re.exec(v))) tags.add(`#${m[2]}`);
            }
        });
        return Array.from(tags);
    }

    ensureStatus(status: string) {
        // Remove any status tokens anywhere, and ensure the last line is the status.
        const md = unified().use(remarkStringify).stringify(this.tree);
        const lines = md.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
            const toks = lines[i].trim().split(/\s+/).filter(Boolean);
            const filtered = toks.filter((t) => !STATUS_SET.has(t));
            if (filtered.length !== toks.length) {
                lines[i] = filtered.join(' ').trim();
            }
        }
        // Trim trailing blanks
        while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
        // Append status as final line
        lines.push(status);
        // reparse into tree to keep round-trip consistent
        const next = unified().use(remarkParse).use(remarkGfm).parse(lines.join('\n'));
        (this as any).tree = next;
    }

    async toMarkdown(): Promise<string> {
        const body = unified()
            .use(remarkStringify, { bullet: '-', fences: true, listItemIndent: 'one' })
            .stringify(this.tree);
        return matter.stringify(body, this.frontmatter);
    }
}

function safeUUID(): string {
    try {
        return (globalThis as any).crypto?.randomUUID?.() ?? uuidv4();
    } catch {
        return uuidv4();
    }
}
