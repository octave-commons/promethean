// SPDX-License-Identifier: GPL-3.0-only
import {
  InMemoryEventBus,
  topic,
  normalizeDiscordMessage,
} from "@shared/prom-lib";

export class GatewayPublisher {
  constructor(private bus: InMemoryEventBus) {}
  async publishRaw(provider: string, tenant: string, payload: any) {
    const t = topic({ provider, tenant, area: "gateway", name: "raw" });
    await this.bus.publish(t, payload);
  }
  async publishNormalized(provider: string, tenant: string, raw: any) {
    const evt = normalizeDiscordMessage(raw, tenant);
    const t = topic({
      provider,
      tenant,
      area: "events",
      name: "SocialMessageCreated",
    });
    await this.bus.publish(t, evt);
    return evt;
  }
}
