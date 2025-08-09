# {{SERVICE_NAME}} Service

Routes HTTP requests for multiple Promethean services through a single entry point.

Also hosts a Socket.IO WebSocket hub for real-time event routing between clients.

## Routes

Requests with the following prefixes are proxied by default:

- `/tts` -> `http://localhost:5001`
- `/stt` -> `http://localhost:5002`
- `/vision` -> `http://localhost:9999`
- `/llm` -> `http://localhost:8888`

## Development

```
npm install
npm test
```
