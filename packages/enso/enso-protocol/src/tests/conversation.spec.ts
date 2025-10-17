import test from "ava";
import {
  parseConversationArgs,
  parseMcpServers,
  runTwoAgentConversation,
  type AgentMeta,
} from "../conversation.js";
import type { Interface } from "node:readline/promises";

test("parseMcpServers extracts commands and args", (t) => {
  const edn = `{:mcp-servers
  {:duckduckgo {:command "duck"}
   :github {:command "hub" :args ["--fast"]}}}`;
  const metas = parseMcpServers(edn);
  t.deepEqual(metas, [
    { name: "duckduckgo", command: "duck", args: [] },
    { name: "github", command: "hub", args: ["--fast"] },
  ]);
});

test("parseConversationArgs handles flags", (t) => {
  t.deepEqual(parseConversationArgs(["duck,github", "--ollama"]), {
    agentNames: ["duck", "github"],
    useOllama: true,
  });
  t.deepEqual(parseConversationArgs(["--ollama", "duck,github"]), {
    agentNames: ["duck", "github"],
    useOllama: true,
  });
  t.deepEqual(parseConversationArgs([]), { useOllama: false });
});

test("runTwoAgentConversation loops and exits", async (t) => {
  const logs: string[] = [];
  const metaOverride: AgentMeta[] = [
    { name: "duckduckgo", command: "duck", args: [] },
    { name: "github", command: "hub", args: [] },
  ];
  let call = 0;
  const stub: Interface = {
    async question() {
      call += 1;
      return call === 1 ? "hello" : "exit";
    },
    async close() {
      return;
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    [Symbol.asyncIterator]() {
      throw new Error("not supported");
    },
  } as unknown as Interface;

  await runTwoAgentConversation({
    metaOverride,
    readlineFactory: () => stub,
    log: (msg) => logs.push(msg),
  });

  t.true(logs.some((msg) => msg.includes("duckduckgo")));
  t.true(logs.some((msg) => msg.includes("Ending conversation")));
});
