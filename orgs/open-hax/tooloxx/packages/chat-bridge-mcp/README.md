# chat-bridge-mcp

Normalized MCP chat bridge with an IRC adapter targeting `irc.ussy.host` / `#ussycode` by default.

## Features

- Tools
  - `chat.list_conversations`
  - `chat.read_messages`
  - `chat.send_message`
  - `chat.reply_message`
  - `chat.get_members`
  - `chat.get_capabilities`
- Resources
  - `chat://platforms`
  - `chat://workspaces/irc`
  - `chat://conversations/irc/{workspaceId}`
  - `chat://messages/irc/{workspaceId}/{conversationId}`
  - `chat://message/irc/{workspaceId}/{conversationId}/{messageId}`
  - `chat://capabilities/irc`
- Prompts
  - `summarize-channel`
  - `draft-reply`
  - `moderation-review`
  - `handoff-brief`

## Run

```bash
pnpm --filter @workspace/chat-bridge-mcp dev
```

Default HTTP endpoint:

- `POST /mcp`
- `GET /mcp`
- `DELETE /mcp`
- `GET /health`

## Environment

- `CHAT_BRIDGE_MCP_PORT` or `PORT` — default `4071`
- `CHAT_BRIDGE_IRC_HOST` — default `irc.ussy.host`
- `CHAT_BRIDGE_IRC_PORT` — default `6697`
- `CHAT_BRIDGE_IRC_TLS` — default `true`
- `CHAT_BRIDGE_IRC_NICK` — random `chatbridge-XXXXXXXX`
- `CHAT_BRIDGE_IRC_USER` — default `chatbridge`
- `CHAT_BRIDGE_IRC_REALNAME` — default `chat-bridge-mcp`
- `CHAT_BRIDGE_IRC_WORKSPACE` — default `ussy`
- `CHAT_BRIDGE_IRC_CHANNEL` — default `#ussycode`
- `CHAT_BRIDGE_IRC_HISTORY_LIMIT` — default `200`

## Notes

- IRC history is live-only from the moment the adapter connects.
- `chat.reply_message` falls back to nick-prefix replies on IRC.
