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
