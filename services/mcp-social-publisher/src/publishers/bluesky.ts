import type { BlueskyTarget } from "../state/configStore.js";

type BlueskySession = {
  accessJwt?: string;
  did?: string;
  handle?: string;
};

export async function publishBlueskyPost(target: BlueskyTarget, text: string): Promise<Record<string, unknown>> {
  const sessionResponse = await fetch(`${target.serviceUrl}/xrpc/com.atproto.server.createSession`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identifier: target.identifier,
      password: target.appPassword,
    }),
  });

  if (!sessionResponse.ok) {
    throw new Error(`Bluesky session failed: ${sessionResponse.status} ${await sessionResponse.text()}`);
  }

  const session = await sessionResponse.json() as BlueskySession;
  if (!session.accessJwt || !session.did) {
    throw new Error("Bluesky session response was incomplete");
  }

  const publishResponse = await fetch(`${target.serviceUrl}/xrpc/com.atproto.repo.createRecord`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessJwt}`,
    },
    body: JSON.stringify({
      repo: session.did,
      collection: "app.bsky.feed.post",
      record: {
        $type: "app.bsky.feed.post",
        text,
        createdAt: new Date().toISOString(),
      },
    }),
  });

  if (!publishResponse.ok) {
    throw new Error(`Bluesky publish failed: ${publishResponse.status} ${await publishResponse.text()}`);
  }

  const payload = await publishResponse.json() as Record<string, unknown>;
  return {
    platform: "bluesky",
    target: target.name,
    handle: session.handle ?? target.identifier,
    uri: payload.uri,
    cid: payload.cid,
  };
}
