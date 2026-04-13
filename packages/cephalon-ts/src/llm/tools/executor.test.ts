import anyTest, { type TestFn } from "ava";
import { InMemoryEventBus } from "@promethean-os/event";
type ExecutorModule = typeof import("./executor.js");
type DiscordModule = typeof import("../../discord/api-client.js");
import type { ToolResult } from "../../types/index.js";

const test = anyTest as TestFn;

const loadExecutorModule = async (): Promise<ExecutorModule> => {
  const mod = await import(new URL("./executor.js", import.meta.url).toString());
  return mod as ExecutorModule;
};

const loadDiscordModule = async (): Promise<DiscordModule> => {
  const mod = await import(
    new URL("../../discord/api-client.js", import.meta.url).toString(),
  );
  return mod as DiscordModule;
};

const createExecutor = async () => {
  const { ToolExecutor } = await loadExecutorModule();
  const { DiscordApiClient } = await loadDiscordModule();
  const eventBus = new InMemoryEventBus();
  const discordApiClient = new DiscordApiClient({ token: "test-token" });
  return new ToolExecutor(eventBus, { discordApiClient });
};

test("executes discord tools without channel cache", async (t) => {
  const executor = await createExecutor();
  let called = false;

  executor.registerTool("discord.search", async (): Promise<ToolResult> => {
    called = true;
    return { toolName: "discord.search", success: true, result: { ok: true } };
  });

  const result = await executor.execute(
    {
      type: "tool_call",
      name: "discord.search",
      args: { scope: "channel", channel_id: "123" },
      callId: "call-1",
    },
    "session-a",
  );

  t.true(result.success);
  t.true(called, "handler should execute when registered");
});

test("allows discord tools after list.channels caches ids", async (t) => {
  const executor = await createExecutor();
  let searchCalled = false;

  executor.registerTool("discord.list.channels", async (): Promise<ToolResult> => {
    return {
      toolName: "discord.list.channels",
      success: true,
      result: {
        channels: [{ id: "chan-1", name: "general", guildId: "guild-1" }],
        count: 1,
      },
    };
  });

  executor.registerTool("discord.search", async (): Promise<ToolResult> => {
    searchCalled = true;
    return { toolName: "discord.search", success: true, result: { ok: true } };
  });

  await executor.execute(
    {
      type: "tool_call",
      name: "discord.list.channels",
      args: {},
      callId: "call-2",
    },
    "session-a",
  );

  const result = await executor.execute(
    {
      type: "tool_call",
      name: "discord.search",
      args: { scope: "channel", channel_id: "chan-1", query: "duck" },
      callId: "call-3",
    },
    "session-a",
  );

  t.true(result.success);
  t.true(searchCalled, "handler should execute once channel id is cached");
});

test("executes discord.send when handler registered", async (t) => {
  const executor = await createExecutor();
  let sendCalled = false;

  executor.registerTool("discord.send", async (): Promise<ToolResult> => {
    sendCalled = true;
    return { toolName: "discord.send", success: true, result: { ok: true } };
  });

  const result = await executor.execute(
    {
      type: "tool_call",
      name: "discord.send",
      args: { channel_id: "seed-1", content: "hi" },
      callId: "call-4",
    },
    "session-b",
  );

  t.true(result.success);
  t.true(sendCalled, "handler should run for registered tools");
});

test("filters tool definitions by session permissions", async (t) => {
  const executor = await createExecutor();

  executor.setSessionResolver((sessionId) => {
    if (sessionId !== "session-filtered") {
      return undefined;
    }

    return {
      id: sessionId,
      cephalonId: "Duck",
      priorityClass: "interactive",
      credits: 1,
      recentBuffer: [],
      toolPermissions: new Set(["memory.lookup", "discord.search"]),
    };
  });

  const tools = executor.getToolDefinitions("session-filtered");
  const toolNames = tools.map((tool) => tool.name);

  t.true(toolNames.includes("memory.lookup"));
  t.true(toolNames.includes("discord.search"));
  t.false(toolNames.includes("peer.write_file"));
  t.false(toolNames.includes("browser.navigate"));
});

test("blocks execution of disallowed tools for a session", async (t) => {
  const executor = await createExecutor();
  let called = false;

  executor.setSessionResolver((sessionId) => {
    if (sessionId !== "session-guarded") {
      return undefined;
    }

    return {
      id: sessionId,
      cephalonId: "Duck",
      priorityClass: "interactive",
      credits: 1,
      recentBuffer: [],
      toolPermissions: new Set(["memory.lookup"]),
    };
  });

  executor.registerTool("peer.write_file", async (): Promise<ToolResult> => {
    called = true;
    return { toolName: "peer.write_file", success: true, result: { ok: true } };
  });

  const result = await executor.execute(
    {
      type: "tool_call",
      name: "peer.write_file",
      args: { peer: "openhax", path: "README.md", content: "hi" },
      callId: "call-5",
    },
    "session-guarded",
  );

  t.false(result.success);
  t.false(called, "handler should not run when tool is disallowed");
  t.regex(result.error || "", /not allowed/);
});

test("ensureOutputChannel seeds IRC home channels immediately", async (t) => {
  const { ToolExecutor } = await loadExecutorModule();
  const eventBus = new InMemoryEventBus();

  const discordApiClient = {
    listChannels: async () => ({ channels: [], count: 0 }),
  } as unknown as Awaited<ReturnType<typeof loadDiscordModule>>["DiscordApiClient"] extends new (...args: any[]) => infer T ? T : never;

  const ircApiClient = {
    listChannels: async () => ({
      channels: [{ id: 'irc:ussy:%23ussycode', name: '#ussycode', guildId: 'irc:ussy', type: 'irc-channel' }],
      count: 1,
    }),
  };

  const executor = new ToolExecutor(eventBus, {
    discordApiClient,
    ircApiClient: ircApiClient as never,
  });

  executor.setSessionResolver((sessionId) => {
    if (sessionId !== 'session-irc-home') {
      return undefined;
    }

    return {
      id: sessionId,
      cephalonId: 'Duck',
      priorityClass: 'interactive',
      credits: 1,
      recentBuffer: [],
      toolPermissions: new Set(),
      homeChannelId: 'irc:ussy:%23ussycode',
    };
  });

  const selection = await executor.ensureOutputChannel('session-irc-home');

  t.is(selection?.channelId, 'irc:ussy:%23ussycode');
  t.is(selection?.channelName, '#ussycode');
  t.is(selection?.reason, 'home channel seed');
});
