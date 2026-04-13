import path from "node:path";

export function paths(dataDir: string) {
  const blobsDir = path.join(dataDir, "blobs", "sha256");
  const duckdbDir = path.join(dataDir, "duckdb");
  const dbPath = path.join(duckdbDir, "archive.duckdb");
  const jobsPath = path.join(dataDir, "jobs", "jobs.jsonl");
  return { blobsDir, duckdbDir, dbPath, jobsPath };
}

export function blobPath(blobsDir: string, sha256: string): string {
  const a = sha256.slice(0, 2);
  const b = sha256.slice(2, 4);
  return path.join(blobsDir, a, b, sha256);
}
