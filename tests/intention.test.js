import test from "ava";
import { RouterLLM } from "../packages/intention/dist/router.js";
import { extractCode } from "../packages/intention/dist/utils.js";

test("RouterLLM falls back to next provider on failure", async (t) => {
  class BadLLM {
    async generate() {
      throw new Error("fail");
    }
  }
  class GoodLLM {
    async generate({ prompt }) {
      return `ok:${prompt}`;
    }
  }
  const router = new RouterLLM([new BadLLM(), new GoodLLM()]);
  const out = await router.generate({ system: "", prompt: "hi" });
  t.is(out, "ok:hi");
});

test("RouterLLM throws when all providers fail", async (t) => {
  class BadLLM {
    async generate() {
      throw new Error("fail");
    }
  }
  const router = new RouterLLM([new BadLLM()]);
  await t.throwsAsync(() => router.generate({ system: "", prompt: "hi" }), {
    message: "fail",
  });
});

test("extractCode strips fences", (t) => {
  const s = "```js\nconsole.log(1);\n```";
  t.is(extractCode(s), "console.log(1);\n");
});

test("extractCode splits on triple-dash", (t) => {
  const s = "console.log(1);\n---\nmore";
  t.is(extractCode(s), "console.log(1);");
});

test("RouterLLM throws when no providers", async (t) => {
  const router = new RouterLLM([]);
  await t.throwsAsync(() => router.generate({ system: "", prompt: "hi" }), {
    message: "No providers responded",
  });
});
