import test from "ava";
import { Bot } from "../src/bot.js";

function createMessage({ content = "hi", attachments = [] }: any = {}) {
  return {
    author: { bot: false },
    channel: { id: "123" },
    content,
    attachments: new Map(attachments.map((a: any) => [a.id, a])),
  } as any;
}

test("handleMessage enqueues task", async (t) => {
  const bot = new Bot({ token: "t", applicationId: "a", brokerUrl: "u" });
  let called = false;
  (bot.broker as any) = {
    enqueue(queue: string, payload: any) {
      called = queue === "cephalon" && payload.content === "hello";
    },
  };
  const msg = createMessage({ content: "hello" });
  await bot.handleMessage(msg);
  t.true(called);
});

test("handleMessage forwards attachments", async (t) => {
  const bot = new Bot({ token: "t", applicationId: "a", brokerUrl: "u" });
  let sent: any = null;
  bot.captureChannel = {
    send: async (arg: any) => {
      sent = arg;
    },
  } as any;
  (bot.broker as any) = { enqueue() {} };
  const msg = createMessage({
    attachments: [
      {
        id: "1",
        contentType: "image/png",
        url: "http://x/y.png",
        name: "y.png",
      },
    ],
  });
  await bot.handleMessage(msg);
  t.truthy(sent);
  t.is(sent.files[0].attachment, "http://x/y.png");
});

test("handleInteraction forwards to broker", async (t) => {
  const bot = new Bot({ token: "t", applicationId: "a", brokerUrl: "u" });
  let payload: any = null;
  (bot.broker as any) = {
    enqueue(_queue: string, body: any) {
      payload = body;
    },
  };
  const interaction: any = {
    inCachedGuild: () => true,
    isChatInputCommand: () => true,
    commandName: "foo",
    id: "1",
    channelId: "10",
    guildId: "20",
    user: { id: "30" },
    options: { data: [] },
  };
  await bot.handleInteraction(interaction);
  t.deepEqual(payload, {
    type: "discord-interaction",
    interaction: {
      id: "1",
      commandName: "foo",
      channelId: "10",
      guildId: "20",
      userId: "30",
      options: [],
    },
  });
});
