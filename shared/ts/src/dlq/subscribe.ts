import { EventBus, EventRecord } from "../event/types";
import { dlqTopic } from "./types";

export function withDLQ(
  bus: EventBus,
  { maxAttempts = 5, group }: { maxAttempts?: number; group: string },
) {
  return async function subscribeWithDLQ(
    topic: string,
    handler: (e: EventRecord) => Promise<void>,
    opts: any = {},
  ) {
    let attempts = new Map<string, number>();

    return bus.subscribe(
      topic,
      group,
      async (e) => {
        const n = (attempts.get(e.id) ?? 0) + 1;
        attempts.set(e.id, n);

        try {
          await handler(e);
          attempts.delete(e.id);
        } catch (err: any) {
          if (n >= maxAttempts) {
            await bus.publish(dlqTopic(topic), {
              topic,
              group,
              original: e,
              err: String(err?.stack ?? err?.message ?? err),
              ts: Date.now(),
              attempts: n,
            });
            attempts.delete(e.id);
          } else {
            throw err; // cause redelivery
          }
        }
      },
      opts,
    );
  };
}
