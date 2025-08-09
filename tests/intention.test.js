import test from "ava";
import { RouterLLM } from "../shared/js/prom-lib/dist/intention/router.js";
import { extractCode } from "../shared/js/prom-lib/dist/intention/utils.js";

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

test("extractCode strips fences", (t) => {
  const s = "```js\nconsole.log(1);\n```";
  t.is(extractCode(s), "console.log(1);\n");
});
