import WebSocket from "ws";
import { Ack, IMessageFrame, PublishRequest, SubscribeRequest } from "./types";

export class BusClient {
  private ws?: WebSocket;
  private url: string;
  private backoff = 500;
  private max = 10_000;
  private pending: any[] = [];
  constructor(url = process.env.BUS_URL || "ws://127.0.0.1:7070") {
    this.url = url;
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.url);
    this.ws.on("open", () => {
      this.backoff = 500;
      for (const m of this.pending.splice(0)) this.ws!.send(JSON.stringify(m));
    });
    this.ws.on("message", (buf: WebSocket.RawData) =>
      this.onMessage(JSON.parse(buf.toString())),
    );
    this.ws.on("close", () =>
      setTimeout(
        () => this.connect(),
        (this.backoff = Math.min(this.max, this.backoff * 2)),
      ),
    );
    this.ws.on("error", () => {});
  }

  private send(obj: any) {
    const s = JSON.stringify(obj);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(s);
    else this.pending.push(obj);
  }

  publish<T>(
    topic: string,
    payload: T,
    key?: string,
    headers?: Record<string, string>,
  ) {
    const msg: PublishRequest<T> = {
      type: "PUBLISH",
      topic,
      key,
      headers,
      payload,
    };
    this.send(msg);
  }

  subscribe(
    req: Omit<SubscribeRequest, "type">,
    onMessage: (m: IMessageFrame) => void,
    onError?: (e: any) => void,
  ) {
    this.onMessage = (m) => {
      if (m.type === "MESSAGE" && m.topic === req.topic)
        onMessage(m as IMessageFrame);
    };
    this.send({ type: "SUBSCRIBE", ...req });
  }

  ack(ack: Ack) {
    this.send(ack);
  }

  // overrideable hook
  protected onMessage(_m: any) {}
}
