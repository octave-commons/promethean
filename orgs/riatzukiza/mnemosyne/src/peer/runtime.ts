import path from "node:path";
import { promises as fs } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getBotConfig, getBotIdFromEnv } from "../config/bots.js";

const execFileAsync = promisify(execFile);

export interface RestartRequestRecord {
  id: string;
  requester: string;
  target: string;
  reason: string;
  approvals: string[];
  createdAt: string;
  updatedAt: string;
  status: "pending" | "approved";
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export const PEER_PORTS: Record<string, number> = {
  duck: 3001,
  openhax: 3002,
  openskull: 3003,
  error: 3004,
};

export function getSelfName(): string {
  return getBotConfig(getBotIdFromEnv()).id;
}

export function getCephalonRepoName(name = getSelfName()): string {
  return `${name.toLowerCase()}-cephalon`;
}

export function getMonorepoRoot(): string {
  return process.env.CEPHALON_MONOREPO_ROOT || `/cephalon/orgs/octave-commons/${getCephalonRepoName()}`;
}

export function getRuntimeSourceRoot(): string {
  return process.env.CEPHALON_SOURCE_ROOT || path.join(getMonorepoRoot(), "packages", "cephalon-ts");
}

export function getStateDir(): string {
  return process.env.CEPHALON_STATE_DIR || "/cephalon/state";
}

export function getLogFilePath(): string {
  return process.env.CEPHALON_LOG_FILE || `/cephalon/logs/${getSelfName()}.log`;
}

export function getPeerApiBaseUrl(peer: string): string {
  const normalized = peer.toLowerCase();
  const port = PEER_PORTS[normalized];
  if (!port) {
    throw new Error(`Unknown peer: ${peer}`);
  }
  return `http://${normalized}:${port}`;
}

export function safeResolveWithinRoot(root: string, relativePath: string): string {
  const resolvedRoot = path.resolve(root);
  const resolvedPath = path.resolve(resolvedRoot, relativePath);
  if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`Path escapes repo root: ${relativePath}`);
  }
  return resolvedPath;
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

function getRestartStateFile(): string {
  return path.join(getStateDir(), "restart-requests.json");
}

export async function loadRestartRequests(): Promise<Record<string, RestartRequestRecord>> {
  try {
    const raw = await fs.readFile(getRestartStateFile(), "utf-8");
    return JSON.parse(raw) as Record<string, RestartRequestRecord>;
  } catch (error) {
    return {};
  }
}

export async function saveRestartRequests(records: Record<string, RestartRequestRecord>): Promise<void> {
  await ensureDir(getStateDir());
  await fs.writeFile(getRestartStateFile(), JSON.stringify(records, null, 2), "utf-8");
}

export async function createRestartRequest(requester: string, target: string, reason: string): Promise<RestartRequestRecord> {
  const records = await loadRestartRequests();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const record: RestartRequestRecord = {
    id,
    requester: requester.toLowerCase(),
    target: target.toLowerCase(),
    reason,
    approvals: [],
    createdAt: now,
    updatedAt: now,
    status: "pending",
  };
  records[id] = record;
  await saveRestartRequests(records);
  return record;
}

export async function approveRestartRequest(id: string, approver: string): Promise<RestartRequestRecord | null> {
  const records = await loadRestartRequests();
  const record = records[id];
  if (!record) {
    return null;
  }

  const normalizedApprover = approver.toLowerCase();
  if (!record.approvals.includes(normalizedApprover)) {
    record.approvals.push(normalizedApprover);
  }
  record.updatedAt = new Date().toISOString();

  if (record.approvals.includes(record.requester) && record.approvals.includes(record.target)) {
    record.status = "approved";
  }

  records[id] = record;
  await saveRestartRequests(records);
  return record;
}

export async function getRestartRequest(id: string): Promise<RestartRequestRecord | null> {
  const records = await loadRestartRequests();
  return records[id] ?? null;
}

export async function listRestartRequestsForTarget(target: string): Promise<RestartRequestRecord[]> {
  const records = await loadRestartRequests();
  return Object.values(records)
    .filter((record) => record.target === target.toLowerCase())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function readLogTail(lines: number): Promise<string[]> {
  try {
    const raw = await fs.readFile(getLogFilePath(), "utf-8");
    const allLines = raw.split(/\r?\n/).filter(Boolean);
    return allLines.slice(-lines);
  } catch (error) {
    return [];
  }
}

export async function runRepoCommand(command: string, timeoutMs = 30_000): Promise<CommandResult> {
  try {
    const { stdout, stderr } = await execFileAsync("bash", ["-lc", command], {
      cwd: getRuntimeSourceRoot(),
      env: process.env,
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024 * 10,
    });
    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0,
    };
  } catch (error) {
    const details = error as {
      stdout?: string;
      stderr?: string;
      code?: number;
      message?: string;
    };
    return {
      stdout: details.stdout?.trim() ?? "",
      stderr: details.stderr?.trim() ?? details.message ?? "",
      exitCode: typeof details.code === "number" ? details.code : 1,
    };
  }
}

export async function getGitStatus(): Promise<string[]> {
  const result = await runRepoCommand("git status --short", 15_000);
  if (!result.stdout) {
    return [];
  }
  return result.stdout.split(/\r?\n/).filter(Boolean);
}

export async function ensureRepoPath(relativePath: string): Promise<string> {
  const fullPath = safeResolveWithinRoot(getRuntimeSourceRoot(), relativePath);
  await ensureDir(path.dirname(fullPath));
  return fullPath;
}
