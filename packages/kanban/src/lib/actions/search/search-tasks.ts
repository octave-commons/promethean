import type { Task, Board } from '../../types.js';

export type SearchTasksInput = {
  board: Board;
  term: string;
  options?: {
    includeContent?: boolean;
    maxResults?: number;
    fuzzy?: boolean;
  };
};

export type SearchTasksResult = {
  exact: Task[];
  similar: Task[];
  total: number;
};

const tokenize = (text: string): string[] =>
  (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const calculateRelevanceScore = (task: Task, searchTokens: Set<string>): number => {
  const titleTokens = new Set(tokenize(task.title || ''));
  const contentTokens = new Set(tokenize(task.content || ''));
  const labelTokens = new Set((task.labels || []).map((label) => label.toLowerCase()));

  // Title matches are most important
  const score = Array.from(searchTokens).reduce((acc, token) => {
    if (titleTokens.has(token)) acc += 3;
    if (contentTokens.has(token)) acc += 1;
    if (labelTokens.has(token)) acc += 2;
    return acc;
  }, 0);

  return score;
};

const findExactMatches = (tasks: Task[], searchTerm: string): Task[] => {
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm) ||
      (task.labels?.some((label) => label.toLowerCase().includes(searchTerm)) ?? false),
  );
};

const findSimilarMatches = (
  tasks: Task[],
  exact: Task[],
  searchTerm: string,
  maxResults: number,
): Task[] => {
  const searchTokens = new Set(tokenize(searchTerm));
  const scoredTasks = tasks
    .filter((task) => !exact.includes(task))
    .map((task) => ({
      task,
      score: calculateRelevanceScore(task, searchTokens),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
  return scoredTasks.map((item) => item.task);
};

export const searchTasks = (input: SearchTasksInput): SearchTasksResult => {
  const { board, term, options = {} } = input;
  const { maxResults = 20, fuzzy = true } = options;

  const searchTerm = term.trim().toLowerCase();
  if (!searchTerm) {
    return { exact: [], similar: [], total: 0 };
  }

  const allTasks = board.columns.flatMap((column) => column.tasks);
  const exact = findExactMatches(allTasks, searchTerm);
  const similar = fuzzy ? findSimilarMatches(allTasks, exact, searchTerm, maxResults) : [];

  return {
    exact: exact.slice(0, maxResults),
    similar,
    total: exact.length + similar.length,
  };
};
