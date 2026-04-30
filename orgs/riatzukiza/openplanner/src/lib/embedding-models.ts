export type EmbeddingScope = Partial<{
  source: string;
  kind: string;
  project: string;
}>;

export type EmbeddingModelConfig = {
  defaultModel: string;
  bySource: Readonly<Record<string, string>>;
  byKind: Readonly<Record<string, string>>;
  byProject: Readonly<Record<string, string>>;
};

function normKey(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parsePairList(raw: string): Record<string, string> {
  const entries = raw
    .split(/[;,]/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);

  const out: Record<string, string> = {};
  for (const entry of entries) {
    const eq = entry.indexOf("=");
    if (eq <= 0) continue;
    const key = normKey(entry.slice(0, eq));
    const value = normKey(entry.slice(eq + 1));
    if (!key || !value) continue;
    out[key] = value;
  }
  return out;
}

function parseJsonObject(raw: string): Record<string, string> {
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};

  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (typeof v !== "string") continue;
    const key = normKey(k);
    const value = normKey(v);
    if (!key || !value) continue;
    out[key] = value;
  }
  return out;
}

export function parseModelMap(raw: string | undefined): Record<string, string> {
  if (!raw) return {};
  const input = raw.trim();
  if (input.length === 0) return {};

  if (input.startsWith("{")) {
    try {
      return parseJsonObject(input);
    } catch {
      return parsePairList(input);
    }
  }

  return parsePairList(input);
}

export function resolveEmbeddingModel(config: EmbeddingModelConfig, scope: EmbeddingScope): string {
  const project = normKey(scope.project);
  const source = normKey(scope.source);
  const kind = normKey(scope.kind);

  if (project) {
    const model = config.byProject[project];
    if (model) return model;
  }

  if (source) {
    const model = config.bySource[source];
    if (model) return model;
  }

  if (kind) {
    const model = config.byKind[kind];
    if (model) return model;
  }

  return config.defaultModel;
}
