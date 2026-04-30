import { readFile } from "node:fs/promises";

interface ModelsEnvelope {
  readonly models?: readonly string[];
  readonly data?: ReadonlyArray<{ readonly id?: string }>;
  readonly preferred?: readonly string[];
  readonly disabled?: readonly string[];
  readonly aliases?: Readonly<Record<string, string>>;
}

export interface ModelPreferences {
  readonly preferred: readonly string[];
  readonly disabled: readonly string[];
  readonly aliases: Readonly<Record<string, string>>;
}

export interface OpenAiModelResponse {
  readonly id: string;
  readonly object: "model";
  readonly created: number;
  readonly owned_by: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeModelIds(raw: unknown): string[] {
  const idsFromArray = Array.isArray(raw)
    ? raw.filter((entry): entry is string => typeof entry === "string")
    : null;

  if (idsFromArray) {
    return [...new Set(idsFromArray.map((id) => id.trim()).filter(Boolean))];
  }

  if (!isRecord(raw)) {
    throw new Error("Invalid model JSON: expected an array or {\"models\": []}");
  }

  const envelope = raw as ModelsEnvelope;
  if (Array.isArray(envelope.models)) {
    return [...new Set(envelope.models.map((id) => id.trim()).filter(Boolean))];
  }

  if (Array.isArray(envelope.data)) {
    const ids = envelope.data
      .map((entry) => (isRecord(entry) && typeof entry.id === "string" ? entry.id.trim() : ""))
      .filter(Boolean);

    return [...new Set(ids)];
  }

  throw new Error("Invalid model JSON: expected an array, {\"models\": []}, or OpenAI-style {\"data\": []}");
}

function normalizeStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return [...new Set(
    raw
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
  )];
}

function normalizeAliases(raw: unknown): Record<string, string> {
  if (!isRecord(raw)) {
    return {};
  }

  const aliases: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value !== "string") {
      continue;
    }
    const alias = key.trim();
    const target = value.trim();
    if (alias.length === 0 || target.length === 0) {
      continue;
    }
    aliases[alias] = target;
  }

  return aliases;
}

function normalizeModelPreferences(raw: unknown, fallbackPreferred: readonly string[]): ModelPreferences {
  if (Array.isArray(raw)) {
    return {
      preferred: normalizeModelIds(raw),
      disabled: [],
      aliases: {}
    };
  }

  if (!isRecord(raw)) {
    return {
      preferred: [...fallbackPreferred],
      disabled: [],
      aliases: {}
    };
  }

  const envelope = raw as ModelsEnvelope;
  const hasPreferenceFields =
    envelope.preferred !== undefined || envelope.disabled !== undefined || envelope.aliases !== undefined;

  if (hasPreferenceFields) {
    return {
      preferred: normalizeStringArray(envelope.preferred ?? []),
      disabled: normalizeStringArray(envelope.disabled ?? []),
      aliases: normalizeAliases(envelope.aliases)
    };
  }

  return {
    preferred: normalizeModelIds(raw),
    disabled: [],
    aliases: {}
  };
}

export async function loadModels(modelsFilePath: string, fallback: readonly string[]): Promise<string[]> {
  try {
    const json = await readFile(modelsFilePath, "utf8");
    const parsed: unknown = JSON.parse(json);
    const models = normalizeModelIds(parsed);
    if (models.length > 0) {
      return models;
    }
    return [...fallback];
  } catch (error) {
    const maybeNodeError = error as NodeJS.ErrnoException;
    if (maybeNodeError?.code === "ENOENT") {
      return [...fallback];
    }

    throw error;
  }
}

export async function loadModelPreferences(modelsFilePath: string, fallbackPreferred: readonly string[]): Promise<ModelPreferences> {
  try {
    const json = await readFile(modelsFilePath, "utf8");
    const parsed: unknown = JSON.parse(json);
    return normalizeModelPreferences(parsed, fallbackPreferred);
  } catch (error) {
    const maybeNodeError = error as NodeJS.ErrnoException;
    if (maybeNodeError?.code === "ENOENT") {
      return {
        preferred: [...fallbackPreferred],
        disabled: [],
        aliases: {}
      };
    }

    throw error;
  }
}

export function toOpenAiModel(modelId: string): OpenAiModelResponse {
  return {
    id: modelId,
    object: "model",
    created: Math.floor(Date.now() / 1000),
    owned_by: "open-hax"
  };
}
