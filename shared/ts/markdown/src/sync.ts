import { promises as fs } from 'fs';
import { join } from 'path';
import { MarkdownBoard, type Card } from './kanban.js';
import { MarkdownTask } from './task.js';
import { STATUS_SET, headerToStatus } from './statuses.js';

export interface SyncOptions {
    tasksDir: string;
    createMissingTasks?: boolean;
}

export function firstWikiTarget(card: Card): string | null {
    if (!card.links?.length) return null;
    const raw = card.links[0]; // may contain alias or fragment
    // split at alias and fragment: [[file#frag|Alias]] -> file
    const name = raw.split('|')[0].split('#')[0].trim();
    if (!name) return null;
    const withMd = name.toLowerCase().endsWith('.md') ? name : `${name}.md`;
    return withMd;
}

export function stripHash(s: string): string {
    return s.startsWith('#') ? s.slice(1) : s;
}

export function ensureStatusInTags(card: Card, columnStatusHash: string): Card {
    // card tags are stored WITHOUT '#'
    const desired = stripHash(columnStatusHash);
    const tags = new Set(card.tags || []);
    for (const t of Array.from(tags)) if (STATUS_SET.has(`#${stripHash(t)}`)) tags.delete(t);
    tags.add(desired);
    return { ...card, tags: Array.from(tags) };
}

export function cardNeedsStatusUpdate(card: Card, columnStatusHash: string): boolean {
    const desired = stripHash(columnStatusHash);
    const tags = card.tags || [];
    const hasDesired = tags.some((t) => stripHash(t) === desired);
    const hasOtherStatus = tags.some((t) => STATUS_SET.has(`#${stripHash(t)}`) && stripHash(t) !== desired);
    return !hasDesired || hasOtherStatus;
}

export function cardNeedsLink(card: Card, createMissingTasks?: boolean): boolean {
    return !firstWikiTarget(card) && !!createMissingTasks;
}

export async function ensureTaskFile(tasksDir: string, filenameStem: string, id: string): Promise<string> {
    const safeName = filenameStem.replace(/[<>:"/\\|?*]/g, '-');
    const fname = safeName.toLowerCase().endsWith('.md') ? safeName : `${safeName}.md`;
    const abs = join(tasksDir, fname);
    try {
        await fs.access(abs);
    } catch {
        const task = MarkdownTask.newWithId(id);
        const text = await task.toMarkdown();
        await fs.writeFile(abs, text, 'utf8');
    }
    return fname;
}

export async function ensureCardStatus(
    board: MarkdownBoard,
    columnName: string,
    card: Card,
    statusHash: string,
): Promise<boolean> {
    const next = ensureStatusInTags(card, statusHash);
    board.updateCard(card.id, { tags: next.tags });
    return true;
}

export async function ensureCardLink(
    board: MarkdownBoard,
    card: Card,
    tasksDir: string,
    createMissing?: boolean,
): Promise<boolean> {
    if (!createMissing) return false;
    const fname = firstWikiTarget(card) ?? (await ensureTaskFile(tasksDir, card.text || 'untitled', card.id));
    const link = `${fname}|${card.text || fname}`;
    board.updateCard(card.id, { links: [link] });
    return true;
}

export async function ensureTaskStatusForCard(
    board: MarkdownBoard,
    columnName: string,
    card: Card,
    statusHash: string,
    tasksDir: string,
    createMissing?: boolean,
): Promise<boolean> {
    // use current card view passed in (callers should pass latest card object)
    let target = firstWikiTarget(card);
    if (!target) {
        if (!createMissing) return false;
        // create file based on card text
        target = await ensureTaskFile(tasksDir, card.text || 'untitled', card.id);
    }
    const abs = join(tasksDir, target);
    let text = '';
    try {
        text = await fs.readFile(abs, 'utf8');
    } catch {
        if (!createMissing) return false;
        // ensure we have a file now
        await ensureTaskFile(tasksDir, target, card.id);
        text = await fs.readFile(abs, 'utf8');
    }
    const task = await MarkdownTask.load(text);
    task.ensureId(card.id);
    task.ensureStatus(statusHash);
    const nextMd = await task.toMarkdown();
    if (nextMd !== text) {
        await fs.writeFile(abs, nextMd, 'utf8');
        return true;
    }
    return false;
}

export async function syncBoardStatuses(board: MarkdownBoard, opts: SyncOptions): Promise<boolean> {
    const beforeMd = await board.toMarkdown();
    // First, cheaply detect if anything needs to change
    const pending = detectPendingChanges(board, opts);
    // Apply updates (even if pending is false, we still apply to be idempotent)
    const applied = await applyUpdates(board, opts);
    let changed = pending || applied;
    const afterMd = await board.toMarkdown();
    if (beforeMd !== afterMd) changed = true;
    if (changed) await normalizeBoardInstance(board, afterMd);
    return changed;
}

export function detectPendingChanges(board: MarkdownBoard, opts: SyncOptions): boolean {
    for (const col of board.listColumns()) {
        const status = headerToStatus(col.name);
        for (const card of board.listCards(col.name)) {
            if (cardNeedsStatusUpdate(card, status) || cardNeedsLink(card, opts.createMissingTasks)) return true;
        }
    }
    return false;
}

export async function applyUpdates(board: MarkdownBoard, opts: SyncOptions): Promise<boolean> {
    let changed = false;
    for (const col of board.listColumns()) {
        const status = headerToStatus(col.name);
        for (const card of board.listCards(col.name)) {
            // update card tags
            if (await ensureCardStatus(board, col.name, card, status)) changed = true;
            // possibly add link
            if (await ensureCardLink(board, card, opts.tasksDir, opts.createMissingTasks)) changed = true;
            // refresh card after possible updates and ensure task file status
            const latest = board.listCards(col.name).find((c) => c.id === card.id) || card;
            if (await ensureTaskStatusForCard(board, col.name, latest, status, opts.tasksDir, opts.createMissingTasks))
                changed = true;
        }
    }
    return changed;
}

export async function normalizeBoardInstance(board: MarkdownBoard, md: string): Promise<void> {
    const reloaded = await MarkdownBoard.load(md);
    const b: any = board as any;
    const r: any = reloaded as any;
    b.tree = r.tree;
    if (r.kanbanSettings) b.kanbanSettings = r.kanbanSettings;
    if (r.frontmatter) b.frontmatter = r.frontmatter;
}
