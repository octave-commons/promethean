// SPDX-License-Identifier: GPL-3.0-only
import test from "ava";
import runForward from "../actions/forward-attachments.js";
import { buildForwardAttachmentsScope } from "../actions/forward-attachments.scope.js";
import type { Bot } from "../bot.js";

test("forwards image attachments to capture channel", async (t) => {
  let sent: any = null;
  const bot: Bot = {
    captureChannel: {
      send: async (data: any) => {
        sent = data;
      },
    } as any,
  } as any;
  const attachments = new Map([
    [
      "1",
      {
        url: "https://example.com/img.png",
        name: "img.png",
        contentType: "image/png",
      },
    ],
    [
      "2",
      {
        url: "https://example.com/file.txt",
        name: "file.txt",
        contentType: "text/plain",
      },
    ],
  ]);
  const message: any = { attachments, author: { bot: false } };
  const scope = await buildForwardAttachmentsScope({ bot });
  await runForward(scope, { message });
  t.truthy(sent);
  t.is(sent.files.length, 1);
  t.deepEqual(sent.files[0], {
    attachment: "https://example.com/img.png",
    name: "img.png",
  });
});
