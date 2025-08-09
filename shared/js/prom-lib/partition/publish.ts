import { EventBus, PublishOptions } from "../event/types";
import { jumpHash } from "./jump";

export function withPartitioning(
  bus: EventBus,
  partitions: number,
  keyOf?: (payload: any, opts?: PublishOptions) => string | undefined,
): EventBus {
  return {
    ...bus,
    async publish(topic, payload, opts: PublishOptions = {}) {
      if (opts.partition == null) {
        const key =
          keyOf?.(payload, opts) ??
          opts.key ??
          JSON.stringify(payload).slice(0, 64);
        opts.partition = jumpHash(String(key ?? ""), partitions);
      }
      return bus.publish(topic, payload, opts);
    },
  };
}
