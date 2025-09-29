import avaTest, { type TestFn } from "ava";
import type { ReadonlyDeep } from "type-fest";

import { generateReport } from "../lib/generateReport.js";
import type { ReportInput, ReportOptions } from "../lib/types.js";

const test = avaTest as unknown as TestFn<unknown>;

const fakeLlm: ReportOptions["llm"] = {
  async complete({ prompt }: Readonly<{ prompt: string }>) {
    return `OK\n${prompt.split(" ")[0]}`;
  },
};

const mkInput = (): ReadonlyDeep<ReportInput> => ({
  repo: "x/y",
  issues: [
    {
      id: 1,
      number: 1,
      title: "A",
      state: "open",
      labels: [],
      url: "",
      createdAt: "2024-01-01",
    },
  ] as const,
});

const mkOpts = (): ReadonlyDeep<ReportOptions> => ({ llm: fakeLlm });

test("generateReport returns markdown", async (t) => {
  const out = await generateReport(mkInput(), mkOpts());
  t.true(out.toLowerCase().includes("repo: x/y"));
});
