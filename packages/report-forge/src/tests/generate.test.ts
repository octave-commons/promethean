import test from "ava";
import { generateReport } from "../src/lib/generateReport.js";
import type { ReportInput, ReportOptions } from "../src/lib/types.js";

const fakeLlm = {
  async complete({ prompt }: { prompt: string }) {
    return `OK\n${prompt.split(" ")[0]}`;
  },
};

const mkInput = (): ReportInput => ({
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
  ],
});

const mkOpts = (): ReportOptions => ({ llm: fakeLlm as any });

test("generateReport returns markdown", async (t) => {
  const out = await generateReport(mkInput(), mkOpts());
  t.true(out.toLowerCase().includes("repo: x/y"));
});
