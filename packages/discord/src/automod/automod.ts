/* eslint-disable functional/no-loop-statements */
import { constants } from "node:fs";
import {
  access,
  appendFile,
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import { dirname } from "node:path";

import type { Message } from "discord.js";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
type ClassLabel = ExampleType;

type ClassStatistics = {
  documentCount: number;
  tokenCount: number;
  tokenFrequencies: Map<string, number>;
};

class TextNaiveBayes {
  private readonly classes = new Map<ClassLabel, ClassStatistics>();
  private readonly vocabulary = new Set<string>();

  learn(text: string, label: ClassLabel): void {
    const tokens = this.tokenize(text);
    const stats = this.classes.get(label) ?? {
      documentCount: 0,
      tokenCount: 0,
      tokenFrequencies: new Map<string, number>(),
    };
    stats.documentCount += 1;
    for (const token of tokens) {
      this.vocabulary.add(token);
      stats.tokenCount += 1;
      stats.tokenFrequencies.set(
        token,
        (stats.tokenFrequencies.get(token) ?? 0) + 1,
      );
    }
    this.classes.set(label, stats);
  }

  categorize(text: string): ClassLabel {
    const entries = [...this.classes.entries()];
    const initialEntry = entries[0];
    if (!initialEntry) {
      throw new Error("Classifier has no training data");
    }
    const tokens = this.tokenize(text);
    const totalDocuments = entries.reduce(
      (acc, [, stats]) => acc + stats.documentCount,
      0,
    );
    let bestLabel: ClassLabel = initialEntry[0];
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const [label, stats] of entries) {
      let score = Math.log(stats.documentCount / totalDocuments);
      for (const token of tokens) {
        const frequency = stats.tokenFrequencies.get(token) ?? 0;
        const probability =
          (frequency + 1) / (stats.tokenCount + this.vocabulary.size || 1);
        score += Math.log(probability);
      }
      if (score > bestScore) {
        bestScore = score;
        bestLabel = label;
      }
    }

    return bestLabel;
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase().split(/\W+/).filter(Boolean);
  }
}

export type ExampleType = "banned" | "allowed";

export type AutomodOptions = {
  logPath: string;
  fuzzyDistance?: number;
  minimumExamples?: number;
};

export type AutomodMessage = {
  id: string;
  authorId: string;
  channelId: string;
  content: string;
  createdTimestamp: number;
};

export type LoggedMessage = AutomodMessage;

export type ModerationDecision = {
  action: "delete" | "allow";
  reason: "rule" | "classifier:banned" | "classifier:allowed" | "rule:allow";
};

export type AutomodSnapshot = {
  bannedExamples: string[];
  allowedExamples: string[];
  classifierActive: boolean;
};

type AutomodState = {
  bannedExamples: Set<string>;
  allowedExamples: Set<string>;
  classifier: TextNaiveBayes | null;
  classifierActive: boolean;
};

const CSV_HEADER = ["messageId", "userId", "channelId", "content", "timestamp"];

const levenshteinDistance = (a: string, b: string): number => {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () =>
    new Array<number>(cols).fill(0),
  );

  for (let i = 0; i < rows; i += 1) {
    const row = matrix[i]!;
    row[0] = i;
  }
  const firstRow = matrix[0]!;
  for (let j = 0; j < cols; j += 1) {
    firstRow[j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const currentRow = matrix[i]!;
      const previousRow = matrix[i - 1]!;
      const deletion = previousRow[j]! + 1;
      const insertion = currentRow[j - 1]! + 1;
      const substitution = previousRow[j - 1]! + cost;
      currentRow[j] = Math.min(deletion, insertion, substitution);
    }
  }

  const lastRow = matrix[rows - 1]!;
  return lastRow[cols - 1]!;
};

const isNodeError = (error: unknown): error is NodeJS.ErrnoException =>
  typeof error === "object" && error !== null && "code" in error;

export const DEFAULT_FUZZY_DISTANCE = 2;
export const DEFAULT_MINIMUM_EXAMPLES = 10;

export const toAutomodMessage = (message: Message): AutomodMessage => ({
  id: message.id,
  authorId: message.author.id,
  channelId: message.channelId,
  content: message.content,
  createdTimestamp: message.createdTimestamp,
});

const ensureLogFile = async (logPath: string): Promise<void> => {
  await mkdir(dirname(logPath), { recursive: true });
  // eslint-disable-next-line functional/no-try-statements
  try {
    await access(logPath, constants.F_OK);
  } catch (error: unknown) {
    if (!isNodeError(error) || error.code !== "ENOENT") {
      throw error;
    }
    const header = stringify([CSV_HEADER], { header: false });
    await writeFile(logPath, header, "utf8");
  }
};

const appendLoggedMessage = async (
  logPath: string,
  message: LoggedMessage,
): Promise<void> => {
  const row = stringify([
    [
      message.id,
      message.authorId,
      message.channelId,
      message.content.replace(/\r?\n/g, " "),
      String(message.createdTimestamp),
    ],
  ]);
  await appendFile(logPath, row, "utf8");
};

const readLoggedMessages = async (
  logPath: string,
): Promise<LoggedMessage[]> => {
  // eslint-disable-next-line functional/no-try-statements
  try {
    const content = await readFile(logPath, "utf8");
    if (content.trim().length === 0) {
      return [];
    }
    const rows = parse(content, {
      columns: true,
      skip_empty_lines: true,
    }) as Array<{
      messageId: string;
      userId: string;
      channelId: string;
      content: string;
      timestamp: string;
    }>;
    return rows.map((row) => ({
      id: row.messageId,
      authorId: row.userId,
      channelId: row.channelId,
      content: row.content,
      createdTimestamp: Number.parseInt(row.timestamp, 10),
    }));
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

export const containsSora = (text: string): boolean => /\bsora\b/i.test(text);

export const hasFuzzyCode = (
  text: string,
  maxDistance = DEFAULT_FUZZY_DISTANCE,
): boolean => {
  const tokens = text.split(/\W+/).filter(Boolean);
  return tokens.some(
    (token) => levenshteinDistance(token.toLowerCase(), "code") <= maxDistance,
  );
};

const evaluateWithRules = (
  text: string,
  maxDistance: number,
): ModerationDecision => {
  if (containsSora(text) && hasFuzzyCode(text, maxDistance)) {
    return { action: "delete", reason: "rule" };
  }
  return { action: "allow", reason: "rule:allow" };
};

const snapshotState = (state: AutomodState): AutomodSnapshot => ({
  bannedExamples: [...state.bannedExamples],
  allowedExamples: [...state.allowedExamples],
  classifierActive: state.classifierActive,
});

export type AutomodController = {
  evaluate: (text: string) => ModerationDecision;
  handleMessage: (message: AutomodMessage) => Promise<ModerationDecision>;
  addExample: (text: string, type: ExampleType) => AutomodSnapshot;
  trainClassifier: () => AutomodSnapshot;
  activateClassifier: () => boolean;
  deactivateClassifier: () => void;
  promoteLoggedMessage: (
    messageId: string,
    type: ExampleType,
  ) => Promise<AutomodSnapshot>;
  listLoggedMessages: (limit?: number) => Promise<LoggedMessage[]>;
  getSnapshot: () => AutomodSnapshot;
};

export const createAutomod = async (
  options: AutomodOptions,
): Promise<AutomodController> => {
  const fuzzyDistance = options.fuzzyDistance ?? DEFAULT_FUZZY_DISTANCE;
  const minimumExamples = options.minimumExamples ?? DEFAULT_MINIMUM_EXAMPLES;
  await ensureLogFile(options.logPath);

  const stateHolder: { current: AutomodState } = {
    current: {
      bannedExamples: new Set<string>(),
      allowedExamples: new Set<string>(),
      classifier: null,
      classifierActive: false,
    },
  };

  const getState = (): AutomodState => stateHolder.current;
  const updateState = (
    reducer: (state: AutomodState) => AutomodState,
  ): AutomodState => {
    const nextState = reducer(getState());
    // eslint-disable-next-line functional/immutable-data
    stateHolder.current = nextState;
    return nextState;
  };

  const evaluate = (text: string): ModerationDecision => {
    const ruleDecision = evaluateWithRules(text, fuzzyDistance);
    if (ruleDecision.action === "delete") {
      return ruleDecision;
    }

    const state = getState();
    if (state.classifierActive && state.classifier) {
      const label = state.classifier.categorize(text);
      if (label === "banned") {
        return { action: "delete", reason: "classifier:banned" };
      }
      if (label === "allowed") {
        return { action: "allow", reason: "classifier:allowed" };
      }
    }
    return ruleDecision;
  };

  const addExample = (text: string, type: ExampleType): AutomodSnapshot => {
    const trimmed = text.trim();
    if (!trimmed) {
      return snapshotState(getState());
    }
    const nextState = updateState((state) => ({
      ...state,
      bannedExamples:
        type === "banned"
          ? new Set<string>([...state.bannedExamples, trimmed])
          : state.bannedExamples,
      allowedExamples:
        type === "allowed"
          ? new Set<string>([...state.allowedExamples, trimmed])
          : state.allowedExamples,
    }));
    return snapshotState(nextState);
  };

  const trainClassifier = (): AutomodSnapshot => {
    const state = getState();
    if (state.bannedExamples.size === 0 || state.allowedExamples.size === 0) {
      throw new Error("Need examples for both classes before training");
    }
    const classifier = new TextNaiveBayes();
    state.bannedExamples.forEach((example) =>
      classifier.learn(example, "banned"),
    );
    state.allowedExamples.forEach((example) =>
      classifier.learn(example, "allowed"),
    );
    const nextState = updateState((previous) => ({
      ...previous,
      classifier,
    }));
    return snapshotState(nextState);
  };

  const activateClassifier = (): boolean => {
    const state = getState();
    if (!state.classifier) {
      return false;
    }
    if (
      state.bannedExamples.size < minimumExamples ||
      state.allowedExamples.size < minimumExamples
    ) {
      return false;
    }
    updateState((previous) => ({
      ...previous,
      classifierActive: true,
    }));
    return true;
  };

  const deactivateClassifier = (): void => {
    updateState((previous) => ({
      ...previous,
      classifierActive: false,
    }));
  };

  const handleMessage = async (
    message: AutomodMessage,
  ): Promise<ModerationDecision> => {
    const decision = evaluate(message.content);
    if (decision.action === "delete") {
      await appendLoggedMessage(options.logPath, message);
    }
    return decision;
  };

  const promoteLoggedMessage = async (
    messageId: string,
    type: ExampleType,
  ): Promise<AutomodSnapshot> => {
    const rows = await readLoggedMessages(options.logPath);
    const found = rows.find((row) => row.id === messageId);
    if (!found) {
      throw new Error("Message not found in log");
    }
    return addExample(found.content, type);
  };

  const listLoggedMessages = async (
    limit?: number,
  ): Promise<LoggedMessage[]> => {
    const rows = await readLoggedMessages(options.logPath);
    if (typeof limit === "number") {
      return rows.slice(0, limit);
    }
    return rows;
  };

  const getSnapshot = (): AutomodSnapshot => snapshotState(getState());

  return {
    evaluate,
    handleMessage,
    addExample,
    trainClassifier,
    activateClassifier,
    deactivateClassifier,
    promoteLoggedMessage,
    listLoggedMessages,
    getSnapshot,
  };
};
