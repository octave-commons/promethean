import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export type JobStatus = "queued" | "running" | "done" | "error" | "canceled";

export type Job = {
  id: string;
  ts: string;
  kind: string;
  status: JobStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
};

export class JobQueue {
  private jobs = new Map<string, Job>();
  private jobsPath: string;

  constructor(jobsPath: string) {
    this.jobsPath = jobsPath;
  }

  async init(): Promise<void> {
    await fs.mkdir(path.dirname(this.jobsPath), { recursive: true });
    try {
      const txt = await fs.readFile(this.jobsPath, "utf-8");
      for (const line of txt.split(/\r?\n/)) {
        if (!line.trim()) continue;
        const j = JSON.parse(line) as Job;
        this.jobs.set(j.id, j);
      }
    } catch {}
  }

  list(): Job[] {
    return Array.from(this.jobs.values()).sort((a, b) => a.ts.localeCompare(b.ts));
  }

  get(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  async create(kind: string, input: Record<string, unknown>): Promise<Job> {
    const id = crypto.randomUUID();
    const job: Job = { id, ts: new Date().toISOString(), kind, status: "queued", input };
    this.jobs.set(id, job);
    await this.append(job);
    return job;
  }

  async update(id: string, updates: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    const updated = { ...job, ...updates };
    this.jobs.set(id, updated);
    await this.append(updated);
    return updated;
  }

  private async append(job: Job): Promise<void> {
    await fs.appendFile(this.jobsPath, JSON.stringify(job) + "\n", "utf-8");
  }
}
