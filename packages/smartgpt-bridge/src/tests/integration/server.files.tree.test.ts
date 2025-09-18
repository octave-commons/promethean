import path from "node:path";

import test from "ava";

import { withServer } from "../helpers/server.js";

const ROOT = path.join(process.cwd(), "tests", "fixtures");

test("GET /v0/files/tree returns nested directory tree", async (t) => {
  t.timeout(180000);
  await withServer(ROOT, async (req) => {
    const res = await req
      .get("/v0/files/tree")
      .query({ path: ".", depth: 2 })
      .expect(200);
    t.true(res.body.ok);
    t.is(res.body.base, ".");
    const tree: any = res.body.tree;
    const sub = tree.children.find((c: any) => c.name === "subdir");
    t.truthy(sub);
    t.truthy(sub.children.find((c: any) => c.name === "nested.md"));
  });
});
