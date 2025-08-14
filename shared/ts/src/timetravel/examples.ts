import { reconstructAt } from "./reconstruct";
import { MongoEventStore } from "../event/mongo";

export async function processAt(
  store: MongoEventStore,
  processId: string,
  atTs: number,
) {
  return reconstructAt(store, {
    topic: "process.state",
    key: processId,
    atTs,
    apply: (_prev, e) => e.payload as any,
  });
}
