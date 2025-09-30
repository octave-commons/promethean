import type {
  Counter,
  Gauge,
  Histogram,
  Registry,
  RegistryContentType,
} from "prom-client";
import type { ReadonlyDeep } from "type-fest";

type PromClientModule = typeof import("prom-client");

type MetricsResponse = {
  readonly set: (header: string, value: string) => void;
  readonly end: (body: string) => void;
};

type MetricsHandler = (
  request: unknown,
  response: MetricsResponse,
) => Promise<void>;

type MetricsApp = {
  readonly get: (path: string, handler: MetricsHandler) => void;
};

const labelNames = ["topic", "group"] as const;

const loadClient = async (): Promise<ReadonlyDeep<PromClientModule> | null> =>
  import("prom-client")
    .then((module) => module as ReadonlyDeep<PromClientModule>)
    .catch(() => null);

const promClient = await loadClient();

const createNoopMetric = <MetricType extends object>(): MetricType =>
  new Proxy(
    {},
    {
      get: (_target, property: string) => {
        if (property === "labels") {
          return () => createNoopMetric<MetricType>();
        }
        if (property === "startTimer") {
          return () => () => undefined;
        }
        return () => undefined;
      },
    },
  ) as MetricType;

const createCounterMetric = (name: string, help: string): Counter<string> => {
  if (!promClient) {
    return createNoopMetric<Counter<string>>();
  }

  const existing = promClient.register.getSingleMetric(name);

  if (existing instanceof promClient.Counter) {
    return existing;
  }

  return new promClient.Counter({
    name,
    help,
    labelNames,
  });
};

const createGaugeMetric = (name: string, help: string): Gauge<string> => {
  if (!promClient) {
    return createNoopMetric<Gauge<string>>();
  }

  const existing = promClient.register.getSingleMetric(name);

  if (existing instanceof promClient.Gauge) {
    return existing;
  }

  return new promClient.Gauge({ name, help });
};

const createHistogramMetric = (
  name: string,
  help: string,
  buckets: ReadonlyArray<number> | undefined,
): Histogram<string> => {
  if (!promClient) {
    return createNoopMetric<Histogram<string>>();
  }

  const existing = promClient.register.getSingleMetric(name);

  if (existing instanceof promClient.Histogram) {
    return existing;
  }

  return new promClient.Histogram({
    name,
    help,
    labelNames,
    buckets: buckets ? [...buckets] : [5, 10, 25, 50, 100, 250, 500, 1000],
  });
};

const exposeMetrics = (app: MetricsApp, path = "/metrics"): void => {
  if (!promClient) {
    return;
  }

  const registry: Registry<RegistryContentType> = promClient.register;

  app.get(path, async (_req, res) => {
    const contentType = registry.contentType;
    res.set("Content-Type", contentType);
    const payload = await registry.metrics();
    res.end(payload);
  });
};

export const metrics = {
  gauge: (name: string, help: string): Gauge<string> =>
    createGaugeMetric(name, help),
  counter: (name: string, help: string): Counter<string> =>
    createCounterMetric(name, help),
  histo: (
    name: string,
    help: string,
    buckets?: ReadonlyArray<number>,
  ): Histogram<string> => createHistogramMetric(name, help, buckets),
  expose: exposeMetrics,
};
