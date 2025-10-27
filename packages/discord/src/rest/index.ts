import { fileBackedRegistry } from "@promethean-os/security";
import { topic } from "@promethean-os/platform";

// Stub REST proxy: subscribes to rest.request and would call Discord REST.
async function main() {
  const registryFn = fileBackedRegistry as unknown as () => {
    readonly list: () => Promise<unknown[]>;
  };
  const reg = registryFn();
  const raw = await reg.list();
  const tenants = raw.map((r) => {
    const { provider, tenant } = r as { provider: string; tenant: string };
    return { provider, tenant };
  });
  // In real service, subscribe per-tenant topic and forward requests.
  tenants.forEach((t) => {
    const reqTopic = topic({
      provider: t.provider,
      tenant: t.tenant,
      area: "rest",
      name: "request",
    });
    console.log(`[discord-rest] listening on ${reqTopic}`);
  });

  // Example mapping for PostMessage -> REST route
  // function mapPostMessage(cmd: PostMessage) {
  //     return {
  //         route: `/channels/${cmd.space_urn.split(':').pop()}/messages`,
  //         method: 'POST',
  //         body: { content: cmd.text },
  //     };
  // }

  // keep process alive
  setInterval(() => {}, 1 << 30);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
