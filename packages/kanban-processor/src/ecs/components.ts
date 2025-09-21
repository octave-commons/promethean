import type { World } from "@promethean/ds/ecs.js";

export type KanbanCard = {
  id: string;
  title: string;
  column: string;
  link: string;
};

export type BoardSnapshotState = {
  version: number;
  source: "none" | "board" | "tasks";
  updatedAt: number;
  cards: KanbanCard[];
};

export type TaskDiffState = {
  version: number;
  events: { type: string; payload: any }[];
  upserts: KanbanCard[];
};

export type BrokerQueueState = {
  lastVersion: number;
  pending: { type: string; payload: any }[];
};

export type PreviousState = {
  map: Record<string, KanbanCard>;
};

export const defineKanbanComponents = (w: World) => {
  const BoardSnapshot = w.defineComponent<BoardSnapshotState>({
    name: "BoardSnapshot",
    defaults: () => ({
      version: 0,
      source: "none" as const,
      updatedAt: 0,
      cards: [],
    }),
  });

  const TaskDiff = w.defineComponent<TaskDiffState>({
    name: "TaskDiff",
    defaults: () => ({
      version: 0,
      events: [],
      upserts: [],
    }),
  });

  const BrokerQueue = w.defineComponent<BrokerQueueState>({
    name: "BrokerQueue",
    defaults: () => ({
      lastVersion: 0,
      pending: [],
    }),
  });

  const PreviousCards = w.defineComponent<PreviousState>({
    name: "PreviousCards",
    defaults: () => ({
      map: {},
    }),
  });

  return {
    BoardSnapshot,
    TaskDiff,
    BrokerQueue,
    PreviousCards,
  };
};
