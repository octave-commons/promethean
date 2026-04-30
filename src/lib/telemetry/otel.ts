type TelemetryValue = string | number | boolean | null | undefined;
export type TelemetryAttributes = Record<string, TelemetryValue>;

type TelemetryLevel = "debug" | "info" | "warn" | "error";

type SpanStatus = "ok" | "error";

export interface TelemetrySpan {
  setAttribute: (key: string, value: TelemetryValue) => void;
  setAttributes: (attributes: TelemetryAttributes) => void;
  setStatus: (status: SpanStatus, message?: string) => void;
  recordError: (error: unknown) => void;
  end: (extraAttributes?: TelemetryAttributes) => void;
}

export interface TelemetryClient {
  readonly enabled: boolean;
  startSpan: (name: string, attributes?: TelemetryAttributes) => TelemetrySpan;
  recordMetric: (name: string, value: number, attributes?: TelemetryAttributes) => void;
  recordLog: (level: TelemetryLevel, message: string, attributes?: TelemetryAttributes) => void;
  flush: () => Promise<void>;
  shutdown: () => Promise<void>;
  getStats: () => {
    enabled: boolean;
    endpoint: string | null;
    queued: {
      traces: number;
      logs: number;
      metrics: number;
    };
    flushes: number;
    dropped: number;
    lastFlushAt: string | null;
  };
}

class NoopTelemetry implements TelemetryClient {
  readonly enabled = false;

  startSpan(): TelemetrySpan {
    return {
      setAttribute: () => {},
      setAttributes: () => {},
      setStatus: () => {},
      recordError: () => {},
      end: () => {},
    };
  }

  recordMetric(): void {}

  recordLog(): void {}

  async flush(): Promise<void> {}

  async shutdown(): Promise<void> {}

  getStats() {
    return {
      enabled: false,
      endpoint: null,
      queued: { traces: 0, logs: 0, metrics: 0 },
      flushes: 0,
      dropped: 0,
      lastFlushAt: null,
    };
  }
}

interface SpanRecord {
  traceId: string;
  spanId: string;
  name: string;
  startTimeUnixNano: string;
  endTimeUnixNano: string;
  attributes: TelemetryAttributes;
  status: SpanStatus;
  statusMessage?: string;
}

interface LogRecord {
  timeUnixNano: string;
  severityText: string;
  body: string;
  attributes: TelemetryAttributes;
}

interface MetricRecord {
  timeUnixNano: string;
  name: string;
  value: number;
  attributes: TelemetryAttributes;
}

interface OtelConfig {
  endpoint: string;
  headers: string;
  serviceName: string;
  resourceAttributes: string;
}

class OtlpHttpTelemetry implements TelemetryClient {
  readonly enabled = true;

  private readonly resourceAttributes: TelemetryAttributes;
  private readonly headers: Record<string, string>;
  private readonly endpoint: string;
  private readonly serviceName: string;

  private traceQueue: SpanRecord[] = [];
  private logQueue: LogRecord[] = [];
  private metricQueue: MetricRecord[] = [];

  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private flushInFlight: Promise<void> | null = null;

  private flushes = 0;
  private dropped = 0;
  private lastFlushAt: string | null = null;

  constructor(config: OtelConfig) {
    this.endpoint = config.endpoint;
    this.headers = {
      ...parseHeaderEnv(config.headers),
      "content-type": "application/json",
    };
    this.serviceName = config.serviceName;
    this.resourceAttributes = {
      service_name: config.serviceName,
      ...parseResourceAttributes(config.resourceAttributes),
    };
  }

  startSpan(name: string, attributes: TelemetryAttributes = {}): TelemetrySpan {
    const attr: TelemetryAttributes = { ...attributes };
    let status: SpanStatus = "ok";
    let statusMessage: string | undefined;
    const traceId = randomHex(16);
    const spanId = randomHex(8);
    const startTimeUnixNano = unixTimeNano();

    return {
      setAttribute: (key, value) => {
        attr[key] = value;
      },
      setAttributes: (attributes) => {
        Object.assign(attr, attributes);
      },
      setStatus: (nextStatus, nextMessage) => {
        status = nextStatus;
        statusMessage = nextMessage;
      },
      recordError: (error) => {
        status = "error";
        statusMessage = toErrorMessage(error);
      },
      end: (extraAttributes = {}) => {
        const record: SpanRecord = {
          traceId,
          spanId,
          name,
          startTimeUnixNano,
          endTimeUnixNano: unixTimeNano(),
          attributes: {
            ...attr,
            ...extraAttributes,
          },
          status,
          statusMessage,
        };

        this.traceQueue.push(record);
        this.scheduleFlush();
      },
    };
  }

  recordMetric(name: string, value: number, attributes: TelemetryAttributes = {}): void {
    this.metricQueue.push({
      timeUnixNano: unixTimeNano(),
      name,
      value,
      attributes,
    });

    this.scheduleFlush();
  }

  recordLog(level: TelemetryLevel, message: string, attributes: TelemetryAttributes = {}): void {
    this.logQueue.push({
      timeUnixNano: unixTimeNano(),
      severityText: level.toUpperCase(),
      body: message,
      attributes,
    });

    this.scheduleFlush();
  }

  async flush(): Promise<void> {
    if (this.flushInFlight) {
      await this.flushInFlight;
      return;
    }

    const traces = this.traceQueue;
    const logs = this.logQueue;
    const metrics = this.metricQueue;

    this.traceQueue = [];
    this.logQueue = [];
    this.metricQueue = [];

    if (traces.length === 0 && logs.length === 0 && metrics.length === 0) {
      return;
    }

    this.flushInFlight = (async () => {
      try {
        await Promise.all([
          traces.length ? this.post("traces", buildTracePayload(traces, this.resourceAttributes, this.serviceName)) : Promise.resolve(),
          logs.length ? this.post("logs", buildLogPayload(logs, this.resourceAttributes, this.serviceName)) : Promise.resolve(),
          metrics.length ? this.post("metrics", buildMetricPayload(metrics, this.resourceAttributes, this.serviceName)) : Promise.resolve(),
        ]);

        this.flushes += 1;
        this.lastFlushAt = new Date().toISOString();
      } catch (error) {
        this.dropped += traces.length + logs.length + metrics.length;
        console.warn("[telemetry] OTLP flush failed", toErrorMessage(error));
      } finally {
        this.flushInFlight = null;
      }
    })();

    await this.flushInFlight;
  }

  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    await this.flush();
  }

  getStats() {
    return {
      enabled: true,
      endpoint: this.endpoint,
      queued: {
        traces: this.traceQueue.length,
        logs: this.logQueue.length,
        metrics: this.metricQueue.length,
      },
      flushes: this.flushes,
      dropped: this.dropped,
      lastFlushAt: this.lastFlushAt,
    };
  }

  private scheduleFlush() {
    if (this.flushTimer) return;

    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      void this.flush();
    }, 250);
  }

  private async post(signal: "traces" | "logs" | "metrics", payload: unknown): Promise<void> {
    const endpoint = resolveSignalEndpoint(this.endpoint, signal);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`OTLP ${signal} export failed (${response.status}): ${body.slice(0, 200)}`);
    }
  }
}

function parseHeaderEnv(value: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!value.trim()) return headers;

  for (const chunk of value.split(",")) {
    const [rawKey, ...rest] = chunk.split("=");
    const key = rawKey?.trim();
    if (!key) continue;
    const headerValue = rest.join("=").trim();
    headers[key] = headerValue;
  }

  return headers;
}

function parseResourceAttributes(value: string): TelemetryAttributes {
  const attributes: TelemetryAttributes = {};
  if (!value.trim()) return attributes;

  for (const chunk of value.split(",")) {
    const [rawKey, ...rest] = chunk.split("=");
    const key = rawKey?.trim();
    if (!key) continue;
    attributes[key] = rest.join("=").trim();
  }

  return attributes;
}

function resolveSignalEndpoint(baseEndpoint: string, signal: "traces" | "logs" | "metrics"): string {
  const normalizedBase = baseEndpoint.endsWith("/") ? baseEndpoint : `${baseEndpoint}/`;
  return new URL(`v1/${signal}`, normalizedBase).toString();
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function randomHex(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function unixTimeNano(): string {
  return `${BigInt(Date.now()) * 1_000_000n}`;
}

function toAnyValue(value: TelemetryValue): Record<string, unknown> {
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { intValue: `${value}` }
      : { doubleValue: value };
  }
  if (typeof value === "boolean") return { boolValue: value };
  if (value === null || value === undefined) return { stringValue: "" };
  return { stringValue: String(value) };
}

function toOtlpAttributes(attributes: TelemetryAttributes): Array<{ key: string; value: Record<string, unknown> }> {
  return Object.entries(attributes).map(([key, value]) => ({
    key,
    value: toAnyValue(value),
  }));
}

function buildResource(attributes: TelemetryAttributes, serviceName: string) {
  return {
    attributes: toOtlpAttributes({
      service: serviceName,
      ...attributes,
    }),
  };
}

const SCOPE_NAME = "proxx";

function buildTracePayload(records: SpanRecord[], resourceAttributes: TelemetryAttributes, serviceName: string) {
  return {
    resourceSpans: [
      {
        resource: buildResource(resourceAttributes, serviceName),
        scopeSpans: [
          {
            scope: { name: SCOPE_NAME },
            spans: records.map((record) => ({
              traceId: record.traceId,
              spanId: record.spanId,
              name: record.name,
              kind: 1,
              startTimeUnixNano: record.startTimeUnixNano,
              endTimeUnixNano: record.endTimeUnixNano,
              attributes: toOtlpAttributes(record.attributes),
              status: {
                code: record.status === "error" ? 2 : 1,
                message: record.statusMessage || "",
              },
            })),
          },
        ],
      },
    ],
  };
}

function buildLogPayload(records: LogRecord[], resourceAttributes: TelemetryAttributes, serviceName: string) {
  return {
    resourceLogs: [
      {
        resource: buildResource(resourceAttributes, serviceName),
        scopeLogs: [
          {
            scope: { name: SCOPE_NAME },
            logRecords: records.map((record) => ({
              timeUnixNano: record.timeUnixNano,
              severityText: record.severityText,
              body: { stringValue: record.body },
              attributes: toOtlpAttributes(record.attributes),
            })),
          },
        ],
      },
    ],
  };
}

function buildMetricPayload(records: MetricRecord[], resourceAttributes: TelemetryAttributes, serviceName: string) {
  return {
    resourceMetrics: [
      {
        resource: buildResource(resourceAttributes, serviceName),
        scopeMetrics: [
          {
            scope: { name: SCOPE_NAME },
            metrics: records.map((record) => ({
              name: record.name,
              unit: "1",
              gauge: {
                dataPoints: [
                  {
                    timeUnixNano: record.timeUnixNano,
                    asDouble: record.value,
                    attributes: toOtlpAttributes(record.attributes),
                  },
                ],
              },
            })),
          },
        ],
      },
    ],
  };
}

let activeTelemetry: TelemetryClient = new NoopTelemetry();

export function initTelemetry(): TelemetryClient {
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim() ?? "";
  const headers = process.env.OTEL_EXPORTER_OTLP_HEADERS?.trim() ?? "";
  const disabled = process.env.OTEL_SDK_DISABLED?.toLowerCase() === "true";
  const serviceName = process.env.OTEL_SERVICE_NAME || "proxx";
  const resourceAttributes = process.env.OTEL_RESOURCE_ATTRIBUTES || "";

  const hasEndpoint = Boolean(endpoint);
  const hasHeaders = Boolean(headers);
  const enabled = !disabled && hasEndpoint && hasHeaders;

  if (!enabled) {
    console.log("[telemetry] OTEL disabled (missing endpoint/headers or OTEL_SDK_DISABLED=true)");
    activeTelemetry = new NoopTelemetry();
    return activeTelemetry;
  }

  console.log(`[telemetry] OTEL enabled: service=${serviceName} endpoint=${endpoint}`);
  activeTelemetry = new OtlpHttpTelemetry({ endpoint, headers, serviceName, resourceAttributes });
  return activeTelemetry;
}

export function getTelemetry(): TelemetryClient {
  return activeTelemetry;
}

export async function shutdownTelemetry(): Promise<void> {
  await activeTelemetry.shutdown();
  activeTelemetry = new NoopTelemetry();
}
