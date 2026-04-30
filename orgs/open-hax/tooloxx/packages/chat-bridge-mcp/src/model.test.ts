import test from "node:test";
import assert from "node:assert/strict";

import { formatConversationRef, formatMessageRef, parseConversationRef, parseMessageRef } from "./model.js";

test("conversation refs round-trip with encoded IRC channel ids", () => {
  const ref = formatConversationRef({
    platform: "irc",
    workspaceId: "ussyco",
    conversationId: "#ussycode",
  });

  assert.equal(ref, "chat:irc:ussyco:%23ussycode");
  assert.deepEqual(parseConversationRef(ref), {
    platform: "irc",
    workspaceId: "ussyco",
    conversationId: "#ussycode",
  });
});

test("message refs round-trip", () => {
  const ref = formatMessageRef({
    platform: "irc",
    workspaceId: "ussyco",
    conversationId: "#ussycode",
    messageId: "1710000000-1",
  });

  assert.deepEqual(parseMessageRef(ref), {
    platform: "irc",
    workspaceId: "ussyco",
    conversationId: "#ussycode",
    messageId: "1710000000-1",
  });
});
