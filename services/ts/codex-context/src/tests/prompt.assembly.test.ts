import test from "ava";
import { buildAugmentedPrompt } from "../prompt.js";

test("buildAugmentedPrompt appends context with citations", (t) => {
  const messages = [
    { role: "user" as const, content: "How do services start?" },
  ];
  const retrieved = {
    search: [
      {
        path: "shared/js/serviceTemplate.js",
        snippet: "export async function startService(...)",
        startLine: 1,
        endLine: 10,
      },
      {
        path: "AGENTS.md",
        snippet: "Use service-specific setup targets",
        startLine: 100,
        endLine: 110,
      },
    ],
  } as any;
  const aug = buildAugmentedPrompt(messages, retrieved);
  t.true(aug.finalSystemPrompt.includes("Context:"));
  t.true(aug.finalSystemPrompt.includes("shared/js/serviceTemplate.js"));
  t.is(aug.finalMessages[0]!.role, "system");
});
