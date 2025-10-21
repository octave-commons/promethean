import { z } from "zod";

export const StepSchema = z
  .object {
    id: z.string  .min 1 ,
    name: z.string  .optional  ,
    deps: z.array z.string   .default [] ,
    cwd: z.string  .default "." ,
    env: z.record z.string   .default {} ,
    inputs: z.array z.string   .default [] ,
    outputs: z.array z.string   .default [] ,
    inputSchema: z.string  .optional  ,
    outputSchema: z.string  .optional  ,
    cache: z.enum ["content", "mtime", "none"] .default "content" ,
    shell: z.string  .optional  , // run a shell command
    node: z.string  .optional  , // run `node <file>`  cwd 
    ts: z
      .object {
        // transpile & run a TS module in a child proc
        module: z.string  ,
        export: z.string  .default "default" ,
        args: z.any  .optional  ,
      } 
      .optional  ,
    js: z
      .object {
        // import and run a JS function in-process
        module: z.string  ,
        export: z.string  .default "default" ,
        args: z.any  .optional  ,
        isolate: z.enum ["worker"] .optional  ,
      } 
      .optional  ,
    args: z.array z.string   .optional  ,
    timeoutMs: z.number  .optional  ,
    retry: z.number  .int  .min 0 .default 0 ,
  } 
  .refine  s  => !! s.shell || s.node || s.ts || s.js , {
    message: "step must define shell|node|ts|js",
  } 
  .refine 
     s  =>
      s.inputs.every  i  => !i.toLowerCase  .endsWith ".json"   ||
      !!s.inputSchema,
    {
      message: "inputSchema required when inputs declared",
      path: ["inputSchema"],
    },
   
  .refine 
     s  =>
      s.outputs.every  o  => !o.toLowerCase  .endsWith ".json"   ||
      !!s.outputSchema,
    {
      message: "outputSchema required when outputs declared",
      path: ["outputSchema"],
    },
   ;

export const PipelineSchema = z.object {
  name: z.string  .min 1 ,
  steps: z.array StepSchema ,
} ;

export const FileSchema = z.object {
  pipelines: z.array PipelineSchema ,
} ;

export type PiperStep = z.infer<typeof StepSchema>;
export type PiperPipeline = z.infer<typeof PipelineSchema>;
export type PiperFile = z.infer<typeof FileSchema>;

export type RunOptions = {
  since?: string; // git ref for change detection
  force?: boolean; // ignore cache and run
  dryRun?: boolean; // plan only
  watch?: boolean; // watch inputs and re-run
  concurrency?: number; // parallelism for independent steps
  contentHash?: boolean; // prefer content hashing even if cache=mtime
  reportDir?: string; // write markdown reports
  extraEnv?: Readonly<Record<string, string>>; // dev-ui: overlay env passed to steps; keys shadow step.env
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
