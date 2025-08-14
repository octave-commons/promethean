let client: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  client = await import("prom-client");
} catch {
  client = null;
}

type Labels = Record<string, string>;

export const metrics = {
  counters: new Map<string, any>(),
  histos: new Map<string, any>(),
  gauge(name: string, help: string) {
    if (!client) return { set: () => {} };
    const g = new client.Gauge({ name, help });
    return g;
  },
  counter(name: string, help: string) {
    if (!client) return { inc: (_l?: Labels, _v?: number) => {} };
    if (!metrics.counters.has(name)) {
      metrics.counters.set(
        name,
        new client.Counter({ name, help, labelNames: ["topic", "group"] }),
      );
    }
    return metrics.counters.get(name);
  },
  histo(name: string, help: string, buckets?: number[]) {
    if (!client) return { observe: (_l?: Labels, _v?: number) => {} };
    if (!metrics.histos.has(name)) {
      metrics.histos.set(
        name,
        new client.Histogram({
          name,
          help,
          labelNames: ["topic", "group"],
          buckets: buckets ?? [5, 10, 25, 50, 100, 250, 500, 1000],
        }),
      );
    }
    return metrics.histos.get(name);
  },
  expose(app: any, path = "/metrics") {
    if (!client) return;
    const reg = client.register;
    app.get(path, async (_req: any, res: any) => {
      res.set("Content-Type", reg.contentType);
      res.end(await reg.metrics());
    });
  },
};
