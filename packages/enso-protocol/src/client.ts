import { Envelope } from "@promethean/enso-protocol/envelope.js";

type Handler = (env: Envelope) => void;

export class EnsoClient {
  private ws?: WebSocket;
  private handlers = new Map<string, Set<Handler>>();

  constructor(
    private url: string,
    private token: string,
  ) {}

  async connect(hello: any) {
    this.ws = new WebSocket(this.url, []);
    await new Promise((res) => (this.ws!.onopen = res));
    this.on("event:privacy.accepted", () => {}); // example
    this.send({ kind: "event", type: "hello", payload: hello } as Envelope);
    this.ws!.onmessage = (ev) => {
      const env = JSON.parse(ev.data.toString()) as Envelope;
      const key = `${env.kind}:${env.type}`;
      this.handlers.get(key)?.forEach((h) => h(env));
    };
  }

  on(key: string, fn: Handler) {
    (this.handlers.get(key) ?? this.handlers.set(key, new Set()).get(key)!).add(
      fn,
    );
    return () => this.handlers.get(key)?.delete(fn);
  }
  send(env: Envelope) {
    this.ws!.send(JSON.stringify(env));
  }

  // high-level helpers
  async post(message: any) {
    this.send({
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      room: "r1",
      from: "",
      kind: "event",
      type: "content.post",
      payload: { room: "r1", message },
    });
  }
  assets = {
    putFile: async (path: string, mime: string) => {
      /* stream chunks via asset.put/asset.chunk */ return {
        uri: "enso://asset/…",
        cid: "cid:sha256-…",
      };
    },
  };
  contexts = {
    create: async (name: string) => {
      /*…*/
    },
    pin: async (id: any) => {
      /*…*/
    },
    apply: async () => {
      /*…*/
    },
  };
}
