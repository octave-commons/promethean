import crypto from "node:crypto";
import type { Duck } from "./duckdb.js";
import { all, run } from "./duckdb.js";
import type { Chroma } from "./chroma.js";
import type { OpenPlannerConfig } from "./config.js";
import { extractTieredVectorHits } from "./vector-search.js";

export type CompactableEvent = {
  id: string;
  ts: string;
  source: string;
  kind: string;
  project?: string | null;
  session?: string | null;
  message?: string | null;
  role?: string | null;
  author?: string | null;
  model?: string | null;
  text: string;
};

export type SemanticPack = {
  id: string;
  ts: string;
  source: string;
  kind: string;
  project?: string | null;
  session?: string | null;
  seedId: string;
  memberIds: string[];
  memberCount: number;
  charCount: number;
  embeddingModel: string;
  text: string;
  extra: Record<string, unknown>;
};

export type SemanticCompactionOptions = {
  maxNeighbors: number;
  maxChars: number;
  distanceThreshold: number;
  minClusterSize: number;
  maxPacksPerRun: number;
  minEventCount: number;
};

export type SemanticCompactionSummary = {
  ok: true;
  scannedEvents: number;
  skippedEvents: number;
  existingCompactedMembers: number;
  packsCreated: number;
  compactedMembers: number;
  hotCollection: string;
  compactCollection: string;
  compactEmbedModel: string;
  packIds: string[];
};

function toIso(value: unknown): string {
  if (typeof value === "string" && value.trim().length > 0) return value;
  return new Date().toISOString();
}

function line(value: string | null | undefined): string {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed.length > 0 ? trimmed : "-";
}

export function normalizeSemanticText(text: string): string {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function renderPackMember(member: CompactableEvent, index: number): string {
  return [
    `## Message ${index + 1}`,
    `id: ${member.id}`,
    `ts: ${toIso(member.ts)}`,
    `source: ${line(member.source)}`,
    `kind: ${line(member.kind)}`,
    `project: ${line(member.project)}`,
    `session: ${line(member.session)}`,
    `role: ${line(member.role)}`,
    "",
    member.text.trim(),
    "",
  ].join("\n");
}

function buildPackId(memberIds: readonly string[]): string {
  const hash = crypto.createHash("sha256");
  hash.update(memberIds.join("\n"));
  return `pack-${hash.digest("hex").slice(0, 24)}`;
}

export function buildSemanticPack(
  seed: CompactableEvent,
  neighbors: ReadonlyArray<CompactableEvent>,
  opts: Pick<SemanticCompactionOptions, "maxChars" | "minClusterSize">,
  compactEmbedModel: string,
): SemanticPack | null {
  const selected: CompactableEvent[] = [];
  const seenNormalized = new Set<string>();

  const allCandidates = [seed, ...neighbors];
  let charCount = 0;

  for (const candidate of allCandidates) {
    const normalized = normalizeSemanticText(candidate.text);
    if (normalized.length === 0) continue;
    if (seenNormalized.has(normalized)) continue;

    const rendered = renderPackMember(candidate, selected.length);
    if (selected.length > 0 && charCount + rendered.length > opts.maxChars) break;

    selected.push(candidate);
    seenNormalized.add(normalized);
    charCount += rendered.length;
  }

  if (selected.length < opts.minClusterSize) return null;

  const packText = [
    "# Semantic memory pack",
    `seed_id: ${seed.id}`,
    `member_count: ${selected.length}`,
    `project: ${line(seed.project)}`,
    `session: ${line(seed.session)}`,
    `embedding_model: ${compactEmbedModel}`,
    "",
    ...selected.map((member, index) => renderPackMember(member, index)),
  ].join("\n");

  const memberIds = selected.map((member) => member.id);
  const packId = buildPackId(memberIds);
  const ts = selected[0]?.ts ?? seed.ts;

  return {
    id: packId,
    ts: toIso(ts),
    source: "openplanner.compaction",
    kind: "memory.compacted.semantic",
    project: seed.project,
    session: seed.session,
    seedId: seed.id,
    memberIds,
    memberCount: memberIds.length,
    charCount: packText.length,
    embeddingModel: compactEmbedModel,
    text: packText,
    extra: {
      seed_id: seed.id,
      project: seed.project,
      session: seed.session,
      member_ids: memberIds,
      member_count: memberIds.length,
      char_count: packText.length,
      strategy: "semantic-neighbor-pack-v1",
    },
  };
}

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function parsePositiveNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveCompactionOptions(cfg: OpenPlannerConfig, input: Record<string, unknown>): SemanticCompactionOptions {
  return {
    maxNeighbors: parsePositiveInt(input.maxNeighbors, cfg.semanticCompaction.maxNeighbors),
    maxChars: parsePositiveInt(input.maxChars, cfg.semanticCompaction.maxChars),
    distanceThreshold: parsePositiveNumber(input.distanceThreshold, cfg.semanticCompaction.distanceThreshold),
    minClusterSize: parsePositiveInt(input.minClusterSize, cfg.semanticCompaction.minClusterSize),
    maxPacksPerRun: parsePositiveInt(input.maxPacksPerRun, cfg.semanticCompaction.maxPacksPerRun),
    minEventCount: parsePositiveInt(input.minEventCount, cfg.semanticCompaction.minEventCount),
  };
}

async function loadCompactableEvents(duck: Duck): Promise<CompactableEvent[]> {
  return all<CompactableEvent>(duck.conn, `
    SELECT id, CAST(ts AS VARCHAR) AS ts, source, kind, project, session, message, role, author, model, text
    FROM events
    WHERE coalesce(text, '') <> ''
    ORDER BY ts ASC
  `);
}

async function loadExistingCompactedMemberIds(duck: Duck): Promise<Set<string>> {
  const rows = await all<{ members: string | null }>(duck.conn, `
    SELECT CAST(members AS VARCHAR) AS members
    FROM compacted_memories
  `);

  const ids = new Set<string>();
  for (const row of rows) {
    if (!row.members) continue;
    try {
      const parsed = JSON.parse(row.members) as unknown;
      if (!Array.isArray(parsed)) continue;
      for (const value of parsed) {
        if (typeof value === "string" && value.length > 0) ids.add(value);
      }
    } catch {
      // ignore malformed historical rows
    }
  }
  return ids;
}

async function upsertSemanticPack(duck: Duck, chroma: Chroma, pack: SemanticPack): Promise<void> {
  const compactCollection = await chroma.client.getCollection({
    name: chroma.compactCollectionName,
    embeddingFunction: chroma.compactEmbeddingFunction as never,
  });

  await compactCollection.upsert({
    ids: [pack.id],
    documents: [pack.text],
    metadatas: [{
      ts: pack.ts,
      source: pack.source,
      kind: pack.kind,
      project: pack.project ?? "",
      session: pack.session ?? "",
      seed_id: pack.seedId,
      member_count: pack.memberCount,
      char_count: pack.charCount,
      embedding_model: pack.embeddingModel,
      search_tier: "compact",
    }] as never,
  });

  await run(duck.conn, `
    INSERT INTO compacted_memories (
      id, ts, source, kind, project, session, seed_id, member_count, char_count, embedding_model, text, members, extra
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      ts=excluded.ts,
      source=excluded.source,
      kind=excluded.kind,
      project=excluded.project,
      session=excluded.session,
      seed_id=excluded.seed_id,
      member_count=excluded.member_count,
      char_count=excluded.char_count,
      embedding_model=excluded.embedding_model,
      text=excluded.text,
      members=excluded.members,
      extra=excluded.extra
  `, [
    pack.id,
    pack.ts,
    pack.source,
    pack.kind,
    pack.project ?? null,
    pack.session ?? null,
    pack.seedId,
    pack.memberCount,
    pack.charCount,
    pack.embeddingModel,
    pack.text,
    JSON.stringify(pack.memberIds),
    JSON.stringify(pack.extra),
  ]);
}

export async function runSemanticCompaction(
  duck: Duck,
  chroma: Chroma,
  cfg: OpenPlannerConfig,
  input: Record<string, unknown> = {},
): Promise<SemanticCompactionSummary> {
  if (!cfg.semanticCompaction.enabled) {
    throw new Error("semantic compaction disabled by config");
  }

  const options = resolveCompactionOptions(cfg, input);
  const events = await loadCompactableEvents(duck);
  const byId = new Map(events.map((event) => [event.id, event]));
  const usedIds = await loadExistingCompactedMemberIds(duck);

  if (events.length < options.minEventCount && input.force !== true) {
    return {
      ok: true,
      scannedEvents: events.length,
      skippedEvents: events.length,
      existingCompactedMembers: usedIds.size,
      packsCreated: 0,
      compactedMembers: 0,
      hotCollection: chroma.collectionName,
      compactCollection: chroma.compactCollectionName,
      compactEmbedModel: cfg.compactEmbedModel,
      packIds: [],
    };
  }

  const hotCollection = await chroma.client.getCollection({
    name: chroma.collectionName,
    embeddingFunction: chroma.embeddingFunction as never,
  });

  const packIds: string[] = [];
  let packsCreated = 0;
  let compactedMembers = 0;
  let skippedEvents = 0;

  for (const seed of events) {
    if (packsCreated >= options.maxPacksPerRun) break;
    if (usedIds.has(seed.id)) {
      skippedEvents += 1;
      continue;
    }

    const where = typeof seed.project === "string" && seed.project.length > 0
      ? { project: seed.project }
      : undefined;

    const query = await hotCollection.query({
      queryTexts: [seed.text],
      nResults: Math.max(options.maxNeighbors, options.minClusterSize),
      ...(where ? { where } : {}),
    });

    const neighbors = extractTieredVectorHits(query, "hot")
      .filter((hit) => hit.id !== seed.id)
      .filter((hit) => !usedIds.has(hit.id))
      .filter((hit) => typeof hit.distance === "number" && (hit.distance as number) <= options.distanceThreshold)
      .map((hit) => byId.get(hit.id))
      .filter((event): event is CompactableEvent => Boolean(event));

    const pack = buildSemanticPack(seed, neighbors, options, cfg.compactEmbedModel);
    if (!pack) {
      skippedEvents += 1;
      continue;
    }

    await upsertSemanticPack(duck, chroma, pack);

    for (const memberId of pack.memberIds) usedIds.add(memberId);
    packsCreated += 1;
    compactedMembers += pack.memberIds.length;
    packIds.push(pack.id);
  }

  return {
    ok: true,
    scannedEvents: events.length,
    skippedEvents,
    existingCompactedMembers: usedIds.size - compactedMembers,
    packsCreated,
    compactedMembers,
    hotCollection: chroma.collectionName,
    compactCollection: chroma.compactCollectionName,
    compactEmbedModel: cfg.compactEmbedModel,
    packIds,
  };
}
