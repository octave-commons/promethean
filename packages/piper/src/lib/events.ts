import type { StepResult } from "../types.js";

export type PiperEvent =
  | { type: "start"; stepId: string; at: string }
  | { type: "skip"; stepId: string; at: string; reason: string }
  | {
      type: "retry";
      stepId: string;
      at: string;
      attempt: number;
      exitCode: number | null;
    }
  | { type: "end"; stepId: string; at: string; result: StepResult };

export function emitEvent(ev: PiperEvent, json: boolean) {
  if (!json) return;
  process.stdout.write(JSON.stringify(ev) + "\n");
}
