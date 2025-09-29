import test from "ava";
import { githubRequestTool } from "../src/tools/github/request.js";

const ctx: any = {
  env: {},
  fetch: async (_url: any, _init?: any) =>
    new Response(JSON.stringify([{ ok: true }]), { status: 200 }),
  now: () => new Date(),
};

test("github_request basic paginate=false", async (t) => {
  const tool = githubRequestTool(ctx);
  const res: any = await tool.invoke({
    method: "GET",
    path: "/does-not-matter",
  });
  t.is(res.status, 200);
});
