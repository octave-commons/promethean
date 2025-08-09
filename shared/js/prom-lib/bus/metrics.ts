export interface BrokerMetrics {
  published: number;
  delivered: number;
  acks: number;
  redeliveries: number;
  inflight: number;
  byTopic: Record<string, { pub: number; del: number }>;
}
export class Metrics {
  s: BrokerMetrics = {
    published: 0,
    delivered: 0,
    acks: 0,
    redeliveries: 0,
    inflight: 0,
    byTopic: {},
  };
  inc(t: keyof BrokerMetrics, topic?: string) {
    (this.s as any)[t]++;
    if (topic) {
      const bt =
        this.s.byTopic[topic] ?? (this.s.byTopic[topic] = { pub: 0, del: 0 });
      if (t === "published") bt.pub++;
      if (t === "delivered") bt.del++;
    }
  }
  snapshot() {
    return JSON.parse(JSON.stringify(this.s));
  }
}
