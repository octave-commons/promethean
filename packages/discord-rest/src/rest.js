import { makePolicy, fileBackedRegistry } from "@promethean/security";
import { TokenBucket } from "@promethean/rate";
export class DiscordRestProxy {
  buckets = new Map();
  retryUntil = new Map();
  capacity;
  refillPerSec;
  constructor({ capacity = 5, refillPerSec = 1 } = {}) {
    this.capacity = capacity;
    this.refillPerSec = refillPerSec;
  }
  getBucket(key) {
    const existing = this.buckets.get(key);
    if (existing) return existing;
    const bucket = new TokenBucket({
      capacity: this.capacity,
      refillPerSec: this.refillPerSec,
    });
    // eslint-disable-next-line functional/immutable-data
    this.buckets.set(key, bucket);
    return bucket;
  }
  routeForPostMessage(spaceUrn) {
    const parts = spaceUrn.split(":");
    const channelId = parts[parts.length - 1];
    return {
      method: "POST",
      route: `/channels/${channelId}/messages`,
    };
  }
  routeForDeleteMessage(spaceUrn, messageId) {
    const parts = spaceUrn.split(":");
    const channelId = parts[parts.length - 1];
    return {
      method: "DELETE",
      route: `/channels/${channelId}/messages/${messageId}`,
    };
  }
  routeForAddReaction(spaceUrn, messageId, emoji) {
    const parts = spaceUrn.split(":");
    const channelId = parts[parts.length - 1];
    // emoji must be URL-encoded per Discord API
    const e = encodeURIComponent(emoji);
    return {
      method: "PUT",
      route: `/channels/${channelId}/messages/${messageId}/reactions/${e}/@me`,
    };
  }
  routeForRemoveReaction(spaceUrn, messageId, emoji) {
    const parts = spaceUrn.split(":");
    const channelId = parts[parts.length - 1];
    const e = encodeURIComponent(emoji);
    return {
      method: "DELETE",
      route: `/channels/${channelId}/messages/${messageId}/reactions/${e}/@me`,
    };
  }
  routeForListMessages(spaceUrn, params) {
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
    };
  }
  bucketKey(method, route) {
    // Approximate major parameter bucketing.
    const templ = route
      .replace(/\/channels\/(\d+)/, "/channels/:channel")
      .replace(/\/messages\/(\d+)/, "/messages/:message")
      .replace(/\/(\d{5,})/g, "/:id");
    return `${method}:${templ}`;
  }
  async send(provider, tenant, method, route, body, fetchFn) {
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
    let res;
    try {
      const init = {
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
      // eslint-disable-next-line functional/no-loop-statements
      while (bucket.tryConsume()) {}
      const retryData = await res.json();
      const retry = Number(retryData.retry_after) * 1000 || 1000;
      // eslint-disable-next-line functional/immutable-data
      this.retryUntil.set(bucketKey, Date.now() + retry);
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
//# sourceMappingURL=rest.js.map
