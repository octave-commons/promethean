import { EventEmitter } from "node:events";

import type { AgentChildProcess } from "../../types/agents.js";

type Step = {
  type: "stdout" | "stderr" | "exit";
  data?: string;
  code?: number;
};

export type MockStep = Step;

export function mockSpawnFactory(script: Step[] = []) {
  return function mockSpawn(
    _cmd: string,
    _args: readonly string[] = [],
    _opts?: any,
  ): AgentChildProcess {
    const ee = new EventEmitter();
    const proc: AgentChildProcess = {
      pid: 4242,
      stdout: {
        on: (ev: "data", cb: (chunk: Buffer) => void) => {
          return ee.on(`stdout:${ev}`, cb);
        },
      },
      stderr: {
        on: (ev: "data", cb: (chunk: Buffer) => void) => {
          return ee.on(`stderr:${ev}`, cb);
        },
      },
      stdin: {
        write: () => true,
      },
      on: (ev: string, cb: (...args: any[]) => void) => ee.on(ev, cb),
    };
    // Drive the script: [{ type:'stdout'|'stderr'|'exit', data:'...', code:0 }]
    setImmediate(() => {
      for (const step of script) {
        if (step.type === "stdout" && typeof step.data === "string")
          ee.emit("stdout:data", Buffer.from(step.data));
        if (step.type === "stderr" && typeof step.data === "string")
          ee.emit("stderr:data", Buffer.from(step.data));
        if (step.type === "exit") ee.emit("exit", step.code ?? 0, null);
      }
    });
    return proc;
  };
}
