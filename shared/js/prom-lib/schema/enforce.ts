import { EventBus, PublishOptions, EventRecord } from "../event/types";
import { SchemaRegistry } from "./registry";

export function withSchemaValidation(
  bus: EventBus,
  reg: SchemaRegistry,
): EventBus {
  return {
    ...bus,
    async publish<T>(
      topic: string,
      payload: T,
      opts: PublishOptions = {},
    ): Promise<EventRecord<T>> {
      const latest = reg.latest(topic);
      if (latest) {
        reg.validate(topic, payload, latest.version);
        opts.headers = {
          ...(opts.headers || {}),
          "x-schema-version": String(latest.version),
        };
      }
      return bus.publish(topic, payload, opts);
    },
  };
}
