import type { DiscordTarget } from "../state/configStore.js";

export async function publishDiscordMessage(target: DiscordTarget, content: string): Promise<Record<string, unknown>> {
  const webhookUrl = new URL(target.webhookUrl);
  webhookUrl.searchParams.set("wait", "true");

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      ...(target.username ? { username: target.username } : {}),
      ...(target.avatarUrl ? { avatar_url: target.avatarUrl } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`Discord publish failed: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json() as Record<string, unknown>;
  return {
    platform: "discord",
    target: target.name,
    messageId: payload.id,
    channelId: payload.channel_id,
  };
}
