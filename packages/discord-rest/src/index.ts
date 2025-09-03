// SPDX-License-Identifier: GPL-3.0-only
import {
  fileBackedRegistry,
  topic, // , PostMessage
} from "@shared/prom-lib";

// Stub REST proxy: subscribes to rest.request and would call Discord REST.
async function main() {
  const reg = fileBackedRegistry();
  const tenants = await reg.list("discord");
  // In real service, subscribe per-tenant topic and forward requests.
  for (const t of tenants) {
    const reqTopic = topic({
      provider: t.provider,
      tenant: t.tenant,
      area: "rest",
      name: "request",
    });
    console.log(`[discord-rest] listening on ${reqTopic}`);
  }

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
