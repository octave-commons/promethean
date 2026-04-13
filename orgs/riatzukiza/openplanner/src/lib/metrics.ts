/**
 * OpenPlanner Metrics Registry
 *
 * Exposes Prometheus-style metrics for monitoring:
 * - Event ingestion rates
 * - Storage backend stats
 * - TTL expiration counts
 * - Search query performance
 */

export interface MetricValue {
  name: string;
  help: string;
  type: "counter" | "gauge" | "histogram";
  labels: Record<string, string>;
  value: number;
}

// In-memory metrics storage
const counters: Map<string, number> = new Map();
const gauges: Map<string, number> = new Map();
const histograms: Map<string, number[]> = new Map();

// Counter increments
export function counterInc(name: string, labels: Record<string, string> = {}, delta = 1): void {
  const key = metricKey(name, labels);
  counters.set(key, (counters.get(key) ?? 0) + delta);
}

// Gauge set
export function gaugeSet(name: string, value: number, labels: Record<string, string> = {}): void {
  const key = metricKey(name, labels);
  gauges.set(key, value);
}

// Histogram observe
export function histogramObserve(name: string, value: number, labels: Record<string, string> = {}): void {
  const key = metricKey(name, labels);
  const values = histograms.get(key) ?? [];
  values.push(value);
  // Keep last 1000 values
  if (values.length > 1000) values.shift();
  histograms.set(key, values);
}

function metricKey(name: string, labels: Record<string, string>): string {
  const sortedLabels = Object.entries(labels).sort(([a], [b]) => a.localeCompare(b));
  const labelStr = sortedLabels.map(([k, v]) => `${k}="${v}"`).join(",");
  return sortedLabels.length > 0 ? `${name}{${labelStr}}` : name;
}

/**
 * Export all metrics in Prometheus text format.
 */
export function exportPrometheusMetrics(): string {
  const lines: string[] = [];
  const seenNames = new Set<string>();

  // Export counters
  for (const [key, value] of counters) {
    const { name, labels } = parseKey(key);
    if (!seenNames.has(name)) {
      lines.push(`# TYPE ${name} counter`);
      lines.push(`# HELP ${name} Total count of ${name}`);
      seenNames.add(name);
    }
    lines.push(formatMetric(name, value, labels));
  }

  // Export gauges
  for (const [key, value] of gauges) {
    const { name, labels } = parseKey(key);
    if (!seenNames.has(name)) {
      lines.push(`# TYPE ${name} gauge`);
      lines.push(`# HELP ${name} Current value of ${name}`);
      seenNames.add(name);
    }
    lines.push(formatMetric(name, value, labels));
  }

  // Export histogram summaries
  for (const [key, values] of histograms) {
    const { name, labels } = parseKey(key);
    if (values.length === 0) continue;

    const summary = histogramSummary(values);
    lines.push(`# TYPE ${name} histogram`);
    lines.push(`# HELP ${name} Distribution of ${name}`);
    
    for (const [bucket, count] of Object.entries(summary.buckets)) {
      lines.push(formatMetric(`${name}_bucket`, count, { ...labels, le: bucket }));
    }
    lines.push(formatMetric(`${name}_bucket`, summary.count, { ...labels, le: "+Inf" }));
    lines.push(formatMetric(`${name}_sum`, summary.sum, labels));
    lines.push(formatMetric(`${name}_count`, summary.count, labels));
  }

  return lines.join("\n") + "\n";
}

function parseKey(key: string): { name: string; labels: Record<string, string> } {
  const braceIdx = key.indexOf("{");
  if (braceIdx === -1) {
    return { name: key, labels: {} };
  }
  const name = key.slice(0, braceIdx);
  const labelsStr = key.slice(braceIdx + 1, -1);
  const labels: Record<string, string> = {};
  for (const pair of labelsStr.split(",")) {
    const [k, v] = pair.split("=");
    if (k && v) {
      labels[k] = v.slice(1, -1); // Remove quotes
    }
  }
  return { name, labels };
}

function formatMetric(name: string, value: number, labels: Record<string, string>): string {
  const sortedLabels = Object.entries(labels).sort(([a], [b]) => a.localeCompare(b));
  const labelStr = sortedLabels.map(([k, v]) => `${k}="${v}"`).join(",");
  return sortedLabels.length > 0 ? `${name}{${labelStr}} ${value}` : `${name} ${value}`;
}

function histogramSummary(values: number[]): { sum: number; count: number; buckets: Record<string, number> } {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const count = sorted.length;
  
  const buckets: Record<string, number> = {};
  const bucketBounds = [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30, 60];
  
  for (const bound of bucketBounds) {
    const count = sorted.filter(v => v <= bound).length;
    buckets[bound.toString()] = count;
  }
  
  return { sum, count, buckets };
}

// Reset metrics (for testing)
export function resetMetrics(): void {
  counters.clear();
  gauges.clear();
  histograms.clear();
}

// Get individual metric values
export function getCounter(name: string, labels: Record<string, string> = {}): number {
  return counters.get(metricKey(name, labels)) ?? 0;
}

export function getGauge(name: string, labels: Record<string, string> = {}): number {
  return gauges.get(metricKey(name, labels)) ?? 0;
}