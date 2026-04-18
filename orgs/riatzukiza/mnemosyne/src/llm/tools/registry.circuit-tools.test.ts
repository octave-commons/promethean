import test from "ava";

import { InMemoryMemoryStore } from "../../core/memory-store.js";
import { MemoryFactory } from "../../core/memory-factory.js";
import { TOOL_REGISTRY } from "./registry.js";

test("heuretic.trace_review extracts recent trace signals and attractors", async (t) => {
  const store = new InMemoryMemoryStore();
  const factory = new MemoryFactory({
    cephalonId: "duck",
    sessionId: "c5-neurosomatic",
    schemaVersion: 1,
  });

  await store.insert(
    factory.createUserMessageMemory("can you fix drift drift?", {
      type: "discord",
      channelId: "chan-1",
      guildId: "guild-1",
      authorId: "user-1",
    }),
  );
  await store.insert(factory.createAssistantMemory("I can inspect the drift pattern."));
  await store.insert(
    factory.createToolResultMemory(
      "peer.logs",
      undefined,
      "drift regression detected",
      "call-1",
    ),
  );
  await store.insert(
    factory.createImageMemory(
      "drift.png",
      "https://example.com/drift.png",
      2048,
      {
        type: "discord",
        channelId: "chan-1",
        guildId: "guild-1",
        authorId: "user-1",
      },
    ),
  );

  const result = await TOOL_REGISTRY["heuretic.trace_review"].handler(
    { limit: 10 },
    {
      memoryStore: store,
      discordApiClient: {} as never,
      sessionId: "c5-neurosomatic",
    },
  );

  t.true(result.success);
  const payload = result.result as {
    sampleSize: number;
    signals: Record<string, number>;
    candidateAttractors: string[];
    topTokens: Array<{ token: string; count: number }>;
  };

  t.is(payload.sampleSize, 4);
  t.is(payload.signals.questionPressure, 1);
  t.is(payload.signals.repairPressure, 1);
  t.is(payload.signals.toolFailurePressure, 1);
  t.is(payload.signals.imagePressure, 1);
  t.true(payload.candidateAttractors.includes("drift"));
  t.true(payload.topTokens.some((entry) => entry.token === "drift"));
});

test("metisean.session_audit reports structural session state", async (t) => {
  const store = new InMemoryMemoryStore();
  const factory = new MemoryFactory({
    cephalonId: "duck",
    sessionId: "c7-neurogenetic",
    schemaVersion: 1,
  });

  await store.insert(
    factory.createUserMessageMemory("design a better workflow protocol", {
      type: "discord",
      channelId: "chan-2",
      guildId: "guild-1",
      authorId: "user-2",
    }),
  );

  const result = await TOOL_REGISTRY["metisean.session_audit"].handler(
    { limit: 10 },
    {
      memoryStore: store,
      discordApiClient: {} as never,
      sessionId: "c7-neurogenetic",
      session: {
        id: "c7-neurogenetic",
        cephalonId: "Duck",
        priorityClass: "operational",
        credits: 10,
        recentBuffer: [],
        toolPermissions: new Set(["metisean.session_audit", "peer.read_file"]),
        systemPrompt: "system",
        developerPrompt: "developer",
        persona: "architect",
        attentionFocus: "architecture and protocols",
        circuitIndex: 7,
        modelName: "auto:cheapest",
        reasoningEffort: "high",
        defaultChannelHints: ["systems"],
      },
      outputChannel: {
        channelId: "chan-2",
        channelName: "systems",
        setAt: 1,
      },
    },
  );

  t.true(result.success);
  const payload = result.result as {
    promptLayers: Record<string, boolean>;
    allowedTools: string[];
    attentionFocus?: string;
    sampleSize: number;
    observations: string[];
  };

  t.true(payload.promptLayers.hasSystemPrompt);
  t.true(payload.promptLayers.hasDeveloperPrompt);
  t.true(payload.promptLayers.hasPersona);
  t.deepEqual(payload.allowedTools, ["metisean.session_audit", "peer.read_file"]);
  t.is(payload.attentionFocus, "architecture and protocols");
  t.is(payload.sampleSize, 1);
  t.true(payload.observations.some((entry) => /Restricted tool surface/.test(entry)));
  t.false(payload.observations.some((entry) => /No output channel/.test(entry)));
});

test("field.observe returns runtime weather plus current session surface", async (t) => {
  const result = await TOOL_REGISTRY["field.observe"].handler(
    {},
    {
      discordApiClient: {} as never,
      sessionId: "c3-symbolic",
      session: {
        id: "c3-symbolic",
        cephalonId: "Duck",
        priorityClass: "interactive",
        credits: 10,
        recentBuffer: [],
        toolPermissions: new Set(["field.observe", "memory.lookup"]),
        attentionFocus: "symbolic structure",
        circuitIndex: 3,
        modelName: "auto:cheapest",
        reasoningEffort: "medium",
        defaultChannelHints: ["bots"],
      },
      outputChannel: {
        channelId: "chan-3",
        channelName: "bots",
        setAt: 1,
      },
      runtimeInspector: () => ({
        graphSummary: "graph summary",
        eidolonSummary: "aionian:1.00 | gnostic:2.00",
        promptFieldSummary: "prompt-field tick=7",
      }),
    },
  );

  t.true(result.success);
  const payload = result.result as {
    sessionId: string;
    currentSession: { toolPermissions: string[]; outputChannel?: { channelId: string | null } };
    runtimeState: { graphSummary: string; eidolonSummary: string; promptFieldSummary: string };
  };

  t.is(payload.sessionId, "c3-symbolic");
  t.deepEqual(payload.currentSession.toolPermissions, ["field.observe", "memory.lookup"]);
  t.is(payload.currentSession.outputChannel?.channelId, "chan-3");
  t.is(payload.runtimeState.graphSummary, "graph summary");
});

test("discord.list.servers can surface IRC workspaces when filtered", async (t) => {
  const result = await TOOL_REGISTRY["discord.list.servers"].handler(
    { platform: "irc" },
    {
      discordApiClient: {
        listServers: async () => { throw new Error("discord unavailable"); },
      } as never,
      ircApiClient: {
        listServers: async () => ({
          servers: [{ id: "irc:ussyco", name: "ussyco", memberCount: 4 }],
          count: 1,
        }),
      } as never,
    },
  );

  t.true(result.success);
  t.deepEqual(result.result, {
    servers: [{ id: "irc:ussyco", name: "ussyco", memberCount: 4 }],
    count: 1,
  });
});

test("discord.send routes IRC-prefixed channels through the IRC client", async (t) => {
  let observedChannelId = "";

  const result = await TOOL_REGISTRY["discord.send"].handler(
    { channel_id: "irc:ussyco:%23ussycode", text: "hello irc" },
    {
      discordApiClient: {} as never,
      ircApiClient: {
        sendMessage: async (channelId: string, text: string) => {
          observedChannelId = channelId;
          return {
            messageId: "irc-msg-1",
            channelId,
            sent: true,
            timestamp: "2026-03-27T00:00:00.000Z",
          };
        },
      } as never,
    },
  );

  t.true(result.success);
  t.is(observedChannelId, "irc:ussyco:%23ussycode");
});
