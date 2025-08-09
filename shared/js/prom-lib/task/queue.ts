import { BusClient } from "../bus/client";
import { IMessageFrame } from "../bus/types";
import { Task } from "./types";

export class TaskQueue {
  constructor(
    private bus: BusClient,
    private topic: string,
    private group = "workers",
  ) {}

  enqueue<T>(payload: T, key?: string) {
    this.bus.publish(this.topic, { payload }, key);
  }

  start(handler: (task: Task) => Promise<void>) {
    this.bus.subscribe(
      {
        topic: this.topic,
        group: this.group,
        from: { kind: "latest" },
        max_inflight: 16,
      },
      async (m: IMessageFrame) => {
        const task: Task = {
          id: m.envelope.id,
          topic: m.topic,
          payload: (m.envelope as any).payload,
        };
        try {
          await handler(task);
          this.bus.ack({
            type: "ACK",
            topic: m.topic,
            partition: m.partition,
            group: m.group,
            offset: m.offset,
          });
        } catch (e) {
          this.bus.ack({
            type: "NACK",
            topic: m.topic,
            partition: m.partition,
            group: m.group,
            offset: m.offset,
            reason: String(e),
          });
        }
      },
    );
  }
}
