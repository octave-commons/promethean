import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

import type { LLM } from './llm.js';

export class FileCacheLLM implements LLM {
    constructor(
        private inner: LLM,
        private dir = '.promirror/cache',
    ) {}

    private key(s: string) {
        return createHash('sha256').update(s).digest('hex');
    }

    async generate({ system, prompt }: { system: string; prompt: string }) {
        await fs.mkdir(this.dir, { recursive: true });
        const k = this.key(system + '\n---\n' + prompt);
        const p = path.join(this.dir, k + '.txt');
        try {
            return await fs.readFile(p, 'utf8');
        } catch {}
        const out = await this.inner.generate({ system, prompt });
        await fs.writeFile(p, out, 'utf8');
        return out;
    }
}
