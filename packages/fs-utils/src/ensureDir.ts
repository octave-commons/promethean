import { promises as fs } from 'fs';

export async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}
