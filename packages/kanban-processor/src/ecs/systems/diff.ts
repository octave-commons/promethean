import type {
  SystemSpec,
  SystemContext,
} from "@promethean/ds/ecs.scheduler.js";

import type {
  KanbanCard,
  BoardSnapshotState,
  TaskDiffState,
  PreviousState,
} from "../components.js";
import { EVENTS } from "./filesystem.js";

export function createDiffSystem(
  components: {
    BoardSnapshot: any;
    TaskDiff: any;
    PreviousCards: any;
  },
  entity: number,
): SystemSpec {
  return {
    name: "kanban.diff",
    stage: "late",
    readsComponents: [components.BoardSnapshot, components.PreviousCards],
    writesComponents: [components.TaskDiff, components.PreviousCards],
    run({ world, cmd }: SystemContext) {
      const snapshot = world.get(entity, components.BoardSnapshot) as
        | BoardSnapshotState
        | undefined;
      if (!snapshot || snapshot.version === 0) return;

      const currentDiff = world.get(entity, components.TaskDiff) as
        | TaskDiffState
        | undefined;
      if (currentDiff && currentDiff.version === snapshot.version) return;

      const previous =
        (world.get(entity, components.PreviousCards) as
          | PreviousState
          | undefined) ||
        ({ map: {} as Record<string, KanbanCard> } as PreviousState);

      const nextMap: Record<string, KanbanCard> = {};
      const events: { type: string; payload: any }[] = [];

      for (const card of snapshot.cards) {
        nextMap[card.id] = card;
        const prev = previous.map[card.id];
        if (!prev) {
          events.push({ type: EVENTS.cardCreated, payload: card });
          continue;
        }
        if (prev.column !== card.column) {
          events.push({
            type: EVENTS.cardMoved,
            payload: { id: card.id, from: prev.column, to: card.column },
          });
        }
        if (prev.title !== card.title) {
          events.push({
            type: EVENTS.cardRenamed,
            payload: { id: card.id, from: prev.title, to: card.title },
          });
        }
        if (prev.link !== card.link) {
          events.push({
            type: EVENTS.cardTaskChanged,
            payload: { id: card.id, from: prev.link, to: card.link },
          });
        }
      }

      cmd.set(entity, components.TaskDiff, {
        version: snapshot.version,
        events,
        upserts: snapshot.cards,
      });
      cmd.set(entity, components.PreviousCards, { map: nextMap });
    },
  };
}
