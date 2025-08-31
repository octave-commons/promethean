// @ts-nocheck
import test from "ava";
import path from "node:path";
import { withServer } from "../helpers/server.js";
import sinon from "sinon";
import { supervisor as defaultSupervisor } from "../../agent.js";

const ROOT = path.join(process.cwd(), "src", "tests", "fixtures");

test("agent endpoints success paths via stubbed supervisor", async (t) => {
  const s = sinon.createSandbox();
  s.stub(defaultSupervisor, "start").returns("S1");
  s.stub(defaultSupervisor, "status").returns({
    id: "S1",
    exited: false,
    paused_by_guard: false,
    bytes: 0,
  });
  s.stub(defaultSupervisor, "send").returns(true);
  s.stub(defaultSupervisor, "kill").returns(true);
  s.stub(defaultSupervisor, "logs").returns({ total: 0, chunk: "" });
  s.stub(defaultSupervisor, "resume").returns(false);
  try {
    await withServer(ROOT, async (req) => {
      const st = await req
        .post("/v0/agent/start")
        .send({ prompt: "hello" })
        .expect(200);
      t.true(st.body.ok);
      const send = await req
        .post("/v0/agent/send")
        .send({ id: "S1", input: "ping" })
        .expect(200);
      t.true(send.body.ok);
      const intr = await req
        .post("/v0/agent/interrupt")
        .send({ id: "S1" })
        .expect(200);
      t.true(intr.body.ok);
      const kill = await req
        .post("/v0/agent/kill")
        .send({ id: "S1", force: true })
        .expect(200);
      t.true(kill.body.ok);
      const resm = await req
        .post("/v0/agent/resume")
        .send({ id: "S1" })
        .expect(200);
      t.false(resm.body.ok);
      const logs = await req
        .get("/v0/agent/logs")
        .query({ id: "S1", since: 0 })
        .expect(200);
      t.true(logs.body.ok);
      const status = await req
        .get("/v0/agent/status")
        .query({ id: "S1" })
        .expect(200);
      t.true(status.body.ok);
      const list = await req.get("/v0/agent/list").expect(200);
      t.true(list.body.ok);
    });
  } finally {
    s.restore();
  }
});
