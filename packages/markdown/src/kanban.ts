/*
Promethean Markdown Board — TypeScript scaffold

A structured "Markdown DOM" wrapper around a Kanban-like board stored in Markdown.

Assumptions (customizable):
- Board columns are defined by level-2 headings (## Column Name)
- Cards are list items under the column heading. Task checkboxes map to done/undone.
- Card identity is stored in an inline HTML comment at the end of the list item paragraph: <!-- id: UUID -->
- Optional inline metadata supported inside the card text:
  • Tags as #tag
  • Obsidian-style wiki links [[Note Title]] captured to `links`
  • Attr map at the very end in braces: {key:val key2:"val with spaces"}
- Kanban settings block is stored as a fenced code block labeled json inside %% kanban:settings %% markers

Round-trip strategy:
- Keep and mutate a single MDAST; serialize back with remark-stringify.
- Minimal formatting changes via remark-stringify options to limit diffs.

Dependencies to add:
  pnpm add unified remark-parse remark-gfm remark-stringify unist-util-visit unist-util-to-string gray-matter uuid

(If you prefer pure ESM: ensure "type":"module" and import paths accordingly.)
*/

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { visit, EXIT } from 'unist-util-visit';
import toStringWithNodes from 'unist-util-to-string-with-nodes';
import matter from 'gray-matter';
import { v4 as uuidv4 } from 'uuid';
import type { Node, Parent } from 'unist';
function toString(node: Node): string {
    const result = toStringWithNodes(node).text;
    if (result && result.trim().length > 0) return result;

    if (typeof (node as any)?.value === 'string') {
        return (node as any).value as string;
    }

    const children = (node as any)?.children;
    if (Array.isArray(children)) {
        return children.map((child: Node) => toString(child)).join('');
    }

    return '';
}

// ---------- Types ----------

export type Attrs = Record<string, string>;

export type Card = {
    id: string;
    text: string;
    done: boolean;
    tags: string[];
    links: string[];
    attrs: Attrs;
};

export type Column = {
    name: string;
    // index of the heading node in the MDAST children array (internal pointer)
    _headingIndex: number;
};

export type BoardFrontmatter = {
    [key: string]: any;
};

export type KanbanSettings = {
    [key: string]: any;
};

// ---------- Helpers ----------

const ID_COMMENT_PREFIX = 'id:';

function unescapeAttrValue(value: string, quote: '"' | "'" | null): string {
    let result = value;
    if (quote === '"') {
        result = result.replace(/\\"/g, '"');
    } else if (quote === "'") {
        result = result.replace(/\\'/g, "'");
    }
    result = result.replace(/\\\\/g, '\\');
    return result;
}

function parseAttrs(braced?: string): Attrs {
    if (!braced) return {};
    const out: Attrs = {};
    // very small parser for: {key:val key2:"val with spaces"}
    const inner = braced.trim().replace(/^\{/, '').replace(/\}$/, '').trim();
    if (!inner) return out;
    const tokenRe = /([\w.-]+)\s*:\s*("[^"]*"|'[^']*'|[^\s]+)(?=\s|$)/g;
    let m: RegExpExecArray | null;
    while ((m = tokenRe.exec(inner))) {
        const k = m[1];
        let v = m[2];
        let quote: '"' | "'" | null = null;
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            quote = v[0] as '"' | "'";
            v = v.slice(1, -1);
        }
        out[k] = unescapeAttrValue(v, quote);
    }
    return out;
}

function formatAttrValue(value: string): string {
    const withEscapedBackslashes = value.replace(/\\/g, '\\\\');
    const needsQuotes = /\s/.test(value) || value.includes('"') || value.includes("'");
    if (!needsQuotes) return withEscapedBackslashes;
    if (value.includes('"') && !value.includes("'")) {
        return `'${withEscapedBackslashes}'`;
    }
    const withEscapedDoubleQuotes = withEscapedBackslashes.replace(/"/g, '\\"');
    return `"${withEscapedDoubleQuotes}"`;
}

function stringifyAttrs(attrs: Attrs): string | null {
    const keys = Object.keys(attrs);
    if (!keys.length) return null;
    const parts = keys.map((k) => {
        const v = attrs[k];
        return `${k}:${formatAttrValue(v)}`;
    });
    return `{${parts.join(' ')}}`;
}

function extractIdFromHtml(htmlValue?: string): string | null {
    if (!htmlValue) return null;
    // Relaxed: allow common id chars (letters, digits, dash, underscore, dot, colon)
    const m = /id:\s*([A-Za-z0-9._:-]+)/.exec(htmlValue);
    return m ? m[1] : null;
}

function makeIdComment(id: string) {
    return `<!-- ${ID_COMMENT_PREFIX} ${id} -->`;
}

function uniqueId(): string {
    try {
        return crypto.randomUUID();
    } catch {
        return uuidv4();
    }
}

// ---------- Board class ----------

export class MarkdownBoard {
    private readonly _raw: string;
    private readonly frontmatter: BoardFrontmatter;
    private readonly tree: any; // MDAST
    private kanbanSettings: KanbanSettings | null = null;

    private constructor(raw: string, frontmatter: BoardFrontmatter, tree: any, kanbanSettings: KanbanSettings | null) {
        this._raw = raw;
        void this._raw;
        this.frontmatter = frontmatter;
        this.tree = tree;
        this.kanbanSettings = kanbanSettings;
    }

    static async load(markdown: string): Promise<MarkdownBoard> {
        const { content, data } = matter(markdown);
        const file = unified().use(remarkParse).use(remarkGfm).parse(content);

        // attempt to extract kanban settings JSON block
        let kanbanSettings: KanbanSettings | null = null;
        visit(file, (node: any) => {
            if (node.type === 'html' && node.value.trim().startsWith('%% kanban:settings')) {
                // next node should be code block
            }
            if (node.type === 'code' && node.lang === 'json') {
                try {
                    kanbanSettings = JSON.parse(node.value);
                } catch {
                    kanbanSettings = null;
                }
            }
        });

        return new MarkdownBoard(markdown, (data as BoardFrontmatter) || {}, file, kanbanSettings);
    }

    getFrontmatter(): BoardFrontmatter {
        return { ...this.frontmatter };
    }
    setFrontmatter(patch: BoardFrontmatter) {
        Object.assign(this.frontmatter, patch);
    }

    getKanbanSettings(): KanbanSettings | null {
        return this.kanbanSettings ? { ...this.kanbanSettings } : null;
    }
    setKanbanSettings(settings: KanbanSettings) {
        this.kanbanSettings = { ...settings };
    }

    /** Return columns as level-2 headings in order */
    listColumns(): Column[] {
        const cols: Column[] = [];
        const children = this.tree.children || [];
        children.forEach((node: any, idx: number) => {
            if (node.type === 'heading' && node.depth === 2) {
                cols.push({ name: toString(node).trim(), _headingIndex: idx });
            }
        });
        return cols;
    }

    /** Ensure a column exists; create if missing right before the next H2 or at end */
    addColumn(name: string, position?: number) {
        const children = this.tree.children || [];
        const existing = this.findColumnHeadingNode(name);
        if (existing) return; // already exists

        const headingNode = { type: 'heading', depth: 2, children: [{ type: 'text', value: name }] };
        const listNode = { type: 'list', ordered: false, spread: false, children: [] as any[] };

        const insertAt =
            typeof position === 'number' ? Math.max(0, Math.min(position, children.length)) : children.length;
        children.splice(insertAt, 0, headingNode, listNode);
    }

    removeColumn(name: string) {
        const idx = this.findColumnHeadingIndex(name);
        if (idx < 0) return;
        const children = this.tree.children;
        // remove heading and the immediate list that follows (if any)
        children.splice(idx, 1);
        if (children[idx] && children[idx].type === 'list') children.splice(idx, 1);
    }

    /** List cards under a column */
    listCards(columnName: string): Card[] {
        const list = this.ensureColumnList(columnName);
        if (!list) return [];
        const cards: Card[] = [];
        for (const li of list.children || []) {
            const { id, text, done, tags, links, attrs } = this.extractCardFromListItem(li);
            cards.push({ id, text, done, tags, links, attrs });
        }
        return cards;
    }

    addCard(columnName: string, card: Partial<Card> & { text: string }) {
        const list = this.ensureColumnList(columnName, true);
        if (!list) throw new Error(`Column not found: ${columnName}`);
        const id = card.id || uniqueId();
        const li = this.cardToListItem({
            id,
            text: card.text,
            done: !!card.done,
            tags: card.tags || [],
            links: card.links || [],
            attrs: card.attrs || {},
        });
        list.children.push(li);
        return id;
    }

    removeCard(columnName: string, cardId: string) {
        const list = this.ensureColumnList(columnName);
        if (!list) return;
        const idx = (list.children || []).findIndex((li: any) => this.extractIdFromLI(li) === cardId);
        if (idx >= 0) list.children.splice(idx, 1);
    }

    moveCard(cardId: string, fromColumn: string, toColumn: string, toIndex?: number) {
        const fromList = this.ensureColumnList(fromColumn);
        const toList = this.ensureColumnList(toColumn, true);
        if (!fromList || !toList) throw new Error('Column(s) not found');
        const fromIdx = (fromList.children || []).findIndex((li: any) => this.extractIdFromLI(li) === cardId);
        if (fromIdx < 0) throw new Error('Card not found in source column');
        const [li] = fromList.children.splice(fromIdx, 1);
        const insertAt =
            typeof toIndex === 'number'
                ? Math.max(0, Math.min(toIndex, toList.children.length))
                : toList.children.length;
        toList.children.splice(insertAt, 0, li);
    }

    updateCard(cardId: string, patch: Partial<Omit<Card, 'id'>>) {
        const { li, list } = this.findCardLI(cardId) || {};
        if (!li || !list) throw new Error('Card not found');
        const current = this.extractCardFromListItem(li);
        const updated: Card = { ...current, ...patch, id: current.id };
        // Replace LI
        const newLi = this.cardToListItem(updated);
        const idx = list.children.indexOf(li);
        list.children.splice(idx, 1, newLi);
    }

    findCards(query: { textIncludes?: string; tag?: string; done?: boolean }): { column: string; card: Card }[] {
        const out: { column: string; card: Card }[] = [];
        for (const col of this.listColumns()) {
            for (const card of this.listCards(col.name)) {
                if (query.textIncludes && !card.text.toLowerCase().includes(query.textIncludes.toLowerCase())) continue;
                if (typeof query.done === 'boolean' && card.done !== query.done) continue;
                if (query.tag && !card.tags.includes(query.tag)) continue;
                out.push({ column: col.name, card });
            }
        }
        return out;
    }

    /** Serialize board back to Markdown (with frontmatter + settings if available) */
    async toMarkdown(): Promise<string> {
        const md = unified()
            .use(remarkStringify, { bullet: '-', fences: true, listItemIndent: 'one' })
            .stringify(this.tree);
        let full = matter.stringify(md, this.frontmatter);

        if (this.kanbanSettings) {
            const settingsBlock = `%% kanban:settings\n\n\`\`\`json\n${JSON.stringify(
                this.kanbanSettings,
                null,
                2,
            )}\n\`\`\`\n%%`;
            full = settingsBlock + '\n\n' + full;
        }
        return full.replace(/\\\[\\\[/g, '[[').replace(/\\\]\]/g, ']]');
    }

    // ---------- Internal utilities ----------

    private findColumnHeadingIndex(name: string): number {
        const children = this.tree.children || [];
        const norm = (s: string) => s.trim().toLowerCase();
        for (let i = 0; i < children.length; i++) {
            const n = children[i];
            if (n.type === 'heading' && n.depth === 2 && norm(toString(n)) === norm(name)) return i;
        }
        return -1;
    }

    private findColumnHeadingNode(name: string): Node | null {
        const idx = this.findColumnHeadingIndex(name);
        return idx >= 0 ? this.tree.children[idx] : null;
    }

    private ensureColumnList(name: string, create = false): Parent | null {
        const idx = this.findColumnHeadingIndex(name);
        if (idx < 0) {
            if (!create) return null;
            this.addColumn(name);
            return this.ensureColumnList(name, false);
        }
        const children = this.tree.children;
        const next = children[idx + 1];
        if (next && next.type === 'list') return next;
        if (!create) return null;
        const listNode = { type: 'list', ordered: false, spread: false, children: [] as any[] };
        children.splice(idx + 1, 0, listNode);
        return listNode;
    }

    private extractIdFromLI(li: any): string | null {
        let id: string | null = null;
        visit(li, (node: any) => {
            if (node.type === 'html' && typeof node.value === 'string') {
                const maybe = extractIdFromHtml(node.value);
                if (maybe) id = maybe;
            }
        });
        return id;
    }

    private extractCardFromListItem(li: any): Card {
        // checkbox state
        const done = !!li.checked;

        // text content (exclude the id HTML comment if it exists)
        let rawText = '';
        const paragraph = (li.children || []).find((c: any) => c.type === 'paragraph');
        if (paragraph) {
            // Build text from paragraph child text nodes to avoid losing raw tokens
            const pieces: string[] = [];
            for (const ch of paragraph.children || []) {
                if (typeof ch.value === 'string') pieces.push(String(ch.value));
            }
            rawText = pieces.join('').trim();
            // If the id HTML comment was parsed inline inside the paragraph, strip it from the text
            rawText = rawText.replace(/<!--\s*id:[^>]*-->/g, '').trim();
        }

        // capture an explicit ID if we have an HTML id comment anywhere in LI
        let id = this.extractIdFromLI(li) || '';
        if (!id) id = uniqueId();

        // parse trailing {attrs}
        let attrs: Attrs = {};
        const attrsMatch = RegExp(/\{[^}]*\}\s*$/).exec(rawText);
        if (attrsMatch) {
            attrs = parseAttrs(attrsMatch[0]);
            rawText = rawText.slice(0, attrsMatch.index).trim();
        }

        // collect tags and wiki links
        const tags = Array.from(rawText.matchAll(/(^|\s)#([\w.-]+)/g)).map((m) => m[2]);
        const links = Array.from(rawText.matchAll(/\[\[([^\]]+)\]\]/g)).map((m) => m[1]);

        // strip tags and links from text for clean title
        const text = rawText
            .replace(/(^|\s)#([\w.-]+)/g, ' ') // remove tags
            .replace(/\[\[[^\]]+\]\]/g, ' ') // remove wiki links
            .replace(/\s+/g, ' ') // normalize
            .trim();

        return { id, text, done, tags, links, attrs };
    }

    private cardToListItem(card: Card): any {
        const tagStr = card.tags?.length ? ' ' + card.tags.map((t) => (t.startsWith('#') ? t : `#${t}`)).join(' ') : '';
        const linkStr = card.links?.length ? ' ' + card.links.map((l) => `[[${l}]]`).join(' ') : '';
        const attrsStr = stringifyAttrs(card.attrs);
        const paraText = [card.text, tagStr, linkStr, attrsStr ? ' ' + attrsStr : ''].join('').trim();

        return {
            type: 'listItem',
            spread: false,
            checked: !!card.done,
            children: [
                { type: 'paragraph', children: [{ type: 'text', value: paraText }] },
                { type: 'html', value: makeIdComment(card.id) },
            ],
        };
    }

    private findCardLI(cardId: string): { list: any; li: any } | null {
        let found: { list: any; li: any } | null = null;
        visit(this.tree, (node: any, _index?: number, parent?: any) => {
            if (parent && parent.type === 'list' && node.type === 'listItem') {
                const id = this.extractIdFromLI(node);
                if (id === cardId) {
                    found = { list: parent, li: node };
                    return EXIT;
                }
            }
            return;
        });
        return found ?? null;
    }
}
