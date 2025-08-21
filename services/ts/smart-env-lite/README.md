# smart-env-lite

A tiny, offline-first clone of the useful parts of "Smart Connections / Smart Connect":
- Reads **`.smart_env/smart_env.json`** (or `.smart-env/smart_env.json`) in your Obsidian vault
- Walks + chunks Markdown, computes embeddings (Ollama or Transformers.js), shards to JSON
- Serves a tiny HTTP API (with **/openapi.json**) you can expose via **Tailscale Funnel** for a Custom GPT

> No account, no keys. You control the models (local Ollama or @xenova/transformers).

## Requirements
- Node 18+
- (Optional) **Ollama** running with an embedding model (e.g., `nomic-embed-text:latest`)
- Your **vault path** containing `.smart_env/smart_env.json`

## Install
```bash
cd smart-env-lite
npm i
```

## Configure
Ensure your vault has one of:
- `VAULT_ROOT/.smart_env/smart_env.json`, or
- `VAULT_ROOT/.smart-env/smart_env.json`

Your sample (works great):
```json
{
  "is_obsidian_vault": true,
  "smart_blocks": { "embed_blocks": true, "min_chars": 200 },
  "smart_sources": {
    "single_file_data_path": ".smart-env/smart_sources.json",
    "min_chars": 200,
    "embed_model": {
      "adapter": "ollama",
      "transformers": {
        "legacy_transformers": false,
        "model_key": "TaylorAI/bge-micro-v2"
      },
      "TaylorAI/bge-micro-v2": {}, 
      "ollama": {
        "model_key": "nomic-embed-text:latest",
        "host": "http://localhost:11434"
      },
      "nomic-embed-text:latest": {}
    }
  },
  "file_exclusions": "Untitled",
  "folder_exclusions": ""
}
```

## Run the server
```bash
# set your vault path
export VAULT_PATH=/home/err/devel/promethean

# start the HTTP API (serves /openapi.json, /index/rebuild, /search, /embed)
npm start
# -> listening on http://0.0.0.0:3210
```

## Rebuild the index
```bash
# one-shot CLI to (re)index the vault
npm run rebuild
```

## Endpoints
- **GET /openapi.json** — OpenAPI 3 spec (for Custom GPT import)
- **POST /index/rebuild** — Re-index everything
- **POST /search** — Body: `{ "q": "text", "k": 8 }`
- **POST /embed** — Body: `{ "text": "hello" }`

## Tailscale Funnel
```bash
sudo tailscale funnel 3210
# then import https://<your>.ts.net/openapi.json into a Custom GPT
```

## Notes
- If `adapter` is `ollama`, we call `POST /api/embeddings` on the configured host.
- If `adapter` is `transformers`, we dynamically import `@xenova/transformers`. This is optional; install only if you plan to use it.
- Index is written next to your `.smart_env` dir as `.smart_env-index` (or `.smart-env-index`).

