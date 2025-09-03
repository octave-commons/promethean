// SPDX-License-Identifier: GPL-3.0-only
import test from "ava";
import request from "supertest";
import { createApp } from "../index.js";

class FakeRetriever {
  async retrieve() {
    return { search: [] } as any;
  }
}

class FakeBackend {
  async chat() {
    return "streamed text";
  }
}

test("SSE: POST /v1/chat/completions with stream=true", async (t) => {
  const app = createApp({
    retriever: new FakeRetriever() as any,
    backend: new FakeBackend() as any,
    backendModel: "fake",
  });
  const res = await request(app)
    .post("/v1/chat/completions")
    .send({
      model: "fake",
      stream: true,
      messages: [{ role: "user", content: "hello" }],
    })
    .expect(200);
  t.regex(String(res.headers["content-type"]), /text\/event-stream/);
  t.true(res.text.includes("data:"));
  t.true(res.text.includes("[DONE]"));
});

test("SSE: POST /v1/completions with stream=true", async (t) => {
  const app = createApp({
    retriever: new FakeRetriever() as any,
    backend: new FakeBackend() as any,
    backendModel: "fake",
  });
  const res = await request(app)
    .post("/v1/completions")
    .send({ model: "fake", stream: true, prompt: "hello" })
    .expect(200);
  t.regex(String(res.headers["content-type"]), /text\/event-stream/);
  t.true(res.text.includes("data:"));
  t.true(res.text.includes("[DONE]"));
});

test("Validate roles: invalid role returns OpenAI error", async (t) => {
  const app = createApp({
    retriever: new FakeRetriever() as any,
    backend: new FakeBackend() as any,
    backendModel: "fake",
  });
  const res = await request(app)
    .post("/v1/chat/completions")
    .send({ model: "fake", messages: [{ role: "bad", content: "x" }] })
    .expect(400);
  t.truthy(res.body.error);
  t.is(res.body.error.type, "invalid_request_error");
});
