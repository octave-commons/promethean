import type { BrokerClient as JsBrokerClient } from "@shared/js/brokerClient.js";

type Handler<T> = (msg: T) => void;

export class AgentBus {
  private open = false;
  private pending: { topic: string; handler?: Handler<any>; payload?: any }[] =
    [];

  constructor(private broker: JsBrokerClient) {
    // `BrokerClient.connect()` opens the socket; mirror previous "open" behavior.
    void this.broker.connect().then(() => {
      this.open = true;
      for (const item of this.pending) {
        if (item.handler) {
          this.broker.subscribe(item.topic, (evt: any) => {
            const arr = this.handlers.get(item.topic);
            if (arr) arr.forEach((fn) => fn(evt?.payload));
          });
        } else {
          // maintain legacy shape
          this.broker.publish(item.topic, item.payload);
        }
      }
      this.pending = [];
    });
  }

  private handlers = new Map<string, Handler<any>[]>();

  publish<T extends { topic: string }>(msg: T) {
    if (!this.open) this.pending.push({ topic: msg.topic, payload: msg });
    else this.broker.publish(msg.topic, msg);
  }

  subscribe<T>(topic: string, handler: Handler<T>) {
    const arr = this.handlers.get(topic) ?? [];
    arr.push(handler);
    this.handlers.set(topic, arr);
    if (!this.open) this.pending.push({ topic, handler });
    else {
      this.broker.subscribe(topic, (evt: any) => {
        const list = this.handlers.get(topic);
        if (list) list.forEach((fn) => fn(evt?.payload));
      });
    }
  }
}
