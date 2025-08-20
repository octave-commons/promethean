# Vision Service

Express-based service for capturing screenshots. It exposes a `/capture` HTTP
endpoint and a WebSocket at `/capture` for streaming images.

The service also connects to the message broker via the shared
`serviceTemplate.js`, listening on the `vision-capture` task queue and
publishing `vision-capture` events with a base64-encoded image payload.

## Usage

Install dependencies and start the service (pnpm required):

```bash
pnpm install
pnpm start
```

#hashtags: #vision #service #promethean
