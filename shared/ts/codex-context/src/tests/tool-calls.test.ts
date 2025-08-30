import test from "ava";
import request from "supertest";
import { createApp } from "../index.js";

class FakeRetriever {
  async retrieve() {
    return { search: [] } as any;
  }
}

class CapturingBackend {
  lastOpts: any = null;
  async chat(_msgs: any[], _cfg: any, opts: any) {
    this.lastOpts = opts;
    return {
      text: "",
      raw: {
        message: {
          tool_calls: [
            {
              id: "1",
              type: "function",
              function: { name: "foo", arguments: "{}" },
            },
          ],
        },
      },
    };
  }
}

test("forwards tools and returns tool_calls", async (t) => {
  const backend = new CapturingBackend();
  const app = createApp({
    retriever: new FakeRetriever() as any,
    backend: backend as any,
    backendModel: "fake",
  });
  const tools = [
    {
      type: "function",
      function: { name: "foo", parameters: { type: "object", properties: {} } },
    },
  ];
  const res = await request(app)
    .post("/v1/chat/completions")
    .send({
      model: "fake",
      messages: [{ role: "user", content: "hi" }],
      tools,
      tool_choice: "auto",
    })
    .expect(200);
  t.deepEqual(backend.lastOpts, { tools, tool_choice: "auto" });
  t.deepEqual(res.body.choices[0].message.tool_calls, [
    { id: "1", type: "function", function: { name: "foo", arguments: "{}" } },
  ]);
});
