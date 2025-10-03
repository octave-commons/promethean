import { promises as fs } from 'fs';
import { join } from 'path';

import { MarkdownBoard, type Card } from './kanban.js';
import { MarkdownTask } from './task.js';
import { STATUS_SET, headerToStatus } from './statuses.js';

export type SyncOptions = {
    readonly tasksDir: string;
    readonly createMissingTasks?: boolean;
};

export const stripHash = (value: string): string => (value.startsWith('#') ? value.slice(1) : value);

const sanitizeFileName = (value: string): string => value.replace(/[<>:"/\\|?*]/gu, '-');

const ensureExtension = (value: string): string => (value.toLowerCase().endsWith('.md') ? value : `${value}.md`);

const fileExists = async (abs: string): Promise<boolean> =>
    fs.access(abs).then(
        () => true,
        () => false,
    );

const writeIfChanged = async (abs: string, next: string, previous: string | null): Promise<boolean> => {
    if (previous === next) return false;
    await fs.writeFile(abs, next, 'utf8');
    return true;
};

export const firstWikiTarget = (card: Card): string | null => {
    const [first] = card.links ?? [];
    if (!first) return null;
    const beforeAlias = first.split('|')[0] ?? '';
    const withoutFragment = beforeAlias.split('#')[0] ?? '';
    const normalized = withoutFragment.trim();
    if (!normalized) return null;
    return ensureExtension(normalized);
};

const normalizeTags = (card: Card, statusHash: string): readonly string[] => {
    const desired = stripHash(statusHash);
    const filtered = (card.tags ?? []).map((tag) => stripHash(tag)).filter((tag) => !STATUS_SET.has(`#${tag}`));
    const unique = filtered.reduce<readonly string[]>((acc, tag) => (acc.includes(tag) ? acc : [...acc, tag]), []);
    return unique.includes(desired) ? unique : [...unique, desired];
};

export const ensureStatusInTags = (card: Card, columnStatusHash: string): Card => ({
    ...card,
    tags: normalizeTags(card, columnStatusHash),
});

export const cardNeedsStatusUpdate = (card: Card, columnStatusHash: string): boolean => {
    const desired = stripHash(columnStatusHash);
    const tags = card.tags ?? [];
    const hasDesired = tags.some((tag) => stripHash(tag) === desired);
    const hasOtherStatus = tags.some((tag) => STATUS_SET.has(`#${stripHash(tag)}`) && stripHash(tag) !== desired);
    return !hasDesired || hasOtherStatus;
};

export const cardNeedsLink = (card: Card, createMissingTasks?: boolean): boolean =>
    Boolean(createMissingTasks && !firstWikiTarget(card));

const arraysEqual = (left: readonly string[], right: readonly string[]): boolean =>
    left.length === right.length && left.every((value, index) => value === right[index]);

export const ensureCardStatus = (board: MarkdownBoard, columnName: string, card: Card, statusHash: string): boolean => {
    const current = board.listCards(columnName).find((candidate) => candidate.id === card.id) ?? card;
    const nextTags = normalizeTags(current, statusHash);
    if (arraysEqual(current.tags ?? [], nextTags)) return false;
    board.updateCard(current.id, { tags: nextTags });
    return true;
};

export const ensureTaskFile = async (
    tasksDir: string,
    filenameStem: string,
    cardId: string,
    cardTitle?: string,
): Promise<string> => {
    const fallback = filenameStem?.trim() || 'untitled';
    const normalized = ensureExtension(sanitizeFileName(fallback));
    const abs = join(tasksDir, normalized);
    const exists = await fileExists(abs);
    if (!exists) {
        const task = MarkdownTask.newWithId(cardId);
        const title = cardTitle?.trim() || fallback;
        task.setTitle(title);
        const content = await task.toMarkdown();
        await fs.mkdir(tasksDir, { recursive: true });
        await fs.writeFile(abs, content, 'utf8');
    }
    return normalized;
};

export const ensureCardLink = async (
    board: MarkdownBoard,
    card: Card,
    tasksDir: string,
    createMissing: boolean | undefined,
): Promise<boolean> => {
    if (!createMissing) return false;
    const target =
        firstWikiTarget(card) ?? (await ensureTaskFile(tasksDir, card.text || 'untitled', card.id, card.text));
    const link = `${target}|${card.text || target}`;
    const existing = card.links ?? [];
    if (existing.length === 1 && existing[0] === link) return false;
    board.updateCard(card.id, { links: [link] });
    return true;
};

const loadTaskContent = async (abs: string): Promise<string | null> =>
    fs.readFile(abs, 'utf8').then(
        (data) => data,
        () => null,
    );

export const ensureTaskStatusForCard = async (
    board: MarkdownBoard,
    columnName: string,
    card: Card,
    statusHash: string,
    tasksDir: string,
    createMissing: boolean | undefined,
): Promise<boolean> => {
    const targetCard = board.listCards(columnName).find((current) => current.id === card.id) ?? card;
    const target = firstWikiTarget(targetCard);
    if (!target) return false;
    const abs = join(tasksDir, target);
    const existing = await loadTaskContent(abs);
    if (!existing && !createMissing) return false;

    const baseline =
        existing ??
        (async () => {
            const task = MarkdownTask.newWithId(targetCard.id);
            task.setTitle(targetCard.text);
            task.ensureStatus(statusHash);
            const content = await task.toMarkdown();
            await fs.mkdir(tasksDir, { recursive: true });
            await fs.writeFile(abs, content, 'utf8');
            return content;
        })();

    const content = typeof baseline === 'string' ? baseline : await baseline;
    const task = await MarkdownTask.load(content);
    task.ensureId(targetCard.id);
    task.setTitle(targetCard.text);
    task.ensureStatus(statusHash);
    const next = await task.toMarkdown();
    return writeIfChanged(abs, next, content);
};

const updateCardAndTask = async (
    board: MarkdownBoard,
    columnName: string,
    card: Card,
    statusHash: string,
    tasksDir: string,
    createMissing: boolean | undefined,
): Promise<boolean> => {
    const statusChanged = ensureCardStatus(board, columnName, card, statusHash);
    const linkChanged = await ensureCardLink(board, card, tasksDir, createMissing);
    const taskChanged = await ensureTaskStatusForCard(board, columnName, card, statusHash, tasksDir, createMissing);
    return statusChanged || linkChanged || taskChanged;
};

const updateCardsInColumn = async (
    board: MarkdownBoard,
    columnName: string,
    statusHash: string,
    tasksDir: string,
    createMissing: boolean | undefined,
): Promise<boolean[]> =>
    Promise.all(
        board
            .listCards(columnName)
            .map((card) => updateCardAndTask(board, columnName, card, statusHash, tasksDir, createMissing)),
    );

export const detectPendingChanges = (board: MarkdownBoard, opts: SyncOptions): boolean =>
    board.listColumns().some((column) => {
        const status = headerToStatus(column.name);
        return board
            .listCards(column.name)
            .some((card) => cardNeedsStatusUpdate(card, status) || cardNeedsLink(card, opts.createMissingTasks));
    });

export const applyUpdates = async (board: MarkdownBoard, opts: SyncOptions): Promise<boolean> => {
    const results = await Promise.all(
        board
            .listColumns()
            .map((column) =>
                updateCardsInColumn(
                    board,
                    column.name,
                    headerToStatus(column.name),
                    opts.tasksDir,
                    opts.createMissingTasks,
                ),
            ),
    );
    return results.flat().some(Boolean);
};

export const normalizeBoardInstance = async (board: MarkdownBoard, markdown: string): Promise<void> => {
    const reloaded = await MarkdownBoard.load(markdown);
    const nextState = Reflect.get(reloaded as object, 'state');
    Reflect.set(board as object, 'state', nextState);
};

export const syncBoardStatuses = async (board: MarkdownBoard, opts: SyncOptions): Promise<boolean> => {
    const before = await board.toMarkdown();
    const pending = detectPendingChanges(board, opts);
    const applied = await applyUpdates(board, opts);
    const after = await board.toMarkdown();
    return pending || applied || before !== after;
};
