import { promises as fs } from 'fs';

export async function ensureDir(p: string): Promise<void> {
    await fs.mkdir(p, { recursive: true });
}
