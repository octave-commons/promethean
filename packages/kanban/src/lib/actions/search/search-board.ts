import type { Board, Task } from '../../types.js';

const tokenize = (value: string): string[] =>
  (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

export type SearchBoardInput = {
  board: Board;
  term: string;
};

export type SearchBoardResult = {
  exact: Task[];
  similar: Task[];
};

export const searchBoard = ({ board, term }: SearchBoardInput): SearchBoardResult => {
  const needle = term.trim().toLowerCase();
  const allTasks = board.columns.flatMap((column) =>
    column.tasks.map((task) => ({ ...task, status: column.name })),
  );

  const exact = allTasks.filter(
    (task) => task.title.toLowerCase().includes(needle) || (task.content ?? '').toLowerCase().includes(needle),
  );

  const tokens = new Set(tokenize(term));
  const score = (task: Task): number => {
    const bag = new Set([
      ...tokenize(task.title),
      ...tokenize(task.content ?? ''),
      ...((task.labels ?? []).map((label) => label.toLowerCase())),
    ]);
    let value = 0;
    for (const token of tokens) if (bag.has(token)) value += 1;
    return value;
  };

  const similar = allTasks
    .filter((task) => !exact.includes(task))
    .map((task) => ({ task, score: score(task) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((entry) => entry.task);

  return { exact, similar };
};
