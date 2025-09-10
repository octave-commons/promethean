import * as path from "node:path";
import { promises as fs } from "node:fs";

import YAML from "yaml";

import type { Chunk } from "../types.js";
import type { DBs } from "../db.js";

export type DocMeta = { uuid: string; path: string; title: string };

export async function computeDocStatus(db: DBs, d: DocMeta) {
  const abs = path.resolve(d.path);
  let frontmatterDone = false;
  let relationsPresent = false;
  let relationsRelated = 0;
  let relationsRefs = 0;
  let footersPresent = false;

  const HEAD_LIMIT = 256 * 1024; // 256 KB
  const TAIL_LIMIT = 128 * 1024; // 128 KB
  try {
    const fd = await fs.open(abs, "r");
    try {
      const st = await fd.stat();
      const headLen = Math.min(HEAD_LIMIT, st.size);
      const headBuf = Buffer.allocUnsafe(headLen);
      await fd.read(headBuf, 0, headLen, 0);
      const head = headBuf.toString("utf8");

      // Frontmatter (--- ... ---) quick parse
      let fmObj: any = undefined;
      const fmStart = head.startsWith("---") ? 0 : head.indexOf("\n---");
      if (fmStart === 0) {
        const endIdx = head.indexOf("\n---", 3);
        if (endIdx > 0) {
          let yamlText = head.slice(3, endIdx);
          yamlText = yamlText.replace(/^\n+/, "").replace(/\n+$/, "");
          try {
            fmObj = YAML.parse(yamlText) || {};
          } catch {}
        }
      }
      if (fmObj && typeof fmObj === "object") {
        frontmatterDone = !!fmObj.uuid;
        const hasRelU = Array.isArray(fmObj.related_to_uuid);
        const hasRefs = Array.isArray(fmObj.references);
        const hasRelT = Array.isArray(fmObj.related_to_title);
        relationsPresent = !!(hasRelU || hasRefs || hasRelT);
        relationsRelated = hasRelU ? fmObj.related_to_uuid.length : 0;
        relationsRefs = hasRefs ? fmObj.references.length : 0;
      } else {
        frontmatterDone = /\buuid\s*:\s*\S/.test(head);
        relationsPresent = /(related_to_uuid|references|related_to_title)/.test(
          head,
        );
      }

      // Tail marker for footers
      const tailLen = Math.min(TAIL_LIMIT, Math.max(0, st.size - 0));
      if (tailLen > 0) {
        const readFrom = Math.max(0, st.size - tailLen);
        const tailBuf = Buffer.allocUnsafe(Math.min(TAIL_LIMIT, st.size));
        await fd.read(tailBuf, 0, Math.min(TAIL_LIMIT, st.size), readFrom);
        const tail = tailBuf.toString("utf8");
        footersPresent =
          /<!--\s*GENERATED-SECTIONS:DO-NOT-EDIT-BELOW\s*-->/.test(tail);
      }
    } finally {
      await fd.close();
    }
  } catch {}

  const chunkArr = (await db.chunks
    .get(d.uuid)
    .catch(() => [] as readonly Chunk[])) as readonly Chunk[];
  let fpCount = 0,
    qCount = 0;
  for (const c of chunkArr) {
    try {
      await db.fp.get(c.id);
      fpCount++;
    } catch {}
    try {
      const hs = await db.q.get(c.id);
      if (Array.isArray(hs)) qCount++;
    } catch {}
  }

  return {
    uuid: d.uuid,
    path: d.path,
    title: d.title,
    frontmatter: { done: frontmatterDone },
    embed: { chunks: chunkArr.length, fingerprints: fpCount },
    query: { withHits: qCount, of: chunkArr.length },
    relations: {
      present: relationsPresent,
      related: relationsRelated,
      refs: relationsRefs,
    },
    footers: { present: footersPresent },
  } as const;
}
