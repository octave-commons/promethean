import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

function baseDir(): string {
  const envDir = process.env.AGENT_STATE_DIR;
  if (envDir && envDir.trim()) return envDir;
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.join(__dirname, "../logs/agents");
}

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

function agentDir(id: string): string {
  return path.join(baseDir(), id);
}

export async function initAgentMeta(meta: any) {
  const dir = agentDir(meta.id);
  await ensureDir(dir);
  await fs.writeFile(
    path.join(dir, "meta.json"),
    JSON.stringify(meta, null, 2),
    "utf8",
  );
}

export async function updateAgentMeta(id: string, patch: any) {
  const dir = agentDir(id);
  await ensureDir(dir);
  let cur = {};
  try {
    const raw = await fs.readFile(path.join(dir, "meta.json"), "utf8");
    cur = JSON.parse(raw);
  } catch {}
  // Keep the meta id consistent with the directory id
  const next = { ...cur, ...patch, id };
  await fs.writeFile(
    path.join(dir, "meta.json"),
    JSON.stringify(next, null, 2),
    "utf8",
  );
}

export async function appendAgentLog(id: string, chunk: any) {
  const dir = agentDir(id);
  await ensureDir(dir);
  const logPath = path.join(dir, "output.log");
  await fs.appendFile(logPath, Buffer.isBuffer(chunk) ? chunk : String(chunk));
}

export async function readAgentLogTail(
  id: string,
  bytes = 8192,
): Promise<string> {
  const dir = agentDir(id);
  const logPath = path.join(dir, "output.log");
  try {
    const fh = await fs.open(logPath, "r");
    try {
      const { size } = await fh.stat();
      const start = Math.max(0, size - bytes);
      const len = size - start;
      const buf = Buffer.alloc(len);
      await fh.read(buf, 0, len, start);
      return buf.toString("utf8");
    } finally {
      await fh.close();
    }
  } catch {
    return "";
  }
}

export async function listAgentMetas(): Promise<any[]> {
  const dir = baseDir();
  try {
    const names = await fs.readdir(dir, { withFileTypes: true });
    const out = [];
    for (const d of names) {
      if (!d.isDirectory()) continue;
      try {
        const raw = await fs.readFile(
          path.join(dir, d.name, "meta.json"),
          "utf8",
        );
        const meta = JSON.parse(raw);
        if (meta && meta.id) out.push(meta);
      } catch {}
    }
    return out;
  } catch {
    return [];
  }
}
