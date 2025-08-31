import test from "ava";
import request from "supertest";
import { createApp } from "../index.js";

test.skip("integration: logs tool_calls from real backend", async (t) => {
  const app = createApp();
  const tools = [
    {
      type: "function",
      function: { name: "foo", parameters: { type: "object", properties: {} } },
    },
  ];
  const res = await request(app)
    .post("/v1/chat/completions")
    .send({
      model: process.env.LLM_MODEL || "llama3.1",
      messages: [{ role: "user", content: "hi" }],
      tools,
    })
    .expect(200);
  t.log(res.body.choices?.[0]?.message?.tool_calls);
  t.pass();
});
