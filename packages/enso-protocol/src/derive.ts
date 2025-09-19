import type { CID } from "@promethean/enso-cache/cache.js";
import { canonicalJson, sha256Cid } from "./hash.js";

export interface DerivePlan {
  purpose: "text" | "image" | "thumbnail";
  via: string[];
  params?: Record<string, unknown>;
}
export function derivedCid(
  from: CID,
  toolId: string,
  version: string,
  params: unknown,
): CID {
  return sha256Cid(
    ["enso-derive", from, toolId, version, canonicalJson(params)].join("\0"),
  );
}
export async function derive(
  plan: DerivePlan,
  fromCid: CID,
): Promise<{ cid: CID; uri: string; mime: string; meta: any }> {
  // dispatch to workers by 'via' chain; write to AssetStore; return CID + meta
  // keep pure: from + plan → deterministic CID; write provenance
  return {
    cid: "cid:sha256-…",
    uri: "enso://asset/…",
    mime: "text/markdown",
    meta: {
      tool: "pdf.extract_text",
      version: "1.3.2",
      params: plan.params,
      from: fromCid,
    },
  };
}
