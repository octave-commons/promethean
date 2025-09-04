import type { StepResult } from "../types.js";

export type PiperEvent =
  | { type: 'start', stepId: string, at: string }
  | { type: 'skip', stepId: string, at: string, reason: string }
  | { type: 'end', stepId: string, at: string, result: StepResult };

export function emitEvent(ev: PiperEvent, json: boolean) {
  if (!json) return;
  process.stdout.write(JSON.stringify(ev) + "\n");
}
