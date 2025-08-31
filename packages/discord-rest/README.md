# Discord REST Proxy (stub)

Token-holding access layer for Discord REST. Publishes/consumes bus messages only.

- Subscribes: `promethean.p.discord.t.<tenant>.rest.request`
- Publishes: `promethean.p.discord.t.<tenant>.rest.response`

No tokens or Discord SDK should appear outside `services/ts/discord-*/`.
