import { createHash } from "node:crypto";
import { tokenize, simhash64, hamming64 } from "../normalization/discord-message.js";

export type OutputDedupePolicy = {
  exactTtlSeconds: number;
  nearWindowSeconds: number;
  simhashHammingThreshold: number;
};

type OutputRecord = {
  ts: number;
  exactHash: string;
  simhash: bigint;
};

function normalizeForDedupe(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

export class OutputDedupe {
  private records: OutputRecord[] = [];

  constructor(private policy: OutputDedupePolicy, private maxRecords = 96) {}

  check(text: string, now = Date.now()): { suppress: boolean; reason?: string } {
    const normalized = normalizeForDedupe(text);
    if (!normalized) return { suppress: true, reason: "empty" };

    const exactHash = createHash("sha256").update(normalized).digest("hex");
    const tokens = tokenize(normalized);
    const simhash = simhash64(tokens);

    const exactWindowMs = Math.max(1, this.policy.exactTtlSeconds) * 1000;
    const nearWindowMs = Math.max(1, this.policy.nearWindowSeconds) * 1000;

    // Prune old records
    const cutoff = now - Math.max(exactWindowMs, nearWindowMs);
    this.records = this.records.filter((r) => r.ts >= cutoff);

    // Exact duplicate
    const exactHit = this.records.find((r) => r.exactHash === exactHash && now - r.ts <= exactWindowMs);
    if (exactHit) return { suppress: true, reason: "exact-duplicate" };

    // Near duplicate (SimHash)
    const threshold = Math.max(0, this.policy.simhashHammingThreshold);
    for (const record of this.records) {
      if (now - record.ts > nearWindowMs) continue;
      const distance = hamming64(record.simhash, simhash);
      if (distance <= threshold) {
        return { suppress: true, reason: `near-duplicate(hamming<=${threshold})` };
      }
    }

    return { suppress: false };
  }

  remember(text: string, now = Date.now()): void {
    const normalized = normalizeForDedupe(text);
    if (!normalized) return;

    const exactHash = createHash("sha256").update(normalized).digest("hex");
    const tokens = tokenize(normalized);
    const simhash = simhash64(tokens);

    this.records.unshift({ ts: now, exactHash, simhash });
    if (this.records.length > this.maxRecords) {
      this.records.length = this.maxRecords;
    }
  }
}
