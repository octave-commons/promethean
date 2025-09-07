/// <reference types="node" resolution-mode="require"/>
type RestResponse = {
  ok: boolean;
  status: number;
  bucket?: string;
  retry_after_ms?: number;
  body?: unknown;
};
export declare class DiscordRestProxy {
  private readonly buckets;
  private readonly retryUntil;
  private readonly capacity;
  private readonly refillPerSec;
  constructor({
    capacity,
    refillPerSec,
  }?: {
    capacity?: number | undefined;
    refillPerSec?: number | undefined;
  });
  private getBucket;
  routeForPostMessage(spaceUrn: string): {
    readonly method: "POST";
    readonly route: `/channels/${string}/messages`;
  };
  routeForDeleteMessage(
    spaceUrn: string,
    messageId: string,
  ): {
    readonly method: "DELETE";
    readonly route:
      | `/channels/undefined/messages/${string}`
      | `/channels/${string}/messages/${string}`;
  };
  routeForAddReaction(
    spaceUrn: string,
    messageId: string,
    emoji: string,
  ): {
    readonly method: "PUT";
    readonly route:
      | `/channels/undefined/messages/${string}/reactions/${string}/@me`
      | `/channels/${string}/messages/${string}/reactions/${string}/@me`;
  };
  routeForRemoveReaction(
    spaceUrn: string,
    messageId: string,
    emoji: string,
  ): {
    readonly method: "DELETE";
    readonly route:
      | `/channels/undefined/messages/${string}/reactions/${string}/@me`
      | `/channels/${string}/messages/${string}/reactions/${string}/@me`;
  };
  routeForListMessages(
    spaceUrn: string,
    params?: {
      limit?: number;
      before?: string;
      after?: string;
      around?: string;
    },
  ): {
    readonly method: "GET";
    readonly route:
      | `/channels/undefined/messages${string}`
      | `/channels/${string}/messages${string}`;
  };
  bucketKey(method: string, route: string): string;
  send(
    provider: string,
    tenant: string,
    method: string,
    route: string,
    body: unknown,
    fetchFn: typeof fetch,
  ): Promise<RestResponse>;
}
export {};
//# sourceMappingURL=rest.d.ts.map
