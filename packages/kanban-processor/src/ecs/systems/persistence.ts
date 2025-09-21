import type { MongoClient } from "mongodb";
import type {
  SystemSpec,
  SystemContext,
} from "@promethean/ds/ecs.scheduler.js";

import type { KanbanCard } from "../components.js";

export type PersistenceResource = {
  context: any;
  getMongoClient: () => Promise<MongoClient>;
  store: any | null;
  mongoClient: MongoClient | null;
  initPromise: Promise<void> | null;
  lastVersion: number;
};

export function createPersistenceSystem(
  components: { TaskDiff: any },
  entity: number,
): SystemSpec {
  return {
    name: "kanban.persistence",
    stage: "render",
    reads: ["persistence"],
    writes: ["persistence"],
    readsComponents: [components.TaskDiff],
    async run({ resources, world }: SystemContext) {
      const persistence = resources.get("persistence") as PersistenceResource;
      if (!persistence.store) {
        if (!persistence.initPromise) {
          persistence.initPromise = (async () => {
            try {
              persistence.mongoClient = await persistence.getMongoClient();
              persistence.store = await persistence.context.createCollection(
                "kanban",
                "title",
                "updatedAt",
              );
            } catch (err) {
              console.error("kanban persistence init failed", err);
              persistence.mongoClient = null;
              persistence.store = null;
            }
          })();
        }
        try {
          await persistence.initPromise;
        } catch (err) {
          console.error("kanban persistence init promise failed", err);
          persistence.initPromise = null;
          return;
        }
      }
      if (!persistence.store) return;

      const diff = world.get(entity, components.TaskDiff) as
        | { version: number; upserts: KanbanCard[] }
        | undefined;
      if (!diff || diff.version === 0) return;
      if (persistence.lastVersion === diff.version) return;

      for (const card of diff.upserts) {
        try {
          await persistence.store.mongoCollection.updateOne(
            { id: card.id },
            { $set: card },
            { upsert: true },
          );
        } catch (err) {
          console.error("kanban persistence update failed", err);
        }
      }

      persistence.lastVersion = diff.version;
    },
  };
}

export async function closePersistence(persistence: PersistenceResource) {
  try {
    await persistence.mongoClient?.close();
  } catch (err) {
    console.error("kanban mongo close failed", err);
  }
}
