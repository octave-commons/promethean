import { promises as fs } from 'fs';
import { join } from 'path';
import { MarkdownBoard, type Card } from './kanban.js';
import { MarkdownTask } from './task.js';
import { STATUS_SET, headerToStatus } from './statuses.js';

export interface SyncOptions {
    tasksDir: string;
    createMissingTasks?: boolean;
}

function firstWikiTarget(card: Card): string | null {
    if (!card.links?.length) return null;
    const raw = card.links[0]!; // may contain alias or fragment
    // split at alias and fragment: [[file#frag|Alias]] -> file
    const name = raw.split('|')[0]!.split('#')[0]!.trim();
    if (!name) return null;
    const withMd = name.toLowerCase().endsWith('.md') ? name : `${name}.md`;
    return withMd;
}

function ensureStatusInTags(card: Card, status: string): Card {
    const tags = new Set(card.tags || []);
    const strip = (s: string) => (s.startsWith('#') ? s.slice(1) : s);
    // remove any existing status tag (card tags are stored without '#')
    for (const t of Array.from(tags)) if (STATUS_SET.has(`#${strip(t)}`)) tags.delete(t);
    tags.add(strip(status));
    return { ...card, tags: Array.from(tags) };
}

async function ensureTaskFile(tasksDir: string, filenameStem: string, id: string): Promise<string> {
    const safeName = filenameStem.replace(/[<>:\"/\\|?*]/g, '-');
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

export async function syncBoardStatuses(board: MarkdownBoard, opts: SyncOptions): Promise<boolean> {
    let changed = false;
    const columns = board.listColumns();
    for (const col of columns) {
        const status = headerToStatus(col.name);
        const items = board.listCards(col.name);
        for (const card of items) {
            // ensure status tag
            const next = ensureStatusInTags(card, status);
            if (
                next.tags.sort().join(',') !== card.tags.sort().join(',') ||
                next.text !== card.text ||
                next.done !== card.done
            ) {
                await board.updateCard(card.id, { tags: next.tags });
                changed = true;
            }

            // ensure task file exists and link present
            let target = firstWikiTarget(card);
            if (!target && opts.createMissingTasks) {
                const fname = await ensureTaskFile(opts.tasksDir, card.text || 'untitled', card.id);
                // encode as wikilink with alias to title
                const link = `${fname}|${card.text || fname}`;
                await board.updateCard(card.id, { links: [link] });
                changed = true;
            }

            // update task file status
            target = firstWikiTarget(await (async () => board.listCards(col.name).find((c) => c.id === card.id)!)());
            if (target) {
                const abs = join(opts.tasksDir, target);
                let text = '';
                try {
                    text = await fs.readFile(abs, 'utf8');
                } catch {
                    if (opts.createMissingTasks) {
                        const fname = await ensureTaskFile(opts.tasksDir, target, card.id);
                        text = await fs.readFile(join(opts.tasksDir, fname), 'utf8');
                    } else {
                        continue;
                    }
                }
                const task = await MarkdownTask.load(text);
                task.ensureId(card.id);
                task.ensureStatus(status);
                const nextMd = await task.toMarkdown();
                if (nextMd !== text) {
                    await fs.writeFile(abs, nextMd, 'utf8');
                }
            }
        }
    }
    return changed;
}
