import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import type { AgentMeta } from "./types/agents.js";

const META_FILE = "meta.json";

function baseDir(): string {
  const envDir = process.env.AGENT_STATE_DIR;
  if (envDir && envDir.trim()) return envDir;
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.join(__dirname, "../logs/agents");
}

async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

function agentDir(id: string): string {
  return path.join(baseDir(), id);
}

function isAgentMode(value: unknown): value is "agent" | "pty" {
  return value === "agent" || value === "pty";
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((entry) => String(entry)) : [];
}

function toOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function toNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function parseAgentMeta(value: unknown): AgentMeta | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  const id =
    typeof record.id === "string" && record.id.trim() ? record.id : null;
  if (!id) return null;
  const mode = isAgentMode(record.mode) ? record.mode : "agent";
  const cmd = typeof record.cmd === "string" ? record.cmd : "";
  const args = toStringArray(record.args);
  const cwd = typeof record.cwd === "string" ? record.cwd : "";
  const startedAt =
    typeof record.startedAt === "number" && Number.isFinite(record.startedAt)
      ? record.startedAt
      : Date.now();
  const prompt = typeof record.prompt === "string" ? record.prompt : "";
  const finishedAt = toOptionalNumber(record.finishedAt);
  const code = toNumberOrNull(record.code);
  const signal = toStringOrNull(record.signal);
  const cols = toOptionalNumber(record.cols);
  const rows = toOptionalNumber(record.rows);
  return {
    id,
    mode,
    cmd,
    args,
    cwd,
    startedAt,
    prompt,
    finishedAt,
    code,
    signal,
    cols,
    rows,
  };
}

async function readAgentMetaFile(dirPath: string): Promise<AgentMeta | null> {
  try {
    const raw = await fs.readFile(path.join(dirPath, META_FILE), "utf8");
    return parseAgentMeta(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeMetaFile(dirPath: string, meta: AgentMeta): Promise<void> {
  return fs.writeFile(
    path.join(dirPath, META_FILE),
    JSON.stringify(meta, null, 2),
    "utf8",
  );
}

function withMetaDefaults(
  meta: Partial<AgentMeta> & { id: string },
): AgentMeta {
  return {
    id: meta.id,
    mode: meta.mode ?? "agent",
    cmd: meta.cmd ?? "",
    args: meta.args ? Array.from(meta.args) : [],
    cwd: meta.cwd ?? "",
    startedAt: meta.startedAt ?? Date.now(),
    prompt: meta.prompt ?? "",
    finishedAt: meta.finishedAt,
    code: meta.code ?? null,
    signal: meta.signal ?? null,
    cols: meta.cols,
    rows: meta.rows,
  };
}

export async function initAgentMeta(meta: AgentMeta): Promise<void> {
  const dirPath = agentDir(meta.id);
  await ensureDir(dirPath);
  await writeMetaFile(dirPath, withMetaDefaults(meta));
}

export async function updateAgentMeta(
  id: string,
  patch: Partial<AgentMeta>,
): Promise<AgentMeta> {
  const dirPath = agentDir(id);
  await ensureDir(dirPath);
  const current =
    (await readAgentMetaFile(dirPath)) ?? withMetaDefaults({ id });
  const next: AgentMeta = {
    ...current,
    ...patch,
    id,
  };
  await writeMetaFile(dirPath, next);
  return next;
}

export async function appendAgentLog(
  id: string,
  chunk: Buffer | string,
): Promise<void> {
  const dirPath = agentDir(id);
  await ensureDir(dirPath);
  const logPath = path.join(dirPath, "output.log");
  const data = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
  await fs.appendFile(logPath, data);
}

export async function readAgentLogTail(
  id: string,
  bytes = 8192,
): Promise<string> {
  const dirPath = agentDir(id);
  const logPath = path.join(dirPath, "output.log");
  try {
    const fh = await fs.open(logPath, "r");
    try {
      const { size } = await fh.stat();
      const start = Math.max(0, size - bytes);
      const length = size - start;
      const buffer = Buffer.alloc(length);
      await fh.read(buffer, 0, length, start);
      return buffer.toString("utf8");
    } finally {
      await fh.close();
    }
  } catch {
    return "";
  }
}

export async function listAgentMetas(): Promise<AgentMeta[]> {
  const dirPath = baseDir();
  try {
    const names = await fs.readdir(dirPath, { withFileTypes: true });
    const metas = await Promise.all(
      names
        .filter((entry) => entry.isDirectory())
        .map((entry) => readAgentMetaFile(path.join(dirPath, entry.name))),
    );
    return metas.filter((meta): meta is AgentMeta => Boolean(meta?.id));
  } catch {
    return [];
  }
}
