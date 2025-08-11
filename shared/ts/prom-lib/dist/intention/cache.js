import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import * as path from "node:path";
export class FileCacheLLM {
    inner;
    dir;
    constructor(inner, dir = ".promirror/cache") {
        this.inner = inner;
        this.dir = dir;
    }
    key(s) {
        return createHash("sha256").update(s).digest("hex");
    }
    async generate({ system, prompt }) {
        await fs.mkdir(this.dir, { recursive: true });
        const k = this.key(system + "\n---\n" + prompt);
        const p = path.join(this.dir, k + ".txt");
        try {
            return await fs.readFile(p, "utf8");
        }
        catch { }
        const out = await this.inner.generate({ system, prompt });
        await fs.writeFile(p, out, "utf8");
        return out;
    }
}
