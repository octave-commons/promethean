import { EventEmitter } from "node:events";

type Step = {
  type: "stdout" | "stderr" | "exit";
  data?: string;
  code?: number;
};

export function mockSpawnFactory(script: Step[] = []) {
  return function mockSpawn(_cmd: string, _args?: string[], _opts?: any) {
    const ee = new EventEmitter();
    const proc = {
      pid: 4242,
      stdout: new EventEmitter(),
      stderr: new EventEmitter(),
      stdin: { write: () => {} },
      on: (ev: string, cb: (...args: any[]) => void) => ee.on(ev, cb),
    };
    // Drive the script: [{ type:'stdout'|'stderr'|'exit', data:'...', code:0 }]
    setImmediate(() => {
      for (const step of script) {
        if (step.type === "stdout" && typeof step.data === "string")
          (proc.stdout as any).emit("data", Buffer.from(step.data));
        if (step.type === "stderr" && typeof step.data === "string")
          (proc.stderr as any).emit("data", Buffer.from(step.data));
        if (step.type === "exit") ee.emit("exit", step.code ?? 0, null);
      }
    });
    return proc;
  };
}
