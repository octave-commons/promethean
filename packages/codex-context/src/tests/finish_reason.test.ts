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
    // Long enough to exceed 1 token under naive 4-chars-per-token estimate
    return "This is a somewhat longer reply to trigger length.";
  }
}

test("finish_reason=length when max_tokens is very small (chat)", async (t) => {
  const app = createApp({
    retriever: new FakeRetriever() as any,
    backend: new FakeBackend() as any,
    backendModel: "fake",
  });
  const res = await request(app)
    .post("/v1/chat/completions")
    .send({
      model: "fake",
      messages: [{ role: "user", content: "hi" }],
      max_tokens: 1,
    })
    .expect(200);
  t.is(res.body.choices?.[0]?.finish_reason, "length");
});

test("finish_reason=length in streaming final chunk (chat)", async (t) => {
  const app = createApp({
    retriever: new FakeRetriever() as any,
    backend: new FakeBackend() as any,
    backendModel: "fake",
  });
  const res = await request(app)
    .post("/v1/chat/completions")
    .send({
      model: "fake",
      messages: [{ role: "user", content: "hi" }],
      stream: true,
      max_tokens: 1,
    })
    .expect(200);
  t.true(res.text.includes('"finish_reason":"length"'));
});

test("finish_reason=length when max_tokens is very small (completions)", async (t) => {
  const app = createApp({
    retriever: new FakeRetriever() as any,
    backend: new FakeBackend() as any,
    backendModel: "fake",
  });
  const res = await request(app)
    .post("/v1/completions")
    .send({ model: "fake", prompt: "Say hi", max_tokens: 1 })
    .expect(200);
  t.is(res.body.choices?.[0]?.finish_reason, "length");
});

test("finish_reason=length in streaming final chunk (completions)", async (t) => {
  const app = createApp({
    retriever: new FakeRetriever() as any,
    backend: new FakeBackend() as any,
    backendModel: "fake",
  });
  const res = await request(app)
    .post("/v1/completions")
    .send({ model: "fake", prompt: "Say hi", stream: true, max_tokens: 1 })
    .expect(200);
  t.true(res.text.includes('"finish_reason":"length"'));
});
