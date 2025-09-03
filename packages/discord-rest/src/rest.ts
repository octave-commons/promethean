import { makePolicy } from "../../agent/dist/policy.js";
import { fileBackedRegistry } from "../../platform/dist/provider-registry.js";

type RestResponse = {
  ok: boolean;
  status: number;
  bucket?: string;
  retry_after_ms?: number;
  body?: any;
};

export class BucketLimiter {
  private until = new Map<string, number>();
  now() {
    return Date.now();
  }
  canSend(bucket: string) {
    const t = this.until.get(bucket) || 0;
    return this.now() >= t;
  }
  register429(bucket: string, retryAfterMs: number) {
    const until = this.now() + Math.max(0, retryAfterMs);
    this.until.set(bucket, until);
  }
}

export class DiscordRestProxy {
  private limiter: BucketLimiter;
  constructor(limiter = new BucketLimiter()) {
    this.limiter = limiter;
  }

  routeForPostMessage(spaceUrn: string) {
    const parts = spaceUrn.split(":");
    const channelId = parts[parts.length - 1];
    return {
      method: "POST",
      route: `/channels/${channelId}/messages`,
    } as const;
  }

  routeForDeleteMessage(spaceUrn: string, messageId: string) {
    const parts = spaceUrn.split(":");
    const channelId = parts[parts.length - 1];
    return {
      method: "DELETE",
      route: `/channels/${channelId}/messages/${messageId}`,
    } as const;
  }

  routeForAddReaction(spaceUrn: string, messageId: string, emoji: string) {
    const parts = spaceUrn.split(":");
    const channelId = parts[parts.length - 1];
    // emoji must be URL-encoded per Discord API
    const e = encodeURIComponent(emoji);
    return {
      method: "PUT",
      route: `/channels/${channelId}/messages/${messageId}/reactions/${e}/@me`,
    } as const;
  }

  routeForRemoveReaction(spaceUrn: string, messageId: string, emoji: string) {
    const parts = spaceUrn.split(":");
    const channelId = parts[parts.length - 1];
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
    const parts = spaceUrn.split(":");
    const channelId = parts[parts.length - 1];
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
    body: any,
    fetchFn: typeof fetch,
  ): Promise<RestResponse> {
    const policy = makePolicy({
      providerAccess: { allowPatterns: ["services/ts/discord-*/"] },
    });
    await policy("services/ts/discord-rest/", {
      kind: "provider.rest.call",
      provider,
      tenant,
      route,
    });

    const reg = fileBackedRegistry();
    const cfg = await reg.get(provider, tenant);
    const token = cfg.credentials.bot_token;
    const bucket = this.bucketKey(method, route);
    if (!this.limiter.canSend(bucket)) {
      return {
        ok: false,
        status: 429,
        bucket,
        retry_after_ms: Math.max(
          0,
          (this as any).limiter.until.get(bucket) - Date.now(),
        ),
      };
    }
    const url = `https://discord.com/api/v10${route}`;
    const res = await fetchFn(url, {
      method,
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    } as any);
    if (res.status === 429) {
      const retry =
        Number(((await res.json()) as any).retry_after) * 1000 || 1000;
      this.limiter.register429(bucket, retry);
      return { ok: false, status: 429, bucket, retry_after_ms: retry };
    }
    const ok = res.ok;
    const json = await res.json().catch(() => undefined);
    return { ok, status: res.status, bucket, body: json };
  }
}
