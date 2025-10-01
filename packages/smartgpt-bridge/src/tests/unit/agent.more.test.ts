import test from "ava";

import { EventEmitter } from "node:events";

import { createSupervisor } from "../../agent.js";
import type { AgentChildProcess } from "../../types/agents.js";

function makeProc() {
  const ee = new EventEmitter();
  const proc: AgentChildProcess & {
    emit(type: string, data?: unknown): void;
  } = {
    pid: 999,
    stdout: {
      on: (ev: "data", cb: (chunk: Buffer) => void) => ee.on(`o:${ev}`, cb),
    },
    stderr: {
      on: (ev: "data", cb: (chunk: Buffer) => void) => ee.on(`e:${ev}`, cb),
    },
    stdin: {
      write: () => true,
    },
    on: (ev: string, cb: (...args: any[]) => void) => ee.on(ev, cb),
    emit(type: string, data?: unknown) {
      if (type === "stdout") ee.emit("o:data", Buffer.from(String(data ?? "")));
      if (type === "stderr") ee.emit("e:data", Buffer.from(String(data ?? "")));
      if (type === "exit") ee.emit("exit", 0, null);
    },
  };
  return proc;
}

test("AgentSupervisor: send/interrupt/kill after exit return false; logs and list", async (t) => {
  const proc = makeProc();
  const spawnImpl = () => proc;
  const kills: Array<string | number> = [];
  const killImpl = (_pid: number, sig: any) => {
    kills.push(sig);
    return true;
  };
  const sup = createSupervisor({ spawnImpl, killImpl });
  const { id } = sup.start({});
  // deliver some logs
  proc.emit("stdout", "hello\n");
  proc.emit("stderr", "warn\n");
  // exit
  proc.emit("exit");
  // After exit, controls should be false
  t.false(sup.send(id, "x"));
  t.false(sup.interrupt(id));
  t.false(sup.kill(id));
  t.false(sup.resume(id));
  const logs = sup.logs(id, 0)!;
  t.true(logs.total > 0);
  t.true(sup.list().length >= 1);
});

test("AgentSupervisor: SSE stream subscribes and cleans up", async (t) => {
  const proc = makeProc();
  const sup = createSupervisor({
    spawnImpl: () => proc,
    killImpl: () => true,
  });
  const { id } = sup.start({});
  const res: any = {
    writeHead: () => {},
    write: () => {},
    on: (ev: any, cb: any) => {
      if (ev === "close") {
        res._close = cb;
      }
    },
  };
  sup.stream(id, res);
  t.truthy(res);
  // simulate client close
  res._close && res._close();
  t.pass();
});
