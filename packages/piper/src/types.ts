// SPDX-License-Identifier: GPL-3.0-only
import { z } from "zod";

export const StepSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  deps: z.array(z.string()).default([]),
  cwd: z.string().default("."),
  env: z.record(z.string()).default({}),
  inputs: z.array(z.string()).default([]),
  outputs: z.array(z.string()).default([]),
  cache: z.enum(["content", "mtime", "none"]).default("content"),
  shell: z.string().optional(),     // run a shell command
  node: z.string().optional(),      // run `node <file>` (cwd)
  ts: z.object({                    // import and run a TS/JS function
    module: z.string(),
    export: z.string().default("default"),
    args: z.any().optional()
  }).optional(),
  args: z.array(z.string()).optional(),
  timeoutMs: z.number().optional()
}).refine(s => !!(s.shell || s.node || s.ts), { message: "step must define shell|node|ts" });

export const PipelineSchema = z.object({
  name: z.string().min(1),
  steps: z.array(StepSchema)
});

export const FileSchema = z.object({
  pipelines: z.array(PipelineSchema)
});

export type PiperStep = z.infer<typeof StepSchema>;
export type PiperPipeline = z.infer<typeof PipelineSchema>;
export type PiperFile = z.infer<typeof FileSchema>;

export type RunOptions = {
  since?: string;          // git ref for change detection
  force?: boolean;         // ignore cache and run
  dryRun?: boolean;        // plan only
  watch?: boolean;         // watch inputs and re-run
  concurrency?: number;    // parallelism for independent steps
  contentHash?: boolean;   // prefer content hashing even if cache=mtime
  reportDir?: string;      // write markdown reports
};

export type StepResult = {
  id: string;
  skipped: boolean;
  reason?: string;
  startedAt?: string;
  endedAt?: string;
  exitCode?: number | null;
  durationMs?: number;
  stdout?: string;
  stderr?: string;
  fingerprint?: string;
};
