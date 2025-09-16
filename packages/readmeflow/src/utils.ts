import { promises as fs } from "node:fs";
import * as path from "node:path";

import { slug } from "@promethean/utils";

export async function writeText(p: string, s: string): Promise<void> {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, s, "utf-8");
}

export { slug };
