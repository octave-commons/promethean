import { createHash } from "crypto";
import { promises as fs } from "fs";
import { join } from "path";

export class AssetStore {
  constructor(private baseDir: string) {}
  async putChunks(iter: AsyncIterable<Uint8Array>, declaredBytes?: number) {
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
    if (declaredBytes && declaredBytes !== bytes)
      throw new Error("byte mismatch");
    return { cid, uri: `enso://asset/${cid}`, bytes };
  }
  async read(cid: string, range?: { start: number; end?: number }) {
    /* fs read; range support */
  }
}
