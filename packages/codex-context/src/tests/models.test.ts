import test from "ava";
import request from "supertest";
import { createApp } from "../index.js";

class FakeBackend {
  async listModels() {
    const now = Math.floor(Date.now() / 1000);
    return {
      object: "list",
      data: [{ id: "fake", object: "model", created: now, owned_by: "system" }],
    };
  }
  async getModel(id: string) {
    const now = Math.floor(Date.now() / 1000);
    if (id !== "fake") return null;
    return { id: "fake", object: "model", created: now, owned_by: "system" };
  }
}

test("GET /v1/models returns list object", async (t) => {
  const app = createApp({
    backendModel: "fake",
    backend: new FakeBackend() as any,
  });
  const res = await request(app).get("/v1/models").expect(200);
  t.is(res.body.object, "list");
  t.true(Array.isArray(res.body.data));
  t.truthy(res.body.data[0].id);
  t.is(res.body.data[0].object, "model");
});

test("GET /v1/models/:id returns model object", async (t) => {
  const app = createApp({
    backendModel: "fake",
    backend: new FakeBackend() as any,
  });
  const res = await request(app).get("/v1/models/fake").expect(200);
  t.is(res.body.object, "model");
  t.is(res.body.id, "fake");
});
