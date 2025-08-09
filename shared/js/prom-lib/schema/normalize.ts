import { EventBus, EventRecord } from "../event/types";
import { SchemaRegistry } from "./registry";
import { UpcastChain } from "./upcast";

export async function subscribeNormalized(
  bus: EventBus,
  topic: string,
  group: string,
  reg: SchemaRegistry,
  up: UpcastChain,
  handler: (e: EventRecord) => Promise<void>,
  opts: any = {},
) {
  return bus.subscribe(
    topic,
    group,
    async (e) => {
      const norm = up.toLatest(topic, e, reg);
      reg.validate(
        topic,
        norm.payload,
        Number(norm.headers?.["x-schema-version"]),
      );
      await handler(norm);
    },
    opts,
  );
}
