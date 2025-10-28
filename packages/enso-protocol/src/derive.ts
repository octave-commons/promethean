import { createHash } from "node:crypto";
import type { CID } from "./cache.js";

export interface DerivePlan {
  purpose: "text" | "image" | "thumbnail";
  via: string[];
  params?: Record<string, unknown>;
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, val]) => `${JSON.stringify(key)}:${canonicalJson(val)}`);
  return `{${entries.join(",")}}`;
}

function sha256Cid(payload: string): CID {
  const hash = createHash("sha256").update(payload).digest("hex");
  return `cid:sha256-${hash}` as CID;
}

export function derivedCid(
  from: CID,
  toolId: string,
  version: string,
  params: unknown,
): CID {
  const canonical = canonicalJson(params);
  return sha256Cid(
    ["enso-derive", from, toolId, version, canonical].join("\0"),
  );
}

export interface DeriveResult {
  cid: CID;
  uri: string;
  mime: string;
  meta: Record<string, unknown>;
}

export async function derive(
  plan: DerivePlan,
  fromCid: CID,
): Promise<DeriveResult> {
  const cid = derivedCid(
    fromCid,
    plan.via.join("->"),
    plan.purpose,
    plan.params ?? {},
  );
  const mime = plan.purpose === "image" ? "image/png" : "text/markdown";
  return {
    cid,
    uri: `enso://asset/${cid}`,
    mime,
    meta: {
      plan,
      from: fromCid,
      generatedAt: new Date().toISOString(),
    },
  };
}
