import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import test from "ava";

import {
  parseMarkdownWorkflows,
  resolveWorkflowDefinitions,
  createAgentWorkflowGraph,
  type AgentWorkflowGraph,
} from "../index.js";

const MARKDOWN = `# Demo

\`\`\`mermaid workflow
flowchart TD
  main["{\"instructions\":\"Lead\",\"model\":{\"provider\":\"openai\",\"name\":\"gpt-4o-mini\"}}"]
  helper[file:./helper.json]
  reviewer
  main --> helper
  helper --> reviewer
\`\`\`

\`\`\`json agents
{
  "agents": {
    "reviewer": {
      "instructions": "Review draft",
      "model": { "provider": "ollama", "name": "llama3" }
    }
  }
}
\`\`\``;

// Test parsing only
test("parseMarkdownWorkflows returns workflows from markdown", (t) => {
  const document = parseMarkdownWorkflows(MARKDOWN, {});
  t.is(document.workflows.length, 1);
});

// Test resolution of external definitions
test("resolveWorkflowDefinitions loads external definitions correctly", async (t) => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "agents-workflow-"));
  const helperPath = path.join(tmpDir, "helper.json");
  await fs.writeFile(
    helperPath,
    JSON.stringify(
      { instructions: "Assist with tasks", model: { provider: "openai", name: "gpt-4o-mini" } },
      null,
      2
    ),
    "utf8"
  );
  const document = parseMarkdownWorkflows(MARKDOWN, {});
  const workflows = await resolveWorkflowDefinitions(document, { baseDir: tmpDir });
  t.true(workflows.length > 0);
  const workflow = workflows[0]!;
  t.like(
    workflow.nodes.find((n) => n.id === "helper")?.definition,
    { instructions: "Assist with tasks" }
  );
});

// Test creation of the workflow graph
test("createAgentWorkflowGraph produces correct graph config", async (t) => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "agents-workflow-"));
  const helperPath = path.join(tmpDir, "helper.json");
  await fs.writeFile(
    helperPath,
    JSON.stringify(
      { instructions: "Assist with tasks", model: { provider: "openai", name: "gpt-4o-mini" } },
      null,
      2
    ),
    "utf8"
  );
  const document = parseMarkdownWorkflows(MARKDOWN, {});
  const [workflow] = await resolveWorkflowDefinitions(document, { baseDir: tmpDir });
  const graph: AgentWorkflowGraph = await createAgentWorkflowGraph(workflow, {
    defaultModel: "gpt-4.1-mini",
    modelResolvers: { ollama: async (name) => `ollama://${name}` },
  });
  t.is(graph.nodes.get("main")?.config.model, "gpt-4o-mini");
  t.is(graph.nodes.get("reviewer")?.config.model, "ollama://llama3");
  t.is(graph.edges.length, 2);
});
