import { InMemoryEventBus } from "../../event/dist/memory.js";
import { topic } from "../../platform/dist/topic.js";
import { normalizeDiscordMessage } from "../../providers/dist/discord/normalize.js";

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
