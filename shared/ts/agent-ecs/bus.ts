import WebSocket from "ws";

type Handler<T> = (msg: T) => void;

export class AgentBus {
  private open = false;
  private pending: { topic: string; handler?: Handler<any>; payload?: any }[] =
    [];

  constructor(private ws: WebSocket) {
    ws.on("open", () => {
      this.open = true;
      for (const item of this.pending) {
        if (item.handler) {
          this.ws.send(
            JSON.stringify({ action: "subscribe", topic: item.topic }),
          );
        } else {
          this.ws.send(
            JSON.stringify({
              action: "publish",
              topic: item.topic,
              payload: item.payload,
            }),
          );
        }
      }
      this.pending = [];
    });

    ws.on("message", (data: WebSocket.RawData) => {
      let m: any;
      try {
        m = JSON.parse(data.toString());
      } catch {
        return;
      }
      if (!m?.topic) return;
      const h = this.handlers.get(m.topic);
      if (h) h.forEach((fn) => fn(m.payload));
    });
  }

  private handlers = new Map<string, Handler<any>[]>();

  publish<T extends { topic: string }>(msg: T) {
    const payload = { action: "publish", topic: msg.topic, payload: msg };
    if (!this.open) this.pending.push({ topic: msg.topic, payload: msg });
    else this.ws.send(JSON.stringify(payload));
  }

  subscribe<T>(topic: string, handler: Handler<T>) {
    const arr = this.handlers.get(topic) ?? [];
    arr.push(handler);
    this.handlers.set(topic, arr);
    if (!this.open) this.pending.push({ topic, handler });
    else this.ws.send(JSON.stringify({ action: "subscribe", topic }));
  }
}
