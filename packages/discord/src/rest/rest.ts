import { makePolicy, fileBackedRegistry } from "@promethean-os/security";
import { TokenBucket } from "@promethean-os/monitoring";

type RestResponse = {
  ok: boolean;
  status: number;
  bucket?: string;
  retry_after_ms?: number;
  body?: unknown;
};

export function getChannelId(spaceUrn: string): string {
  const parts = spaceUrn.split(":");
  return parts[parts.length - 1] as string;
}

export class DiscordRestProxy {
  private buckets = new Map<string, TokenBucket>();
  private retryUntil = new Map<string, number>();
  private readonly capacity: number;
  private readonly refillPerSec: number;

  constructor({ capacity = 5, refillPerSec = 1 } = {}) {
    this.capacity = capacity;
    this.refillPerSec = refillPerSec;
  }

  private getBucket(key: string) {
    const existing = this.buckets.get(key);
    if (existing) return existing;
    const bucket = new TokenBucket({
      capacity: this.capacity,
      refillPerSec: this.refillPerSec,
    });
    this.buckets = new Map(this.buckets).set(key, bucket);
    return bucket;
  }

  routeForPostMessage(spaceUrn: string) {
    const channelId = getChannelId(spaceUrn);
    return {
      method: "POST",
      route: `/channels/${channelId}/messages`,
    } as const;
  }

  routeForDeleteMessage(spaceUrn: string, messageId: string) {
    const channelId = getChannelId(spaceUrn);
    return {
      method: "DELETE",
      route: `/channels/${channelId}/messages/${messageId}`,
    } as const;
  }

  routeForAddReaction(spaceUrn: string, messageId: string, emoji: string) {
    const channelId = getChannelId(spaceUrn);
    // emoji must be URL-encoded per Discord API
    const e = encodeURIComponent(emoji);
    return {
      method: "PUT",
      route: `/channels/${channelId}/messages/${messageId}/reactions/${e}/@me`,
    } as const;
  }

  routeForRemoveReaction(spaceUrn: string, messageId: string, emoji: string) {
    const channelId = getChannelId(spaceUrn);
    const e = encodeURIComponent(emoji);
    return {
      method: "DELETE",
      route: `/channels/${channelId}/messages/${messageId}/reactions/${e}/@me`,
    } as const;
  }

  routeForListMessages(
    spaceUrn: string,
    params?: {
      limit?: number;
      before?: string;
      after?: string;
      around?: string;
    },
  ) {
    const channelId = getChannelId(spaceUrn);
    const usp = new URLSearchParams();
    if (params?.limit) usp.set("limit", String(params.limit));
    if (params?.before) usp.set("before", params.before);
    if (params?.after) usp.set("after", params.after);
    if (params?.around) usp.set("around", params.around);
    const qs = usp.toString();
    return {
      method: "GET",
      route: `/channels/${channelId}/messages${qs ? `?${qs}` : ""}`,
    } as const;
  }

  bucketKey(method: string, route: string) {
    // Approximate major parameter bucketing.
    const templ = route
      .replace(/\/channels\/(\d+)/, "/channels/:channel")
      .replace(/\/messages\/(\d+)/, "/messages/:message")
      .replace(/\/(\d{5,})/g, "/:id");
    return `${method}:${templ}`;
  }

  async send(
    provider: string,
    tenant: string,
    method: string,
    route: string,
    body: unknown,
    fetchFn: typeof fetch,
  ): Promise<RestResponse> {
    const policy = makePolicy({
      providerAccess: { allowPatterns: ["services/ts/discord-*/"] },
    });
    await policy.checkCapability("services/ts/discord-rest/", {
      kind: "provider.rest.call",
      provider,
      tenant,
      route,
    });

    const reg = fileBackedRegistry();
    const cfg = await reg.get(provider, tenant);
    const token = cfg.credentials.bot_token;
    const bucketKey = this.bucketKey(method, route);
    const bucket = this.getBucket(bucketKey);

    const retryTs = this.retryUntil.get(bucketKey) ?? 0;
    if (Date.now() < retryTs) {
      const retry_after_ms = retryTs - Date.now();
      return { ok: false, status: 429, bucket: bucketKey, retry_after_ms };
    }

    if (!bucket.tryConsume()) {
      const deficit = bucket.deficit();
      const retry_after_ms = Math.ceil(deficit) * (1000 / this.refillPerSec);
      return { ok: false, status: 429, bucket: bucketKey, retry_after_ms };
    }
    const url = `https://discord.com/api/v10${route}`;
    const hasBody = method === "POST" || method === "PUT" || method === "PATCH";
    let res: Response;
    try {
      const init: RequestInit = {
        method,
        headers: {
          Authorization: `Bot ${token}`,
          "Content-Type": "application/json",
        },
        ...(hasBody && body ? { body: JSON.stringify(body) } : {}),
      };
      res = await fetchFn(url, init);
    } catch (err) {
      return {
        ok: false,
        status: 503,
        bucket: bucketKey,
        body: { error: "network-error", message: String(err) },
      };
    }
    if (res.status === 429) {
      // drain remaining tokens to slow down this bucket
      bucket.drain();
      const retryData = (await res.json()) as { retry_after?: number };
      const retry = Number(retryData.retry_after) * 1000 || 1000;
      this.retryUntil = new Map(this.retryUntil).set(
        bucketKey,
        Date.now() + retry,
      );
      return {
        ok: false,
        status: 429,
        bucket: bucketKey,
        retry_after_ms: retry,
      };
    }
    const ok = res.ok;
    const json = await res.json().catch(() => undefined);
    return { ok, status: res.status, bucket: bucketKey, body: json };
  }
}
