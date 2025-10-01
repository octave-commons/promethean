import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import { join } from "node:path";

export interface AssetReadResult {
  cid: string;
  mime: string;
  bytes: number;
  data: Uint8Array;
}

export class AssetStore {
  constructor(private readonly baseDir: string) {}

  async putChunks(
    iter: AsyncIterable<Uint8Array>,
    declaredBytes?: number,
  ): Promise<{ cid: string; uri: string; bytes: number }> {
    const tmp = join(this.baseDir, `tmp-${Date.now()}-${Math.random()}`);
    const fh = await fs.open(tmp, "w");
    const hash = createHash("sha256");
    let bytes = 0;
    for await (const chunk of iter) {
      bytes += chunk.length;
      hash.update(chunk);
      await fh.write(chunk);
    }
    await fh.close();
    const cid = `cid:sha256-${hash.digest("hex")}`;
    const dst = join(this.baseDir, cid);
    await fs.rename(tmp, dst);
    if (declaredBytes !== undefined && declaredBytes !== bytes) {
      throw new Error("byte mismatch");
    }
    return { cid, uri: `enso://asset/${cid}`, bytes };
  }

  async read(
    cid: string,
    range?: { start: number; end?: number },
  ): Promise<AssetReadResult> {
    const filePath = join(this.baseDir, cid);
    const file = await fs.open(filePath, "r");
    try {
      const stats = await file.stat();
      const start = range?.start ?? 0;
      const end = range?.end ?? stats.size;
      const length = Math.max(0, Math.min(end, stats.size) - start);
      const buffer = new Uint8Array(length);
      await file.read(buffer, 0, length, start);
      return {
        cid,
        mime: "application/octet-stream",
        bytes: length,
        data: buffer,
      };
    } finally {
      await file.close();
    }
  }
}
