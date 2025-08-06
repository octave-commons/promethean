# index.js

**Path**: `services/js/proxy/index.js`

**Description**: Express-based HTTP proxy that forwards requests to Promethean services so they can be accessed through a single port and domain.

### Proxied Routes

By default requests are forwarded to local services:

- `/tts` → `http://127.0.0.1:5001`
- `/stt` → `http://127.0.0.1:5002`
- `/vision` → `http://127.0.0.1:9999`
- `/llm` → `http://127.0.0.1:8888`
- `/heartbeat` → `http://127.0.0.1:5005`

## Dependencies
- express
- http-proxy-middleware

## Dependents
- `services/js/proxy/tests/proxy.test.js`
