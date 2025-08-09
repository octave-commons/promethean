import {
  EventBus,
  EventRecord,
  EventStore,
  CursorStore,
  PublishOptions,
  CursorPosition,
  Ack,
  Millis,
  UUID,
} from "./types";

const now = () => Date.now();
// NOTE: use a proper uuidv7 lib in prod. Placeholder monotonic-ish ULID-like id:
let _ctr = 0;
const uuidv7 = (): UUID =>
  `${Date.now().toString(16)}-${(_ctr++)
    .toString(16)
    .padStart(6, "0")}-${Math.random().toString(16).slice(2, 10)}`;

export class InMemoryEventStore implements EventStore {
  private byTopic = new Map<string, EventRecord[]>();
  async insert<T>(e: EventRecord<T>): Promise<void> {
    const arr = this.byTopic.get(e.topic) ?? [];
    arr.push(e);
    this.byTopic.set(e.topic, arr);
  }
  async scan(
    topic: string,
    params: { afterId?: UUID; ts?: Millis; limit?: number },
  ): Promise<EventRecord[]> {
    const arr = this.byTopic.get(topic) ?? [];
    let startIdx = 0;
    if (params.afterId) {
      const i = arr.findIndex((x) => x.id === params.afterId);
      startIdx = i >= 0 ? i + 1 : 0;
    } else if (params.ts) {
      startIdx = arr.findIndex((x) => x.ts >= params.ts!);
      if (startIdx < 0) startIdx = arr.length;
    }
    const slice = arr.slice(
      startIdx,
      params.limit ? startIdx + params.limit : undefined,
    );
    return slice;
  }
}

export class InMemoryCursorStore implements CursorStore {
  private map = new Map<string, CursorPosition>();
  key(t: string, g: string) {
    return `${t}::${g}`;
  }
  async get(topic: string, group: string) {
    return this.map.get(this.key(topic, group)) ?? null;
  }
  async set(topic: string, group: string, cursor: CursorPosition) {
    this.map.set(this.key(topic, group), cursor);
  }
}

type Sub = {
  topic: string;
  group: string;
  handler: (e: EventRecord, ctx: any) => Promise<void>;
  opts: any;
  stopped: boolean;
  inflight: number;
  timer?: any;
  kicking: boolean;
};

export class InMemoryEventBus implements EventBus {
  private store: EventStore;
  private cursors: CursorStore;
  private subs: Set<Sub> = new Set();

  constructor(
    store: EventStore = new InMemoryEventStore(),
    cursors: CursorStore = new InMemoryCursorStore(),
  ) {
    this.store = store;
    this.cursors = cursors;
  }

  async publish<T>(
    topic: string,
    payload: T,
    opts: PublishOptions = {},
  ): Promise<EventRecord<T>> {
    const rec: EventRecord<T> = {
      id: opts.id ?? uuidv7(),
      sid: opts.sid,
      ts: opts.ts ?? now(),
      topic,
      key: opts.key,
      headers: opts.headers,
      payload,
      caused_by: opts.caused_by,
      tags: opts.tags,
    };
    await this.store.insert(rec);
    // kick all subs on this topic
    for (const sub of this.subs) if (sub.topic === topic) this.kick(sub);
    return rec;
  }

  async subscribe(
    topic: string,
    group: string,
    handler: Sub["handler"],
    opts: any = {},
  ): Promise<() => Promise<void>> {
    const sub: Sub = {
      topic,
      group,
      handler,
      opts,
      stopped: false,
      inflight: 0,
      kicking: false,
    };
    this.subs.add(sub);
    this.kick(sub);
    return async () => {
      sub.stopped = true;
      this.subs.delete(sub);
      if (sub.timer) clearTimeout(sub.timer);
    };
  }

  private async kick(sub: Sub) {
    if (sub.stopped || sub.kicking || sub.inflight > 0) return;
    sub.kicking = true;
    try {
      const {
        batchSize = 100,
        maxInFlight = 1000,
        maxAttempts = 5,
        from = "latest",
        ts,
        afterId,
        filter,
      } = sub.opts;

      let cursor = await this.cursors.get(sub.topic, sub.group);
      // initialize cursor
      if (!cursor) {
        if (from === "latest") {
          // scan last one to set baseline; no delivery
          const scan = await this.store.scan(sub.topic, { ts: 0 });
          const last = scan[scan.length - 1];
          cursor = { topic: sub.topic, lastId: last?.id, lastTs: last?.ts };
        } else if (from === "earliest") {
          cursor = { topic: sub.topic };
        } else if (from === "ts") {
          cursor = { topic: sub.topic, lastTs: ts };
        } else if (from === "afterId") {
          cursor = { topic: sub.topic, lastId: afterId };
        } else {
          cursor = { topic: sub.topic };
        }
        await this.cursors.set(sub.topic, sub.group, cursor);
      }

      const batch = await this.store.scan(sub.topic, {
        afterId: cursor.lastId,
        ts: cursor.lastTs,
        limit: batchSize,
      });
      const deliver = filter ? batch.filter(filter) : batch;

      if (deliver.length === 0) {
        // poll again soon
        sub.timer = setTimeout(() => this.kick(sub), 50);
        return;
      }

      for (const e of deliver) {
        if (sub.stopped) break;
        if (sub.inflight >= maxInFlight) break;

        sub.inflight++;
        const ctx = { attempt: 1, maxAttempts: maxAttempts, cursor };
        // fire-and-forget; ack immediately on success
        (async () => {
          try {
            await sub.handler(e, ctx);
            await this.ack(e.topic, sub.group, e.id);
          } catch (err) {
            // basic NACK: do nothing (consumer can reprocess on next kick)
            await this.nack(e.topic, sub.group, e.id, (err as Error)?.message);
          } finally {
            sub.inflight--;
            if (sub.inflight === 0) this.kick(sub);
          }
        })();
      }
    } finally {
      sub.kicking = false;
    }
  }

  async ack(topic: string, group: string, id: UUID): Promise<Ack> {
    const cursor = (await this.cursors.get(topic, group)) ?? { topic };
    // NOTE: we assume ascending (ts,id) order; real store should verify monotonicity
    cursor.lastId = id;
    await this.cursors.set(topic, group, cursor);
    return { id, ok: true };
  }

  async nack(
    topic: string,
    group: string,
    id: UUID,
    reason?: string,
  ): Promise<Ack> {
    // In-memory bus just leaves cursor unchanged; event will be re-delivered on next kick
    return { id, ok: true, err: reason };
  }

  getCursor(topic: string, group: string) {
    return this.cursors.get(topic, group);
  }
  setCursor(topic: string, group: string, cursor: CursorPosition) {
    return this.cursors.set(topic, group, cursor);
  }
}
