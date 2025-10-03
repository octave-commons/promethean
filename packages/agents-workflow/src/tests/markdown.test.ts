import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import test from "ava";

import {
  createAgentWorkflowGraph,
  parseMarkdownWorkflows,
  resolveWorkflowDefinitions,
  type AgentWorkflowGraph,
} from "../index.js";

const MARKDOWN = `# Demo

\`\`\`mermaid workflow
flowchart TD
  main["{\\"instructions\\":\\"Lead\\",\\"model\\":{\\"provider\\":\\"openai\\",\\"name\\":\\"gpt-4o-mini\\"}}"]
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
\`\`\`
`;

test("parses markdown workflows and resolves definitions", async (t) => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "agents-workflow-"));
  const helperPath = path.join(tmpDir, "helper.json");
  await fs.writeFile(
    helperPath,
    JSON.stringify(
      {
        instructions: "Assist with tasks",
        model: { provider: "openai", name: "gpt-4o-mini" },
      },
      null,
      2,
    ),
    "utf8",
  );

  const document = parseMarkdownWorkflows(MARKDOWN, {});
  t.is(document.workflows.length, 1);
  const workflows = await resolveWorkflowDefinitions(document, {
    baseDir: tmpDir,
  });
  t.true(workflows.length > 0);
  const workflow = workflows[0]!;
  t.like(workflow.nodes.find((node) => node.id === "main")?.definition, {
    instructions: "Lead",
    model: { provider: "openai", name: "gpt-4o-mini" },
  });
  t.like(workflow.nodes.find((node) => node.id === "helper")?.definition, {
    instructions: "Assist with tasks",
  });
  t.like(workflow.nodes.find((node) => node.id === "reviewer")?.definition, {
    instructions: "Review draft",
    model: { provider: "ollama", name: "llama3" },
  });

  const graph: AgentWorkflowGraph = await createAgentWorkflowGraph(workflow, {
    defaultModel: "gpt-4.1-mini",
    modelResolvers: {
      ollama: async (name) => `ollama://${name}`,
    },
  });

  const main = graph.nodes.get("main");
  t.truthy(main);
  t.is(main?.config.model, "gpt-4o-mini");

  const reviewer = graph.nodes.get("reviewer");
  t.truthy(reviewer);
  t.is(reviewer?.config.model, "ollama://llama3");
  t.is(graph.edges.length, 2);
});
