/**
 * Entertainment Persona Growth Store
 *
 * Seed personas live in code (duck-persona.ts). This module stores *grown*
 * personas on disk so cephalons can continuously expand their persona pool
 * over time via the `self.growth` tool.
 */

import path from "node:path";
import { promises as fs } from "node:fs";

import { envInt } from "../config/env.js";
import { getStateDir, getSelfName } from "../peer/runtime.js";
import { DUCK_ENTERTAINMENT_PROMPTS, getPromptName } from "./duck-persona.js";

export type GrownEntertainmentPersona = {
  id: string;
  name: string;
  prompt: string;
  createdAt: string;
  createdBy: string;
};

type PersonaStoreFile = {
  schemaVersion: 1;
  updatedAt: string;
  personas: GrownEntertainmentPersona[];
};

export type EntertainmentPersonaSelection = {
  name: string;
  prompt: string;
  source: "seed" | "grown";
  index: number;
  seedCount: number;
  grownCount: number;
  totalCount: number;
};

const STORE_FILENAME = "entertainment-personas.json";

function storePath(): string {
  return path.join(getStateDir(), STORE_FILENAME);
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function writeJsonAtomic(filePath: string, value: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  const json = JSON.stringify(value, null, 2) + "\n";
  await fs.writeFile(tmpPath, json, "utf-8");
  await fs.rename(tmpPath, filePath);
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeName(name: string): string {
  return name.replace(/\s+/g, " ").trim();
}

function uniqueName(existing: readonly GrownEntertainmentPersona[], candidate: string): string {
  const base = normalizeName(candidate);
  const lower = base.toLowerCase();
  if (!existing.some((p) => p.name.trim().toLowerCase() === lower)) {
    return base;
  }

  let suffix = 2;
  while (suffix < 1000) {
    const next = `${base} v${suffix}`;
    const nextLower = next.toLowerCase();
    if (!existing.some((p) => p.name.trim().toLowerCase() === nextLower)) {
      return next;
    }
    suffix += 1;
  }

  return `${base} ${crypto.randomUUID().slice(0, 8)}`;
}

async function readStore(): Promise<PersonaStoreFile> {
  const filePath = storePath();
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<PersonaStoreFile>;
    if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.personas)) {
      return { schemaVersion: 1, updatedAt: new Date().toISOString(), personas: [] };
    }
    return {
      schemaVersion: 1,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
      personas: parsed.personas.filter((p): p is GrownEntertainmentPersona =>
        Boolean(p && typeof p === "object"
          && typeof (p as any).id === "string"
          && typeof (p as any).name === "string"
          && typeof (p as any).prompt === "string"
          && typeof (p as any).createdAt === "string"
          && typeof (p as any).createdBy === "string")),
    };
  } catch {
    return { schemaVersion: 1, updatedAt: new Date().toISOString(), personas: [] };
  }
}

export async function listGrownEntertainmentPersonas(): Promise<GrownEntertainmentPersona[]> {
  const store = await readStore();
  return store.personas;
}

export async function addGrownEntertainmentPersona(input: {
  name: string;
  prompt: string;
  createdBy?: string;
}): Promise<{ added: GrownEntertainmentPersona; total: number; grown: number }> {
  const name = normalizeName(input.name);
  const prompt = input.prompt.trim();

  if (!name) {
    throw new Error("Persona name is required");
  }
  if (name.length > 96) {
    throw new Error("Persona name too long (max 96 chars)");
  }
  if (prompt.length < 40) {
    throw new Error("Persona prompt too short (min 40 chars)");
  }

  const maxPromptChars = envInt("CEPHALON_GROWTH_MAX_PROMPT_CHARS", 7000, { min: 256, max: 100_000 });
  if (prompt.length > maxPromptChars) {
    throw new Error(`Persona prompt too long (max ${maxPromptChars} chars)`);
  }

  const store = await readStore();
  const now = Date.now();

  const normalizedPrompt = normalizeWhitespace(prompt);
  if (store.personas.some((p) => normalizeWhitespace(p.prompt) === normalizedPrompt)) {
    throw new Error("Duplicate persona prompt (already stored)");
  }

  const maxPerDay = envInt("CEPHALON_GROWTH_MAX_PERSONAS_PER_DAY", 6, { min: 0, max: 10_000 });
  if (maxPerDay > 0) {
    const cutoff = now - 24 * 60 * 60 * 1000;
    const recentAdds = store.personas.filter((p) => {
      const ts = Date.parse(p.createdAt);
      return Number.isFinite(ts) && ts >= cutoff;
    }).length;
    if (recentAdds >= maxPerDay) {
      throw new Error(`Growth budget exceeded (max ${maxPerDay} personas per 24h)`);
    }
  }

  const minIntervalMinutes = envInt("CEPHALON_GROWTH_MIN_INTERVAL_MINUTES", 20, { min: 0, max: 10_000 });
  if (minIntervalMinutes > 0 && store.personas.length > 0) {
    const last = store.personas
      .map((p) => Date.parse(p.createdAt))
      .filter((ts) => Number.isFinite(ts))
      .sort((a, b) => b - a)[0];
    if (typeof last === "number") {
      const deltaMs = now - last;
      if (deltaMs < minIntervalMinutes * 60 * 1000) {
        const remaining = Math.ceil((minIntervalMinutes * 60 * 1000 - deltaMs) / 60_000);
        throw new Error(`Growth cooldown active (try again in ~${remaining}m)`);
      }
    }
  }

  const createdBy = (input.createdBy || getSelfName() || "self.growth").trim();
  const record: GrownEntertainmentPersona = {
    id: crypto.randomUUID(),
    name: uniqueName(store.personas, name),
    prompt,
    createdAt: new Date().toISOString(),
    createdBy,
  };

  store.personas.push(record);

  const maxTotal = envInt("CEPHALON_GROWTH_MAX_PERSONAS_TOTAL", 512, { min: 0, max: 100_000 });
  if (maxTotal > 0 && store.personas.length > maxTotal) {
    store.personas = store.personas.slice(-maxTotal);
  }

  const file: PersonaStoreFile = {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    personas: store.personas,
  };

  await writeJsonAtomic(storePath(), file);

  const seedCount = DUCK_ENTERTAINMENT_PROMPTS.length;
  const grownCount = file.personas.length;
  return { added: record, total: seedCount + grownCount, grown: grownCount };
}

export async function selectEntertainmentPersona(
  tickNumber: number,
): Promise<EntertainmentPersonaSelection> {
  const seedCount = DUCK_ENTERTAINMENT_PROMPTS.length;
  const grown = await listGrownEntertainmentPersonas();
  const grownCount = grown.length;
  const totalCount = Math.max(1, seedCount + grownCount);

  const index = ((tickNumber % totalCount) + totalCount) % totalCount;

  if (index < seedCount) {
    return {
      name: getPromptName(index),
      prompt: DUCK_ENTERTAINMENT_PROMPTS[index],
      source: "seed",
      index,
      seedCount,
      grownCount,
      totalCount,
    };
  }

  const grownIndex = index - seedCount;
  const persona = grown[grownIndex];
  if (!persona) {
    // Should not happen, but fail closed to a seed persona.
    return {
      name: getPromptName(0),
      prompt: DUCK_ENTERTAINMENT_PROMPTS[0],
      source: "seed",
      index: 0,
      seedCount,
      grownCount,
      totalCount,
    };
  }

  return {
    name: persona.name,
    prompt: persona.prompt,
    source: "grown",
    index,
    seedCount,
    grownCount,
    totalCount,
  };
}
