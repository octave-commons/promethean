#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { github } from "../dist/lib/github.js";
import { ollamaClient } from "../dist/lib/ollama.js";
import { generateReport } from "../dist/lib/generateReport.js";

const repo = process.argv[2];
const out =
  process.argv[3] ?? `./docs/reports/${repo?.replace("/", "_")}_report.md`;
if (!repo) {
  console.error("usage: report-forge <owner/repo> [out.md]");
  process.exit(1);
}
const gh = github();
const issues = await gh.listIssues(repo, { state: "all" });
const text = await generateReport({ repo, issues }, { llm: ollamaClient() });
await writeFile(out, text, "utf8");
console.log("wrote", out);
