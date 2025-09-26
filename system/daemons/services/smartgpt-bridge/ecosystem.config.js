// PM2 ecosystem configuration for Promethean SmartGPT Bridge
// Usage:
//   ROOT_PATH=/abs/path/to/repo pnpm dlx pm2 start system/daemons/services/smartgpt-bridge/ecosystem.config.js --env production
//   pm2 status
//   pm2 logs smartgpt-bridge

import path from "path";
import { fileURLToPath } from "url";
import { defineApp } from "@promethean/pm2-helpers";
// import deps from '../../../packages/smartgpt-bridge/ecosystem.dependencies.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageDir = path.resolve(__dirname, "../../../packages/smartgpt-bridge");
const __rootpath = path.resolve(packageDir, "../..");

export const apps = [
  defineApp("smartgpt-bridge", "dist/fastifyServer.js", [], {
    cwd: packageDir,

    time: true,
    log_date_format: "YYYY-MM-DD HH:mm:ss.SSS",

    watch: [path.join(packageDir, "src")],
    env: {
      NODE_ENV: "development",
      // IMPORTANT: set ROOT_PATH to the repository/docs root you want to index
      // Override at start time: ROOT_PATH=/abs/path pm2 start ... --update-env
      ROOT_PATH: __rootpath,
      HOST: "0.0.0.0",
      PORT: "3210",

      // OpenAPI/public base (use your Tailscale Funnel address)
      PUBLIC_BASE_URL:
        "https://err-stealth-16-ai-studio-a1vgg.tailbe888a.ts.net",

      // File scanning and excludes (CSV of globs)
      EXCLUDE_GLOBS:
        "**/node_modules/**,**/.git/**,**/dist/**,**/build/**,**/.obsidian/**,**/.smart_env/**,**/.pnpm/**,**/.cache/**,**/coverage/**",

      // Chroma collection family and embed version
      COLLECTION_FAMILY: "repo_files",
      EMBED_VERSION: "dev",

      PM2_PROCESS_NAME: "smartgpt-bridge",

      // Embedding configuration (remote embedding function)
      EMBEDDING_DRIVER: "ollama",
      EMBEDDING_FUNCTION: "nomic-embed-text",
      EMBED_DIMS: "768",
      BROKER_URL: "ws://localhost:7000",
      SHARED_IMPORT: "@promethean/legacy/brokerClient.js",

      // Agent supervisor process control
      CODEX_BIN: "/home/err/.volta/bin/codex",
      CODEX_ARGS: "", // space-separated args, e.g. "--foo bar"
      AGENT_MAX_LOG_BYTES: String(512 * 1024),
      AGENT_SHELL: "true",

      // Optional integration variables (documented in README/AGENTS.md)
      // DISCORD_TOKEN: '',
      // DISCORD_GUILD_ID: '',
      // DISCORD_CLIENT_USER_ID: '',
      // DISCORD_CLIENT_USER_NAME: '',
      // GITHUB_API_KEY: '',
      // AUTHOR_ID: '',
      // AUTHOR_USER_NAME: '',
      // AGENT_NAME: 'SmartGPT',
    },
    env_production: {
      NODE_ENV: "production",
      // Override these in your environment or with --update-env as needed
      HOST: "0.0.0.0",
      PORT: "3210",
      // PUBLIC_BASE_URL: 'https://your-service.ts.net',
      // COLLECTION_FAMILY: 'repo_files',
      // EMBED_VERSION: 'prod',
    },
    error_file: "logs/pm2-smartgpt-bridge.err.log",
    out_file: "logs/pm2-smartgpt-bridge.out.log",
  }),
];
export default { apps };
