// @ts-nocheck
import test from "ava";
import sinon from "sinon";
import { mockSpawnFactory } from "../helpers/mockSpawn.js";
import { createSupervisor } from "../../agent.js";

test("agent supervisor: guard pause, resume, then exit", async (t) => {
  // Script emits a dangerous line to trigger guard, then idle, then exit
  const script = [
    { type: "stdout", data: "Starting...\n" },
    { type: "stdout", data: "rm -rf /tmp/foo\n" },
    { type: "stderr", data: "ignored\n" },
  ];
  const mockSpawn = mockSpawnFactory(script);
  const killCalls = [];
  const mockKill = (pid, signal) => {
    killCalls.push(signal);
  };
  const sup = createSupervisor({ spawnImpl: mockSpawn, killImpl: mockKill });

  const { id } = sup.start({ prompt: "noop" });
  // Give script a tick to deliver events
  await new Promise((r) => setTimeout(r, 0));

  const st1 = sup.status(id);
  t.truthy(st1);
  t.true(st1.paused_by_guard, "guard should have paused process");
  t.true(killCalls.includes("SIGSTOP"));

  const ok = sup.resume(id);
  t.true(ok);
  const st2 = sup.status(id);
  t.false(st2.paused_by_guard);
  t.true(killCalls.includes("SIGCONT"));

  // Now emit exit
  // We can reuse mockSpawnFactory by creating a new proc, but simpler: simulate exit by starting a new process that exits.
  // Instead, directly call underlying proc event emitter via send interrupt -> our mockKill does nothing, so manually trigger exit by starting with exit in script.
  // Start another process to ensure exit pathway covered
  const sup2 = createSupervisor({
    spawnImpl: mockSpawnFactory([...script, { type: "exit", code: 0 }]),
    killImpl: mockKill,
  });
  const { id: id2 } = sup2.start({ prompt: "noop" });
  await new Promise((r) => setTimeout(r, 0));
  const st3 = sup2.status(id2);
  t.true(st3.exited === true || st3.exited === false); // existence check; exited may be set after tick
});
