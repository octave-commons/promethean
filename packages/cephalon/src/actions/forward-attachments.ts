import type { Message, TextChannel } from "discord.js";
import { pushVisionFrame } from "@promethean-os/agent-ecs";

import type { ForwardAttachmentsScope } from "./forward-attachments.scope.js";

export type ForwardAttachmentsInput = { message: Message };
export type ForwardAttachmentsOutput = { forwarded: number };

export default async function run(
  scope: ForwardAttachmentsScope,
  { message }: ForwardAttachmentsInput,
): Promise<ForwardAttachmentsOutput> {
  const channel: TextChannel | undefined = scope.getCaptureChannel();
  if (!channel) return { forwarded: 0 };
  if (message.author?.bot) return { forwarded: 0 };
  const imageAttachments = [...message.attachments.values()].filter(
    (att) => att.contentType?.startsWith("image/"),
  );
  if (!imageAttachments.length) return { forwarded: 0 };
  const files = imageAttachments.map((att) => ({
    attachment: att.url,
    name: att.name,
  }));
  await channel.send({ files });
  if (scope.getAgentWorld) {
    const world = scope.getAgentWorld();
    if (world) {
      const { w, agent, C } = world;
      for (const att of imageAttachments) {
        const ref = {
          type: "url" as const,
          url: att.url,
          ...(att.contentType ? { mime: att.contentType } : {}),
        };
        pushVisionFrame(w, agent, C, ref);
      }
    }
  }
  return { forwarded: files.length };
}
