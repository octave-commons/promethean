./services/ts/llm/src/drivers/index.ts:    const name = process.env.LLM_DRIVER || cfg.driver || 'ollama';
./services/ts/llm/src/drivers/index.ts:    const model = process.env.LLM_MODEL || cfg.model || 'gemma3:latest';
./services/ts/llm/src/index.ts:export async function start(port = Number(process.env.LLM_PORT) || 8888) {
./services/ts/llm/src/index.ts:            id: process.env.name || 'llm',
./services/ts/llm/src/index.ts:    const hb = new HeartbeatClient({ name: process.env.name || 'llm' });
./services/ts/llm/src/index.ts:if (process.env.NODE_ENV !== 'test') {
./services/ts/llm/tests/basic.test.js:    process.env.LLM_DRIVER = 'ollama';
./services/ts/llm/tests/basic.test.js:    process.env.LLM_MODEL = 'test-model';
./services/ts/llm/tests/websocket.test.js:    process.env.NODE_ENV = 'test';
./services/ts/llm/tests/websocket.test.js:    process.env.name = 'llm';
./services/ts/llm/tests/drivers.test.js:    process.env.LLM_DRIVER = 'ollama';
./services/ts/llm/tests/drivers.test.js:    process.env.LLM_MODEL = 'test';
./services/ts/llm/tests/drivers.test.js:    process.env.LLM_DRIVER = 'huggingface';
./services/ts/llm/tests/drivers.test.js:    process.env.LLM_MODEL = 'test';
./package.json:        "preinstall": "node -e \"const ua = process.env.npm_config_user_agent || ''; if (!ua.includes('pnpm')) { console.error('\\nERROR: pnpm is required for this repo. npm/yarn are not supported and often fail with EACCES permission errors.\\nInstall via: corepack enable && corepack prepare pnpm@latest --activate\\nThen re-run: pnpm install\\n'); process.exit(1); }\"",
./scripts/flip_alias.ts:  process.env.MONGODB_URI || "mongodb://localhost:27017",
./scripts/flip_alias.ts:const family = `${process.env.AGENT_NAME}_discord_messages`;
./scripts/kanban/pending_count.ts:const mongo = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
./scripts/kanban/pending_count.ts:const family = `${process.env.AGENT_NAME}_discord_messages`;
./scripts/kanban/pending_count.ts:const version = process.env.EMBED_VERSION!;
./scripts/serve-sites.js:    port = Number(process.env.SITES_PORT) || 4500,
./scripts/serve-sites.js:    proxyUrl = process.env.PROXY_URL || 'http://127.0.0.1:8080',
./scripts/kanban/wip-sheriff.ts:const VAULT = process.env.VAULT_ROOT ?? '.';
./scripts/strip-file-extensions.ts:const REPO = process.env.REPO_ROOT ?? process.cwd();
./scripts/lint-topics.ts:const ROOT = process.env.REPO_ROOT || process.cwd();
./services/ts/discord-embedder/src/index.ts:const EMBED_VERSION = process.env.EMBED_VERSION || new Date().toISOString().slice(0, 10);
./services/ts/discord-embedder/src/index.ts:const EMBEDDING_DRIVER = process.env.EMBEDDING_DRIVER || 'ollama';
./services/ts/discord-embedder/src/index.ts:const EMBEDDING_FUNCTION = process.env.EMBEDDING_FUNCTION || 'nomic-embed-text';
./services/ts/discord-embedder/src/index.ts:const EMBED_DIMS = Number(process.env.EMBED_DIMS || 768);
./tests/sites/llm_chat_frontend.test.mjs:process.env.NODE_ENV = 'test';
./templates/ts/service/ecosystem.config.js:if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
./templates/ts/service/ecosystem.config.js:const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM ? [...apps, ...(deps?.apps || [])] : apps;
./services/ts/discord-embedder/ecosystem.config.js:if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
./services/ts/discord-embedder/ecosystem.config.js:const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM ? [...apps, ...(deps?.apps || [])] : apps;
./tests/sites/smartgpt_dashboard_frontend.test.mjs:process.env.NODE_ENV = 'test';
./services/py/discord_attachment_embedder/ecosystem.config.js:if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
./services/py/discord_attachment_embedder/ecosystem.config.js:const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM
./agents/duck/ecosystem.config.js:  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
./docs/notes/2025.08.19.15.16.43.md:  process.env.BROKER_URL = (t.context as any).url;
./docs/notes/2025.08.19.15.16.43.md:  const url = process.env.BROKER_URL;
./docs/notes/2025.08.22.10.10.02.md:    { expireAfterSeconds: process.env.LOG_TTL_DAYS ? Number(process.env.LOG_TTL_DAYS) * 86400 : 60 * 60 * 24 * 30 }
./services/ts/markdown-graph/src/index.ts:    const repo = process.env.REPO_PATH || '.';
./services/ts/markdown-graph/src/index.ts:    const cold = process.env.COLD_START === '1';
./services/ts/markdown-graph/src/index.ts:            id: process.env.name || 'markdown-graph',
./services/ts/markdown-graph/src/index.ts:    const port = Number(process.env.PORT) || 8123;
./services/ts/markdown-graph/src/index.ts:if (process.env.NODE_ENV !== 'test') {
./services/ts/markdown-graph/tests/graph.test.ts:    process.env.MONGODB_URI = mongod.getUri();
./services/ts/markdown-graph/tests/graph.test.ts:    process.env.CHROMA_URL = 'http://127.0.0.1:8000';
./services/ts/markdown-graph/ecosystem.config.js:if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
./services/ts/markdown-graph/ecosystem.config.js:const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM
./services/py/embedding_service/ecosystem.config.js:if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
./services/py/embedding_service/ecosystem.config.js:const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM
./services/ts/cephalon/src/voice-synth.ts:            port: Number(process.env.PROXY_PORT) || 8080,
./shared/ts/collectionManager.ts:  process.env.MONGODB_URI || "mongodb://localhost:27017",
./shared/ts/embedding.ts:    url = process.env.EMBEDDING_SERVICE_URL || "http://localhost:8000/embed",
./shared/ts/embedding.ts:    driver = process.env.EMBEDDING_DRIVER,
./shared/ts/embedding.ts:    fn = process.env.EMBEDDING_FUNCTION,
./services/py/stt/ecosystem.config.js:if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
./services/py/stt/ecosystem.config.js:const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM
./services/ts/cephalon/src/index.ts:        token: process.env.DISCORD_TOKEN as string,
./services/ts/cephalon/src/index.ts:        applicationId: process.env.DISCORD_CLIENT_USER_ID as string,
./services/ts/cephalon/src/index.ts:if (process.env.NODE_ENV !== 'test') {
./services/ts/cephalon/src/llm-service.ts:        const brokerUrl = options.brokerUrl || process.env.BROKER_URL || 'ws://localhost:7000';
./docs/notes/2025.08.19.18.40.01.md:		brokerUrl = process.env.BROKER_URL || 'ws://localhost:7000',
./docs/notes/2025.08.19.18.40.01.md:		driver = process.env.EMBEDDING_DRIVER,
./docs/notes/2025.08.19.18.40.01.md:		fn = process.env.EMBEDDING_FUNCTION,
./docs/notes/2025.08.19.18.40.01.md:const MONGO_CONNECTION_STRING = process.env.MONGODB_URI || `mongodb://localhost`;
./docs/notes/2025.08.19.18.40.01.md:const EMBED_VERSION = process.env.EMBED_VERSION || new Date().toISOString().slice(0, 10);
./docs/notes/2025.08.19.18.40.01.md:const EMBEDDING_DRIVER = process.env.EMBEDDING_DRIVER || 'ollama';
./docs/notes/2025.08.19.18.40.01.md:const EMBEDDING_FUNCTION = process.env.EMBEDDING_FUNCTION || 'nomic-embed-text';
./docs/notes/2025.08.19.18.40.01.md:const EMBED_DIMS = Number(process.env.EMBED_DIMS || 768);
./docs/notes/2025.08.19.18.40.01.md:const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
./docs/notes/2025.08.19.18.40.01.md:                  driver: process.env.EMBEDDING_DRIVER || 'ollama',
./docs/notes/2025.08.19.18.40.01.md:                  fn: process.env.EMBEDDING_FUNCTION || 'nomic-embed-text',
./services/ts/cephalon/src/transcriber.ts:        if (process.env.DISABLE_BROKER === '1') {
./services/ts/cephalon/src/transcriber.ts:            url: options.brokerUrl || process.env.BROKER_URL || 'ws://localhost:7000',
./shared/ts/src/embeddings/remote.ts:        brokerUrl = process.env.BROKER_URL || 'ws://localhost:7000',
./shared/ts/src/embeddings/remote.ts:        driver = process.env.EMBEDDING_DRIVER,
./shared/ts/src/embeddings/remote.ts:        fn = process.env.EMBEDDING_FUNCTION,
./services/ts/file-watcher/src/token-client.ts:    const url = process.env.AUTH_SERVICE_URL;
./services/ts/file-watcher/src/token-client.ts:    const id = process.env.AUTH_CLIENT_ID;
./services/ts/file-watcher/src/token-client.ts:    const secret = process.env.AUTH_CLIENT_SECRET;
./services/ts/file-watcher/src/token-client.ts:    const scope = process.env.AUTH_SCOPE || 'index:write';
./services/ts/file-watcher/src/token-client.ts:    const audience = process.env.AUTH_AUDIENCE;
./services/ts/cephalon/src/desktop/desktopLoop.ts:const VISION_HOST = process.env.VISION_HOST || 'http://localhost:8080/vision';
./services/ts/cephalon/src/desktop/desktopLoop.ts:    if (process.env.NO_SCREENSHOT === '1') {
./services/ts/file-watcher/src/index.ts:const defaultRepoRoot = process.env.REPO_ROOT || '';
./services/ts/file-watcher/src/index.ts:    const bridgeUrl = process.env.SMARTGPT_BRIDGE_URL || 'http://127.0.0.1:3210';
./services/ts/file-watcher/src/index.ts:        process.env.SMARTGPT_BRIDGE_TOKEN ||
./services/ts/file-watcher/src/index.ts:        process.env.BRIDGE_AUTH_TOKEN ||
./services/ts/file-watcher/src/index.ts:        process.env.AUTH_TOKEN;
./services/ts/file-watcher/src/index.ts:              url: process.env.BROKER_URL || 'ws://localhost:7000',
./services/ts/file-watcher/src/index.ts:if (process.env.NODE_ENV !== 'test') {
./services/py/tts/ecosystem.config.js:if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
./services/py/tts/ecosystem.config.js:const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM
./services/ts/file-watcher/src/repo-watcher.ts:            : Number(process.env.FILE_WATCHER_DEBOUNCE_MS || 2000);
./services/ts/file-watcher/src/repo-watcher.ts:            process.env.SMARTGPT_BRIDGE_TOKEN ||
./services/ts/file-watcher/src/repo-watcher.ts:            process.env.BRIDGE_AUTH_TOKEN ||
./services/ts/file-watcher/src/repo-watcher.ts:            process.env.AUTH_TOKEN ||
./services/ts/kanban-processor/src/index.ts:const defaultRepoRoot = process.env.REPO_ROOT || '';
./services/ts/kanban-processor/src/index.ts:    if (process.env.NODE_ENV !== 'test') {
./services/ts/kanban-processor/src/index.ts:    const brokerUrl = process.env.BROKER_URL || 'ws://localhost:7000';
./services/ts/kanban-processor/src/index.ts:if (process.env.NODE_ENV !== 'test') {
./docs/notes/2025.08.12.18.54.06.md:const MONGO_CONNECTION_STRING = process.env.MONGODB_URI || `mongodb://localhost`;
./docs/notes/2025.08.12.18.54.06.md:		brokerUrl = process.env.BROKER_URL || 'ws://localhost:7000',
./docs/notes/2025.08.12.18.54.06.md:		driver = process.env.EMBEDDING_DRIVER,
./docs/notes/2025.08.12.18.54.06.md:		fn = process.env.EMBEDDING_FUNCTION,
./docs/notes/2025.08.12.18.54.06.md:const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
./services/ts/kanban-processor/tests/queue.test.ts:    process.env.BROKER_URL = `ws://localhost:${port}`;
./services/ts/file-watcher/tests/repo-watcher.test.ts:    process.env.SMARTGPT_BRIDGE_TOKEN = 'test-token';
./services/ts/file-watcher/tests/repo-watcher.test.ts:    delete process.env.SMARTGPT_BRIDGE_TOKEN;
./docs/notes/2025.08.24.00.31.41.md:const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
./docs/notes/2025.08.24.00.31.41.md:const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
./docs/notes/2025.08.24.00.31.41.md:const mongoClient = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost");
./docs/notes/2025.08.24.00.31.41.md:const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
./docs/notes/2025.08.24.00.31.41.md:const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
./docs/notes/2025.08.24.00.31.41.md:const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
./docs/notes/2025.08.24.00.31.41.md:- const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
./docs/notes/2025.08.24.00.31.41.md:const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
./docs/notes/2025.08.24.00.31.41.md:const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
./docs/notes/2025.08.22.20.59.41.md:  if (process.env.NODE_PTY_DISABLED === '1') return null;
./docs/notes/2025.08.22.20.59.41.md:process.env.NODE_PTY_DISABLED = '1';
./docs/notes/2025.08.22.20.59.41.md:if (process.env.NODE_ENV === 'test' && (!process.env.MONGO_URI || process.env.MONGO_URI === 'memory')) {
./docs/notes/2025.08.22.20.59.41.md:process.env.NODE_ENV = 'test';
./docs/notes/2025.08.22.20.59.41.md:process.env.MONGO_URI = 'memory';
./docs/notes/2025.08.22.20.59.41.md:+  if (process.env.NODE_PTY_DISABLED === '1') return null;
./docs/notes/2025.08.22.20.59.41.md:+process.env.NODE_ENV = 'test';
./docs/notes/2025.08.22.20.59.41.md:+process.env.NODE_PTY_DISABLED = process.env.NODE_PTY_DISABLED || '1';
./docs/notes/2025.08.22.20.59.41.md:+  process.env.MONGO_URI = process.env.MONGO_URI || __mongoUri;
./services/ts/file-watcher/ecosystem.config.js:if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
./services/ts/file-watcher/ecosystem.config.js:const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM ? [...apps, ...(deps?.apps || [])] : apps;
./services/ts/kanban-processor/ecosystem.config.js:if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
./services/ts/kanban-processor/ecosystem.config.js:const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM ? [...apps, ...(deps?.apps || [])] : apps;
./docs/notes/2025.08.21.14.35.23.md:        ...process.env,
./services/ts/cephalon/src/tests/messageThrottler.test.ts:process.env.DISABLE_AUDIO = '1';
./services/js/event-hub/evolve.ts:        process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/prom',
./services/ts/cephalon/src/tests/tickrate.test.ts:process.env.DISABLE_AUDIO = '1';
./services/js/vision/index.js:const W = Number(process.env.SCREEN_W) || 2560;
./services/js/vision/index.js:const H = Number(process.env.SCREEN_H) || 1600;
./services/js/vision/index.js:const FORMAT = (process.env.VISION_FORMAT || 'png').toLowerCase();
./services/js/vision/index.js:        args.push('-quality', process.env.VISION_QUALITY || '85', 'jpg:-');
./services/js/vision/index.js:        args.push('-quality', process.env.VISION_QUALITY || '85', 'webp:-');
./services/js/vision/index.js:if (process.env.VISION_STUB) {
./services/js/vision/index.js:export async function start(port = process.env.PORT || 5003) {
./services/js/vision/index.js:        const hb = new HeartbeatClient({ name: process.env.name || 'vision' });
./services/js/vision/index.js:        id: process.env.name || 'vision',
./services/js/vision/index.js:if (process.env.NODE_ENV !== 'test') {
./services/js/eidolon-field/index.js:        this.mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
./services/js/eidolon-field/index.js:        this.dbName = process.env.DB_NAME || 'eidolon_field';
./services/js/eidolon-field/index.js:        this.collectionName = process.env.COLLECTION || 'fields';
./services/js/eidolon-field/index.js:if (process.env.NODE_ENV !== 'test') {
./docs/notes/2025.08.22.14.14.21.md:    const ok = new Octokit({ auth: process.env.GITHUB_TOKEN }); // or unauthenticated low rate
./docs/notes/2025.08.22.14.14.21.md:const HANDLE = process.env.BSKY_HANDLE || '';
./docs/notes/2025.08.22.14.14.21.md:const PASS = process.env.BSKY_PASSWORD || '';
./docs/notes/2025.08.22.14.14.21.md:const HANDLE = process.env.BSKY_HANDLE || "";
./docs/notes/2025.08.22.14.14.21.md:const PASS = process.env.BSKY_PASSWORD || "";
./docs/notes/2025.08.22.12.22.31.md:+const SINKS_URL = process.env.SINKS_URL || "http://localhost:4001/sinks";
./docs/notes/2025.08.22.12.22.31.md:+const LLM_BROKER_URL = process.env.LLM_BROKER_URL || "http://localhost:5001/generate";
./docs/notes/2025.08.22.12.22.31.md:+const BRIDGE_URL = process.env.BRIDGE_URL || "http://localhost:6001/search";
./services/ts/cephalon/src/tests/llm_forward.test.ts:    process.env.NO_SCREENSHOT = '1';
./services/ts/cephalon/src/tests/embedding.test.ts:    process.env.BROKER_URL = `ws://127.0.0.1:${port}`;
./services/js/eidolon-field/tests/tick.test.js:    process.env.MONGO_URL = uri;
./services/js/eidolon-field/ecosystem.config.js:if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
./services/js/eidolon-field/ecosystem.config.js:const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM ? [...apps, ...(deps?.apps || [])] : apps;
./services/js/vision/tests/websocket.test.js:    process.env.NODE_ENV = 'test';
./services/js/vision/tests/capture.test.js:process.env.NODE_ENV = 'test';
./services/js/vision/ecosystem.config.js:if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
./services/js/vision/ecosystem.config.js:const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM ? [...apps, ...(deps?.apps || [])] : apps;
./services/js/health/index.js:export async function start(port = process.env.PORT || 0) {
./services/js/health/index.js:    HEARTBEAT_TIMEOUT = parseInt(process.env.HEARTBEAT_TIMEOUT || '10000', 10);
./services/js/health/index.js:    const url = process.env.BROKER_URL || `ws://127.0.0.1:${process.env.BROKER_PORT || 7000}`;
./services/js/health/index.js:if (process.env.NODE_ENV !== 'test') {
./services/js/health/index.js:    start(process.env.PORT || 5006).catch((err) => {
./services/ts/smartgpt-bridge/tests/unit/remoteEmbedding.more.test.js:    const prev = process.env.SHARED_IMPORT;
./services/ts/smartgpt-bridge/tests/unit/remoteEmbedding.more.test.js:        process.env.SHARED_IMPORT = 'file://' + abs;
./services/ts/smartgpt-bridge/tests/unit/remoteEmbedding.more.test.js:        if (prev === undefined) delete process.env.SHARED_IMPORT;
./services/ts/smartgpt-bridge/tests/unit/remoteEmbedding.more.test.js:        else process.env.SHARED_IMPORT = prev;
./services/js/heartbeat/index.js:            process.env.ECOSYSTEM_CONFIG ||
./services/js/heartbeat/index.js:    HEARTBEAT_TIMEOUT = parseInt(process.env.HEARTBEAT_TIMEOUT || '10000', 10);
./services/js/heartbeat/index.js:    CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL || '5000', 10);
./services/js/heartbeat/index.js:    MONGO_URL = process.env.MONGO_URL || MONGO_URL;
./services/js/heartbeat/index.js:    DB_NAME = process.env.DB_NAME || DB_NAME;
./services/js/heartbeat/index.js:    COLLECTION = process.env.COLLECTION || COLLECTION;
./services/js/heartbeat/index.js:    BROKER_URL = process.env.BROKER_URL || BROKER_URL;
./services/js/heartbeat/index.js:if (process.env.NODE_ENV !== 'test') {
./services/js/heartbeat/ecosystem.config.js:if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
./services/js/heartbeat/ecosystem.config.js:const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM ? [...apps, ...(deps?.apps || [])] : apps;
./services/ts/smartgpt-bridge/tests/unit/indexer.branches.test.js:    const prevD = process.env.EMBEDDING_DRIVER;
./services/ts/smartgpt-bridge/tests/unit/indexer.branches.test.js:    const prevF = process.env.EMBEDDING_FUNCTION;
./services/ts/smartgpt-bridge/tests/unit/indexer.branches.test.js:        process.env.EMBEDDING_DRIVER = 'driverZ';
./services/ts/smartgpt-bridge/tests/unit/indexer.branches.test.js:        process.env.EMBEDDING_FUNCTION = 'fnZ';
./services/ts/smartgpt-bridge/tests/unit/indexer.branches.test.js:        if (prevD === undefined) delete process.env.EMBEDDING_DRIVER;
./services/ts/smartgpt-bridge/tests/unit/indexer.branches.test.js:        else process.env.EMBEDDING_DRIVER = prevD;
./services/ts/smartgpt-bridge/tests/unit/indexer.branches.test.js:        if (prevF === undefined) delete process.env.EMBEDDING_FUNCTION;
./services/ts/smartgpt-bridge/tests/unit/indexer.branches.test.js:        else process.env.EMBEDDING_FUNCTION = prevF;
./services/ts/smartgpt-bridge/tests/unit/indexer.branches.test.js:    const prev = process.env.EXCLUDE_GLOBS;
./services/ts/smartgpt-bridge/tests/unit/indexer.branches.test.js:        process.env.EXCLUDE_GLOBS = 'tmp_excl.txt';
./services/ts/smartgpt-bridge/tests/unit/indexer.branches.test.js:        if (prev === undefined) delete process.env.EXCLUDE_GLOBS;
./services/ts/smartgpt-bridge/tests/unit/indexer.branches.test.js:        else process.env.EXCLUDE_GLOBS = prev;
./services/ts/smartgpt-bridge/tests/unit/remoteEmbedding.test.js:    const prev = process.env.SHARED_IMPORT;
./services/ts/smartgpt-bridge/tests/unit/remoteEmbedding.test.js:        process.env.SHARED_IMPORT = 'file://' + abs;
./services/ts/smartgpt-bridge/tests/unit/remoteEmbedding.test.js:        if (prev === undefined) delete process.env.SHARED_IMPORT;
./services/ts/smartgpt-bridge/tests/unit/remoteEmbedding.test.js:        else process.env.SHARED_IMPORT = prev;
./shared/ts/src/ws/client.ts:      process.env.BROKER_WS_URL &&
./shared/ts/src/ws/client.ts:      url.startsWith(process.env.BROKER_WS_URL)
./services/ts/cephalon/src/agent/index.ts:            (process.env.DISABLE_BROKER === '1'
./services/ts/cephalon/src/agent/index.ts:            process.env.DISABLE_AUDIO === '1' ? (new EventEmitter() as unknown as AudioPlayer) : createAudioPlayer();
./services/js/health/tests/health.test.js:    process.env.BROKER_URL = `ws://127.0.0.1:${brokerPort}`;
./services/js/health/tests/health.test.js:    process.env.HEARTBEAT_TIMEOUT = '10000';
./services/ts/smartgpt-bridge/tests/unit/remoteEmbedding.timeout.test.js:        SHARED_IMPORT: process.env.SHARED_IMPORT,
./services/ts/smartgpt-bridge/tests/unit/remoteEmbedding.timeout.test.js:        EMBEDDING_TIMEOUT_MS: process.env.EMBEDDING_TIMEOUT_MS,
./services/ts/smartgpt-bridge/tests/unit/remoteEmbedding.timeout.test.js:        process.env.SHARED_IMPORT = 'file://' + abs;
./services/ts/smartgpt-bridge/tests/unit/remoteEmbedding.timeout.test.js:        process.env.EMBEDDING_TIMEOUT_MS = '50';
./services/ts/smartgpt-bridge/tests/unit/remoteEmbedding.timeout.test.js:        if (prev.SHARED_IMPORT === undefined) delete process.env.SHARED_IMPORT;
./services/ts/smartgpt-bridge/tests/unit/remoteEmbedding.timeout.test.js:        else process.env.SHARED_IMPORT = prev.SHARED_IMPORT;
./services/ts/smartgpt-bridge/tests/unit/remoteEmbedding.timeout.test.js:        if (prev.EMBEDDING_TIMEOUT_MS === undefined) delete process.env.EMBEDDING_TIMEOUT_MS;
./services/ts/smartgpt-bridge/tests/unit/remoteEmbedding.timeout.test.js:        else process.env.EMBEDDING_TIMEOUT_MS = prev.EMBEDDING_TIMEOUT_MS;
./services/js/proxy/index.js:export async function start(port = process.env.PORT || 8080, routes = defaultRoutes) {
./services/js/proxy/index.js:if (process.env.NODE_ENV !== 'test') {
./services/ts/smartgpt-bridge/tests/helpers/server.js:    process.env.NODE_ENV = 'test';
./services/ts/smartgpt-bridge/tests/helpers/server.js:    if (!process.env.NODE_PTY_DISABLED) process.env.NODE_PTY_DISABLED = '1';
./services/ts/smartgpt-bridge/tests/helpers/server.js:    if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'memory') {
./services/ts/smartgpt-bridge/tests/helpers/server.js:        process.env.MONGODB_URI = mms.getUri();
./services/js/heartbeat/tests/lifecycle.test.js:    process.env.ECOSYSTEM_CONFIG = path.resolve(__dirname, 'test-ecosystem.config.cjs');
./services/js/heartbeat/tests/lifecycle.test.js:    process.env.MONGO_URL = mongo.getUri();
./services/js/heartbeat/tests/lifecycle.test.js:    process.env.BROKER_URL = `ws://127.0.0.1:${brokerPort}`;
./services/js/health/ecosystem.config.js:if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
./services/js/health/ecosystem.config.js:const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM ? [...apps, ...(deps?.apps || [])] : apps;
./services/js/heartbeat/tests/heartbeat.test.js:    const client = new MongoClient(process.env.MONGO_URL);
./services/js/heartbeat/tests/heartbeat.test.js:    process.env.ECOSYSTEM_CONFIG = path.resolve(__dirname, 'test-ecosystem.config.cjs');
./services/js/heartbeat/tests/heartbeat.test.js:    process.env.MONGO_URL = mongo.getUri();
./services/js/heartbeat/tests/heartbeat.test.js:    process.env.HEARTBEAT_TIMEOUT = '100';
./services/js/heartbeat/tests/heartbeat.test.js:    process.env.CHECK_INTERVAL = '50';
./services/js/heartbeat/tests/heartbeat.test.js:    process.env.BROKER_URL = `ws://127.0.0.1:${brokerPort}`;
./services/js/heartbeat/tests/heartbeat.test.js:    const client = new MongoClient(process.env.MONGO_URL);
./services/js/heartbeat/tests/heartbeat.test.js:    const client = new MongoClient(process.env.MONGO_URL);
./services/js/heartbeat/tests/heartbeat.test.js:    const client = new MongoClient(process.env.MONGO_URL);
./services/js/heartbeat/tests/heartbeat.test.js:    const client = new MongoClient(process.env.MONGO_URL);
./services/js/heartbeat/tests/heartbeat.test.js:    const client = new MongoClient(process.env.MONGO_URL);
./services/js/heartbeat/tests/heartbeat.test.js:    const verify = new MongoClient(process.env.MONGO_URL);
./services/js/heartbeat/tests/heartbeat.test.js:    const client = new MongoClient(process.env.MONGO_URL);
./services/ts/cephalon/src/bot.ts:// const VOICE_SERVICE_URL = process.env.VOICE_SERVICE_URL || 'http://localhost:4000';
./services/ts/cephalon/src/bot.ts:            url: process.env.BROKER_WS_URL || 'ws://localhost:7000',
./services/ts/smartgpt-bridge/src/logging/chromaCleanup.js:    days = Number(process.env.LOG_TTL_DAYS || 30),
./services/ts/smartgpt-bridge/src/logging/chromaCleanup.js:    max = Number(process.env.LOG_MAX_CHROMA || 100000),
./services/ts/smartgpt-bridge/src/logging/chromaCleanup.js:    const days = Number(process.env.LOG_TTL_DAYS || 30);
./services/ts/smartgpt-bridge/src/logging/chromaCleanup.js:    const max = Number(process.env.LOG_MAX_CHROMA || 100000);
./services/ts/smartgpt-bridge/src/fastifyServer.js:const PORT = Number(process.env.PORT || 3210);
./services/ts/smartgpt-bridge/src/fastifyServer.js:const ROOT_PATH = process.env.ROOT_PATH || process.cwd();
./services/js/proxy/ecosystem.config.js:if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
./services/js/proxy/ecosystem.config.js:const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM ? [...apps, ...(deps?.apps || [])] : apps;
./services/ts/smartgpt-bridge/src/fastifyApp.js:    const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3210}`;
./services/ts/smartgpt-bridge/src/fastifyApp.js:    if ((process.env.NODE_ENV || '').toLowerCase() !== 'test') {
./services/ts/smartgpt-bridge/src/fastifyApp.js:        const restoreAllowed = String(process.env.AGENT_RESTORE_ON_START || 'true') !== 'false';
./services/ts/smartgpt-bridge/src/files.js:    const env = splitCSV(process.env.EXCLUDE_GLOBS);
./services/js/broker/index.js:export async function start(port = process.env.PORT || 7000) {
./services/js/broker/index.js:if (process.env.NODE_ENV !== 'test') {
./services/ts/smartgpt-bridge/tests/integration/server.exec.flag.test.js:    const prev = { EXEC_ENABLED: process.env.EXEC_ENABLED };
./services/ts/smartgpt-bridge/tests/integration/server.exec.flag.test.js:        delete process.env.EXEC_ENABLED;
./services/ts/smartgpt-bridge/tests/integration/server.exec.flag.test.js:        if (prev.EXEC_ENABLED === undefined) delete process.env.EXEC_ENABLED;
./services/ts/smartgpt-bridge/tests/integration/server.exec.flag.test.js:        else process.env.EXEC_ENABLED = prev.EXEC_ENABLED;
./services/js/broker/ecosystem.config.js:if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
./services/js/broker/ecosystem.config.js:const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM ? [...apps, ...(deps?.apps || [])] : apps;
./services/ts/smartgpt-bridge/src/auth.js:    const enabled = String(process.env.AUTH_ENABLED || 'false').toLowerCase() === 'true';
./services/ts/smartgpt-bridge/src/auth.js:    const mode = (process.env.AUTH_MODE || 'static').toLowerCase(); // 'static' | 'jwt'
./services/ts/smartgpt-bridge/src/auth.js:    const cookieName = process.env.AUTH_COOKIE || 'smartgpt_auth';
./services/ts/smartgpt-bridge/src/auth.js:    const staticTokens = String(process.env.AUTH_TOKENS || process.env.AUTH_TOKEN || '')
./services/ts/smartgpt-bridge/src/auth.js:    const jwtSecret = process.env.AUTH_JWT_SECRET;
./services/ts/smartgpt-bridge/src/auth.js:    const jwksUrl = process.env.AUTH_JWKS_URL;
./services/ts/smartgpt-bridge/src/auth.js:    const jwtIssuer = process.env.AUTH_JWT_ISSUER;
./services/ts/smartgpt-bridge/src/auth.js:    const jwtAudience = process.env.AUTH_JWT_AUDIENCE;
./services/ts/smartgpt-bridge/src/logger.js:const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();
./services/ts/smartgpt-bridge/src/logger.js:const LOG_JSON = /^true$/i.test(process.env.LOG_JSON || 'false');
./services/ts/smartgpt-bridge/src/logger.js:const LOG_FILE = process.env.LOG_FILE || '';
./services/js/event-gateway/index.ts:    startWSGateway(bus, Number(process.env.WS_PORT ?? 8090), {
./services/js/event-gateway/index.ts:            token === process.env.WS_TOKEN
./services/js/event-gateway/index.ts:    startHttpPublisher(bus, Number(process.env.HTTP_PORT ?? 8081));
./services/ts/smartgpt-bridge/src/symbols.js:    const env = splitCSV(process.env.EXCLUDE_GLOBS);
./services/ts/smartgpt-bridge/tests/integration/indexer.incremental.test.js:    process.env.INDEXER_FILE_DELAY_MS = '0';
./services/ts/smartgpt-bridge/tests/integration/auth.static.test.js:    delete process.env.AUTH_ENABLED;
./services/ts/smartgpt-bridge/tests/integration/auth.static.test.js:        AUTH_ENABLED: process.env.AUTH_ENABLED,
./services/ts/smartgpt-bridge/tests/integration/auth.static.test.js:        AUTH_MODE: process.env.AUTH_MODE,
./services/ts/smartgpt-bridge/tests/integration/auth.static.test.js:        AUTH_TOKENS: process.env.AUTH_TOKENS,
./services/ts/smartgpt-bridge/tests/integration/auth.static.test.js:        process.env.AUTH_ENABLED = 'true';
./services/ts/smartgpt-bridge/tests/integration/auth.static.test.js:        process.env.AUTH_MODE = 'static';
./services/ts/smartgpt-bridge/tests/integration/auth.static.test.js:        process.env.AUTH_TOKENS = 'secret-token';
./services/ts/smartgpt-bridge/tests/integration/auth.static.test.js:        process.env.AUTH_ENABLED = prev.AUTH_ENABLED;
./services/ts/smartgpt-bridge/tests/integration/auth.static.test.js:        process.env.AUTH_MODE = prev.AUTH_MODE;
./services/ts/smartgpt-bridge/tests/integration/auth.static.test.js:        process.env.AUTH_TOKENS = prev.AUTH_TOKENS;
./services/js/heartbeat/tests/client.test.js:    process.env.ECOSYSTEM_CONFIG = path.resolve(__dirname, 'test-ecosystem.config.cjs');
./services/js/heartbeat/tests/client.test.js:    process.env.MONGO_URL = mongo.getUri();
./services/js/heartbeat/tests/client.test.js:    process.env.HEARTBEAT_TIMEOUT = '1000';
./services/js/heartbeat/tests/client.test.js:    process.env.CHECK_INTERVAL = '500';
./services/js/heartbeat/tests/client.test.js:    process.env.BROKER_URL = `ws://127.0.0.1:${brokerPort}`;
./services/js/heartbeat/tests/client.test.js:    const mongoClient = new MongoClient(process.env.MONGO_URL);
./services/ts/smartgpt-bridge/tests/integration/server.openapi.test.js:    const prev = process.env.PUBLIC_BASE_URL;
./services/ts/smartgpt-bridge/tests/integration/server.openapi.test.js:    process.env.PUBLIC_BASE_URL = 'https://funnel.example.ts.net';
./services/ts/smartgpt-bridge/tests/integration/server.openapi.test.js:            t.is(res.body.servers[0].url, process.env.PUBLIC_BASE_URL);
./services/ts/smartgpt-bridge/tests/integration/server.openapi.test.js:        if (prev === undefined) delete process.env.PUBLIC_BASE_URL;
./services/ts/smartgpt-bridge/tests/integration/server.openapi.test.js:        else process.env.PUBLIC_BASE_URL = prev;
./services/ts/cephalon/ecosystem.config.js:if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
./services/ts/cephalon/ecosystem.config.js:const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM ? [...apps, ...(deps?.apps || [])] : apps;
./services/js/broker/tests/broker.test.js:    process.env.REDIS_URL = 'redis://127.0.0.1:6390'; // force fallback to memory
./services/ts/smartgpt-bridge/tests/integration/server.exec.cwd.security.test.js:    const prev = { EXEC_ENABLED: process.env.EXEC_ENABLED };
./services/ts/smartgpt-bridge/tests/integration/server.exec.cwd.security.test.js:        process.env.EXEC_ENABLED = 'true';
./services/ts/smartgpt-bridge/tests/integration/server.exec.cwd.security.test.js:        process.env.EXEC_ENABLED = prev.EXEC_ENABLED;
./shared/ts/src/tests/fixtures/cephalon.before.ts:            port: Number(process.env.PROXY_PORT) || 8080,
./services/ts/smartgpt-bridge/src/remoteEmbedding.js:        brokerUrl = process.env.BROKER_URL || 'ws://localhost:7000',
./services/ts/smartgpt-bridge/src/remoteEmbedding.js:        driver = process.env.EMBEDDING_DRIVER,
./services/ts/smartgpt-bridge/src/remoteEmbedding.js:        fn = process.env.EMBEDDING_FUNCTION,
./services/ts/smartgpt-bridge/src/remoteEmbedding.js:        } else if (process.env.SHARED_IMPORT) {
./services/ts/smartgpt-bridge/src/remoteEmbedding.js:            const modPromise = import(process.env.SHARED_IMPORT);
./services/ts/smartgpt-bridge/src/remoteEmbedding.js:        const timeoutMs = Number(process.env.EMBEDDING_TIMEOUT_MS || 0);
./docs/dev/ts-remote-embedding.md:  driver: process.env.EMBEDDING_DRIVER || 'ollama',
./docs/dev/ts-remote-embedding.md:  fn: process.env.EMBEDDING_FUNCTION || 'nomic-embed-text',
./docs/dev/ts-remote-embedding.md:  brokerUrl: process.env.BROKER_URL,
./services/ts/smartgpt-bridge/src/store.js:    const envDir = process.env.AGENT_STATE_DIR;
./services/ts/smartgpt-bridge/tests/integration/server.exec.auth.test.js:        AUTH_ENABLED: process.env.AUTH_ENABLED,
./services/ts/smartgpt-bridge/tests/integration/server.exec.auth.test.js:        AUTH_MODE: process.env.AUTH_MODE,
./services/ts/smartgpt-bridge/tests/integration/server.exec.auth.test.js:        AUTH_TOKENS: process.env.AUTH_TOKENS,
./services/ts/smartgpt-bridge/tests/integration/server.exec.auth.test.js:        EXEC_ENABLED: process.env.EXEC_ENABLED,
./services/ts/smartgpt-bridge/tests/integration/server.exec.auth.test.js:        EXEC_SHELL: process.env.EXEC_SHELL,
./services/ts/smartgpt-bridge/tests/integration/server.exec.auth.test.js:        process.env.AUTH_ENABLED = 'true';
./services/ts/smartgpt-bridge/tests/integration/server.exec.auth.test.js:        process.env.AUTH_MODE = 'static';
./services/ts/smartgpt-bridge/tests/integration/server.exec.auth.test.js:        process.env.AUTH_TOKENS = 'secret-token';
./services/ts/smartgpt-bridge/tests/integration/server.exec.auth.test.js:        process.env.EXEC_ENABLED = 'true';
./services/ts/smartgpt-bridge/tests/integration/server.exec.auth.test.js:        process.env.EXEC_SHELL = 'true';
./services/ts/smartgpt-bridge/tests/integration/server.exec.auth.test.js:        process.env.AUTH_ENABLED = prev.AUTH_ENABLED;
./services/ts/smartgpt-bridge/tests/integration/server.exec.auth.test.js:        process.env.AUTH_MODE = prev.AUTH_MODE;
./services/ts/smartgpt-bridge/tests/integration/server.exec.auth.test.js:        process.env.AUTH_TOKENS = prev.AUTH_TOKENS;
./services/ts/smartgpt-bridge/tests/integration/server.exec.auth.test.js:        process.env.EXEC_ENABLED = prev.EXEC_ENABLED;
./services/ts/smartgpt-bridge/tests/integration/server.exec.auth.test.js:        process.env.EXEC_SHELL = prev.EXEC_SHELL;
./services/ts/smartgpt-bridge/src/cli-symbols.js:const ROOT_PATH = process.env.ROOT_PATH;
./services/ts/auth-service/src/keys.ts:    const v = process.env[name];
./services/ts/auth-service/src/keys.ts:        (process.env.AUTH_TOKEN_TTL_SECONDS ? Number(process.env.AUTH_TOKEN_TTL_SECONDS) : 3600);
./services/ts/smartgpt-bridge/src/cli-reindex.js:const ROOT_PATH = process.env.ROOT_PATH;
./services/ts/smartgpt-bridge/src/cli-reindex.js:const limit = Number(process.env.LIMIT || 0);
./shared/ts/src/tests/fixtures/cephalon.after.ts:            port: Number(process.env.PROXY_PORT) || 8080,
./services/ts/auth-service/src/index.ts:    const raw = process.env.AUTH_STATIC_CLIENTS;
./services/ts/auth-service/src/index.ts:const PORT = Number(process.env.PORT || 8088);
./services/ts/auth-service/src/index.ts:const ISSUER = process.env.AUTH_ISSUER || `http://localhost:${PORT}`;
./services/ts/auth-service/src/index.ts:const DEFAULT_SCOPES = (process.env.AUTH_DEFAULT_SCOPES || '').split(/\s+/).filter(Boolean);
./services/ts/auth-service/src/index.ts:        const aud = body.aud || client.aud || process.env.AUTH_AUDIENCE;
./services/ts/auth-service/src/index.ts:        const ttl = process.env.AUTH_TOKEN_TTL_SECONDS
./services/ts/auth-service/src/index.ts:            ? Number(process.env.AUTH_TOKEN_TTL_SECONDS)
./services/ts/auth-service/src/index.ts:if (process.env.NODE_ENV !== 'test') {
./services/ts/smartgpt-bridge/src/exec.js:const REPO_ROOT = process.env.REPO_ROOT;
./services/ts/smartgpt-bridge/src/exec.js:    const useShell = /^true$/i.test(process.env.EXEC_SHELL || 'false');
./services/ts/smartgpt-bridge/src/exec.js:        const base = repoRoot || process.env.REPO_ROOT || process.cwd();
./services/ts/codex-context/src/index.ts:    const rawBridgeUrl = process.env.SMARTGPT_URL || 'http://127.0.0.1:3210';
./services/ts/codex-context/src/index.ts:    const SMARTGPT_TOKEN = process.env.SMARTGPT_TOKEN || process.env.SMARTGPT_BEARER;
./services/ts/codex-context/src/index.ts:    const MODEL = deps.backendModel || process.env.LLM_MODEL || 'gemma3:latest';
./services/ts/codex-context/src/index.ts:    const DRIVER = (process.env.BACKEND_DRIVER || 'ollama').toLowerCase();
./services/ts/codex-context/src/index.ts:                  process.env.OLLAMA_OPENAI_BASE,
./services/ts/codex-context/src/index.ts:                  process.env.OPENAI_API_KEY,
./services/ts/codex-context/src/index.ts:            maxContextTokens: Number(process.env.MAX_CONTEXT_TOKENS || 1024),
./services/ts/codex-context/src/index.ts:    const port = Number(process.env.PORT || 8140);
./services/ts/codex-context/src/index.ts:if (process.env.NODE_ENV !== 'test') {
./services/ts/codex-context/docs/codex-context/requests/2025.08.21.18.25.45.md:      const client = new MongoClient(process.env.MONGO_URL);
./services/ts/smartgpt-bridge/tests/integration/server.openapi.auth.test.js:        AUTH_ENABLED: process.env.AUTH_ENABLED,
./services/ts/smartgpt-bridge/tests/integration/server.openapi.auth.test.js:        AUTH_MODE: process.env.AUTH_MODE,
./services/ts/smartgpt-bridge/tests/integration/server.openapi.auth.test.js:        OPENAPI_PUBLIC: process.env.OPENAPI_PUBLIC,
./services/ts/smartgpt-bridge/tests/integration/server.openapi.auth.test.js:    process.env.AUTH_ENABLED = 'true';
./services/ts/smartgpt-bridge/tests/integration/server.openapi.auth.test.js:    process.env.AUTH_MODE = 'static';
./services/ts/smartgpt-bridge/tests/integration/server.openapi.auth.test.js:    process.env.OPENAPI_PUBLIC = 'true';
./services/ts/smartgpt-bridge/tests/integration/server.openapi.auth.test.js:        process.env.AUTH_ENABLED = prev.AUTH_ENABLED;
./services/ts/smartgpt-bridge/tests/integration/server.openapi.auth.test.js:        process.env.AUTH_MODE = prev.AUTH_MODE;
./services/ts/smartgpt-bridge/tests/integration/server.openapi.auth.test.js:        process.env.OPENAPI_PUBLIC = prev.OPENAPI_PUBLIC;
./services/ts/smartgpt-bridge/tests/integration/server.openapi.auth.test.js:        AUTH_ENABLED: process.env.AUTH_ENABLED,
./services/ts/smartgpt-bridge/tests/integration/server.openapi.auth.test.js:        AUTH_MODE: process.env.AUTH_MODE,
./services/ts/smartgpt-bridge/tests/integration/server.openapi.auth.test.js:    process.env.AUTH_ENABLED = 'true';
./services/ts/smartgpt-bridge/tests/integration/server.openapi.auth.test.js:    process.env.AUTH_MODE = 'static';
./services/ts/smartgpt-bridge/tests/integration/server.openapi.auth.test.js:        process.env.AUTH_ENABLED = prev.AUTH_ENABLED;
./services/ts/smartgpt-bridge/tests/integration/server.openapi.auth.test.js:        process.env.AUTH_MODE = prev.AUTH_MODE;
./services/ts/smartgpt-bridge/src/indexer.js:    const env = splitCSV(process.env.EXCLUDE_GLOBS);
./services/ts/smartgpt-bridge/src/indexer.js:    const driver = process.env.EMBEDDING_DRIVER || 'ollama';
./services/ts/smartgpt-bridge/src/indexer.js:    const fn = process.env.EMBEDDING_FUNCTION || 'nomic-embed-text';
./services/ts/smartgpt-bridge/src/indexer.js:    const key = `${driver}::${fn}::${process.env.BROKER_URL || ''}`;
./services/ts/smartgpt-bridge/src/indexer.js:        driver: process.env.EMBEDDING_DRIVER || 'ollama',
./services/ts/smartgpt-bridge/src/indexer.js:        fn: process.env.EMBEDDING_FUNCTION || 'nomic-embed-text',
./services/ts/smartgpt-bridge/src/indexer.js:    const family = process.env.COLLECTION_FAMILY || 'repo_files';
./services/ts/smartgpt-bridge/src/indexer.js:    const version = process.env.EMBED_VERSION || 'dev';
./services/ts/smartgpt-bridge/src/indexer.js:        driver: process.env.EMBEDDING_DRIVER || 'ollama',
./services/ts/smartgpt-bridge/src/indexer.js:        fn: process.env.EMBEDDING_FUNCTION || 'nomic-embed-text',
./services/ts/smartgpt-bridge/src/indexer.js:        dims: Number(process.env.EMBED_DIMS || 768),
./services/ts/smartgpt-bridge/src/indexer.js:    const family = process.env.COLLECTION_FAMILY || 'repo_files';
./services/ts/smartgpt-bridge/src/indexer.js:    const version = process.env.EMBED_VERSION || 'dev';
./services/ts/smartgpt-bridge/src/indexer.js:        driver: process.env.EMBEDDING_DRIVER || 'ollama',
./services/ts/smartgpt-bridge/src/indexer.js:        fn: process.env.EMBEDDING_FUNCTION || 'nomic-embed-text',
./services/ts/smartgpt-bridge/src/indexer.js:        const delayMs = Number(process.env.INDEXER_FILE_DELAY_MS || 250);
./services/ts/smartgpt-bridge/src/indexer.js:    const family = process.env.COLLECTION_FAMILY || 'repo_files';
./services/ts/smartgpt-bridge/src/indexer.js:    const version = process.env.EMBED_VERSION || 'dev';
./services/ts/smartgpt-bridge/src/indexer.js:        driver: process.env.EMBEDDING_DRIVER || 'ollama',
./services/ts/smartgpt-bridge/src/indexer.js:        fn: process.env.EMBEDDING_FUNCTION || 'nomic-embed-text',
./services/ts/smartgpt-bridge/src/indexer.js:        dims: Number(process.env.EMBED_DIMS || 768),
./services/ts/smartgpt-bridge/src/indexer.js:    const family = process.env.COLLECTION_FAMILY || 'repo_files';
./services/ts/smartgpt-bridge/src/indexer.js:    const version = process.env.EMBED_VERSION || 'dev';
./services/ts/smartgpt-bridge/src/indexer.js:        driver: process.env.EMBEDDING_DRIVER || 'ollama',
./services/ts/smartgpt-bridge/src/indexer.js:        fn: process.env.EMBEDDING_FUNCTION || 'nomic-embed-text',
./services/ts/auth-service/ecosystem.config.js:if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
./services/ts/auth-service/ecosystem.config.js:            PORT: process.env.PORT || 8088,
./services/ts/auth-service/ecosystem.config.js:            AUTH_ISSUER: process.env.AUTH_ISSUER || 'http://localhost:8088',
./services/ts/smartgpt-bridge/src/fastifyAuth.js:    const enabled = String(process.env.AUTH_ENABLED || 'false').toLowerCase() === 'true';
./services/ts/smartgpt-bridge/src/fastifyAuth.js:    const mode = (process.env.AUTH_MODE || 'static').toLowerCase();
./services/ts/smartgpt-bridge/src/fastifyAuth.js:    const cookieName = process.env.AUTH_COOKIE || 'smartgpt_auth';
./services/ts/smartgpt-bridge/src/fastifyAuth.js:    const staticTokens = String(process.env.AUTH_TOKENS || process.env.AUTH_TOKEN || '')
./services/ts/smartgpt-bridge/src/fastifyAuth.js:    const jwtSecret = process.env.AUTH_JWT_SECRET;
./services/ts/smartgpt-bridge/src/fastifyAuth.js:    const jwtIssuer = process.env.AUTH_JWT_ISSUER;
./services/ts/smartgpt-bridge/src/fastifyAuth.js:    const jwtAudience = process.env.AUTH_JWT_AUDIENCE;
./services/ts/smartgpt-bridge/src/fastifyAuth.js:    const jwksUrlEnv = process.env.AUTH_JWKS_URL;
./services/ts/smartgpt-bridge/src/fastifyAuth.js:    const OPENAPI_PUBLIC = /^true$/i.test(process.env.OPENAPI_PUBLIC || 'false');
./services/ts/smartgpt-bridge/src/rg.js:    const env = splitCSV(process.env.EXCLUDE_GLOBS);
./services/ts/smartgpt-bridge/src/mongo.js:    const isTest = String(process.env.NODE_ENV || '').toLowerCase() === 'test';
./services/ts/smartgpt-bridge/src/mongo.js:    const wantsMemory = !process.env.MONGODB_URI || process.env.MONGODB_URI === 'memory';
./services/ts/smartgpt-bridge/src/mongo.js:    let uri = process.env.MONGODB_URI;
./services/ts/smartgpt-bridge/src/mongo.js:        process.env.MONGODB_URI = uri;
./services/ts/smartgpt-bridge/src/agentSupervisor.js:                ...process.env,
./services/ts/codex-context/src/backend.ts:        this.baseUrl = baseUrl || process.env.OLLAMA_OPENAI_BASE || 'http://127.0.0.1:11434/v1';
./services/ts/codex-context/src/backend.ts:        this.apiKey = apiKey || process.env.OPENAI_API_KEY || 'ollama';
./services/ts/smartgpt-bridge/src/agent.js:const ROOT_PATH = process.env.ROOT_PATH || process.cwd();
./services/ts/smartgpt-bridge/src/agent.js:const CODEX_BIN = process.env.CODEX_BIN || 'codex';
./services/ts/smartgpt-bridge/src/agent.js:const MAX_LOG_BYTES = Number(process.env.AGENT_MAX_LOG_BYTES || 512 * 1024);
./services/ts/smartgpt-bridge/src/agent.js:const USE_SHELL = /^true$/i.test(process.env.AGENT_SHELL || 'false');
./services/ts/smartgpt-bridge/src/agent.js:        const root = process.env.ROOT_PATH || ROOT_PATH;
./services/ts/smartgpt-bridge/src/agent.js:        const wantTty = tty || /^true$/i.test(process.env.AGENT_TTY || 'false');
./services/ts/smartgpt-bridge/src/agent.js:                env: { ...process.env, CI: '1', GIT_TERMINAL_PROMPT: '0', ...env },
./services/ts/smartgpt-bridge/src/agent.js:                env: { ...process.env, CI: '1', GIT_TERMINAL_PROMPT: '0', ...env },
./services/ts/smartgpt-bridge/src/agent.js:    if (process.env.NODE_PTY_DISABLED === '1') {
./services/ts/smartgpt-bridge/src/agent.js:        const root = process.env.ROOT_PATH || ROOT_PATH;
./services/ts/smartgpt-bridge/src/agent.js:            env: { ...process.env, CI: '1', GIT_TERMINAL_PROMPT: '0', ...env },
./services/ts/smartgpt-bridge/src/agent.js:    const allow = String(process.env.AGENT_RESTORE_ON_START || 'true') !== 'false';
./services/ts/smartgpt-bridge/src/agent.js:            Number(process.env.AGENT_RESTORE_TAIL || 65536),
./services/ts/smartgpt-bridge/src/agent.js:            cwd: meta.cwd || process.env.ROOT_PATH || process.cwd(),
./services/ts/smartgpt-bridge/src/lib/pty.js:    if (process.env.NODE_PTY_DISABLED === '1') return null;
./services/ts/smartgpt-bridge/src/routes/v1/files.js:        const ROOT_PATH = process.env.ROOT_PATH || process.cwd();
./services/ts/smartgpt-bridge/src/routes/v1/files.js:            const ROOT_PATH = process.env.ROOT_PATH || process.cwd();
./services/ts/smartgpt-bridge/src/routes/v0/index.js:    const enabled = String(process.env.AUTH_ENABLED || 'false').toLowerCase() === 'true';
./services/ts/smartgpt-bridge/src/routes/v0/index.js:    const mode = (process.env.AUTH_MODE || 'static').toLowerCase(); // 'static' | 'jwt'
./services/ts/smartgpt-bridge/src/routes/v0/index.js:    const cookieName = process.env.AUTH_COOKIE || 'smartgpt_auth';
./services/ts/smartgpt-bridge/src/routes/v0/index.js:    const staticTokens = String(process.env.AUTH_TOKENS || process.env.AUTH_TOKEN || '')
./services/ts/smartgpt-bridge/src/routes/v0/index.js:    const jwtSecret = process.env.AUTH_JWT_SECRET;
./services/ts/smartgpt-bridge/src/routes/v0/index.js:    const jwtIssuer = process.env.AUTH_JWT_ISSUER;
./services/ts/smartgpt-bridge/src/routes/v0/index.js:    const jwtAudience = process.env.AUTH_JWT_AUDIENCE;
./services/ts/smartgpt-bridge/src/routes/v0/index.js:    const jwksUrlEnv = process.env.AUTH_JWKS_URL;
./shared/ts/src/persistence/dualStore.ts:                  driver: process.env.EMBEDDING_DRIVER || 'ollama',
./shared/ts/src/persistence/dualStore.ts:                  fn: process.env.EMBEDDING_FUNCTION || 'nomic-embed-text',
./services/ts/smartgpt-bridge/src/routes/v1/index.js:            process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3210}`;
./services/ts/smartgpt-bridge/src/routes/v1/index.js:        const authEnabled = String(process.env.AUTH_ENABLED || 'false').toLowerCase() === 'true';
./services/ts/smartgpt-bridge/src/routes/v0/exec.js:                    String(process.env.EXEC_ENABLED || 'false').toLowerCase() === 'true';
./shared/ts/src/persistence/clients.ts:const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
./shared/ts/src/persistence/clients.ts:const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';
./services/ts/codex-orchestrator/src/ollama.ts:    const host = process.env.OLLAMA_HOST || 'http://localhost:11434';
./services/ts/smartgpt-bridge/src/routes/v1/exec.js:                    String(process.env.EXEC_ENABLED || 'false').toLowerCase() === 'true';
./docs/unique/2025.08.08.19.08.49.md:  const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/prom";
./docs/unique/2025.08.08.19.08.49.md:  const jwksUrl = process.env.JWT_JWKS_URL; // or JWT_SECRET
./docs/unique/2025.08.08.19.08.49.md:  startWSGateway(bus, Number(process.env.WS_PORT ?? 8090), {
./docs/unique/2025.08.08.19.08.49.md:          secret: process.env.JWT_SECRET,
./docs/unique/2025.08.08.19.08.49.md:          audience: process.env.JWT_AUD,
./docs/unique/2025.08.08.19.08.49.md:          issuer: process.env.JWT_ISS
./docs/unique/2025.08.08.19.08.49.md:  startOpsDashboard(db, { port: Number(process.env.OPS_PORT ?? 8082) });
./services/ts/codex-orchestrator/src/index.ts:const plannerModel = process.env.PLANNER_MODEL || 'promethean-planner';
./services/ts/codex-orchestrator/src/index.ts:const REPO_ROOT = process.env.REPO_ROOT || process.cwd();
./services/ts/codex-context/src/tests/tool-calls.integration.test.ts:            model: process.env.LLM_MODEL || 'llama3.1',
./services/ts/codex-orchestrator/src/tools.ts:    const cmd = (process.env.TEST_CMD || 'pnpm -w test').split(' ');
./services/ts/codex-orchestrator/src/tools.ts:    const flag = process.env.TEST_PATTERN_FLAG || '-m'; // AVA match flag
./services/ts/reasoner/src/index.ts:    const port = Number(process.env.PORT) || 3000;
./services/ts/reasoner/ecosystem.config.js:if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
./services/ts/reasoner/ecosystem.config.js:const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM ? [...apps, ...(deps?.apps || [])] : apps;
./services/ts/codex-context/src/prompt.ts:    const maxCtx = opts?.maxContextTokens ?? Number(process.env.MAX_CONTEXT_TOKENS || 1024);
./services/ts/voice/src/voice-synth.ts:            port: Number(process.env.PROXY_PORT) || 8080,
./services/ts/codex-context/src/logger.ts:    const raw = (process.env.CC_LOG_LEVEL || process.env.LOG_LEVEL || 'info').toLowerCase();
./services/ts/voice/src/index.ts:export function createVoiceService(token: string = process.env.DISCORD_TOKEN || '') {
./services/ts/voice/src/index.ts:    async function start(port: number = parseInt(process.env.PORT || '4000')) {
./services/ts/voice/src/index.ts:if (process.env.NODE_ENV !== 'test') {
./services/ts/voice/src/transcriber.ts:            port: Number(process.env.PROXY_PORT) || 8080,
./docs/chats/2025-08-03_03-57-36_ChatGPT_Promethean - Voice logic split analysis....md.bak:if (process.env.LEGACY_VOICE === 'true') {
./docs/unique/2025.08.24.18.37.05.md:        model: process.env.LLM_MODEL || "llama3.1:latest", // ensure a model that supports tool use
./docs/chats/2025-08-03_03-57-36_ChatGPT_Promethean - Voice logic split analysis....md:if (process.env.LEGACY_VOICE === 'true') {
./docs/chats/2025-08-03_03-07-18_ChatGPT_Promethean - Eidolon Layer 1 Design....md.bak:const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
./docs/chats/2025-08-03_03-07-18_ChatGPT_Promethean - Eidolon Layer 1 Design....md.bak:const dbName = process.env.DB_NAME || "eidolon_sim";
./docs/chats/2025-08-03_03-07-18_ChatGPT_Promethean - Eidolon Layer 1 Design....md:const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
./docs/chats/2025-08-03_03-07-18_ChatGPT_Promethean - Eidolon Layer 1 Design....md:const dbName = process.env.DB_NAME || "eidolon_sim";
./services/ts/voice/ecosystem.config.js:if (!process.env.PROMETHEAN_ROOT_ECOSYSTEM) {
./services/ts/voice/ecosystem.config.js:const allApps = !process.env.PROMETHEAN_ROOT_ECOSYSTEM ? [...apps, ...(deps?.apps || [])] : apps;
./docs/unique/2025.08.08.15.08.47.md:  startWSGateway(bus, Number(process.env.WS_PORT ?? 8090), {
./docs/unique/2025.08.08.15.08.47.md:    auth: async (token) => token === process.env.WS_TOKEN ? { ok: true } : { ok: false, code: "bad_token", msg: "nope" }
./docs/unique/2025.08.08.15.08.47.md:  startHttpPublisher(bus, Number(process.env.HTTP_PORT ?? 8081));
./docs/unique/2025.08.20.18.08.00.md:  const envHome = process.env.PROM_HOME;
./docs/unique/2025.08.20.18.08.00.md:  const user = path.join(process.env.HOME || "", ".promethean", "config.toml");
./docs/unique/2025.08.20.18.08.00.md:const HOME = () => process.env.PROM_HOME ?? path.join(process.env.HOME || "", ".promethean");
./docs/unique/2025.08.20.18.08.00.md:  const key = p.env_key ? process.env[p.env_key] : process.env.OPENAI_API_KEY;
./docs/unique/2025.08.08.20.08.52.md:const ROOT = process.env.REPO_ROOT || process.cwd();
./docs/unique/2025.08.08.20.08.52.md:  const client = await MongoClient.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/prom");
./docs/unique/2025.08.08.19.08.25.md:  const n = Number(process.env.N ?? 100_000);
./docs/unique/2025.08.08.19.08.25.md:  const topic = process.env.TOPIC ?? "bench.topic";
./docs/unique/2025.08.08.19.08.25.md:  const n = Number(process.env.N ?? 100_000);
./docs/unique/2025.08.08.19.08.25.md:  const topic = process.env.TOPIC ?? "bench.topic";
./docs/unique/2025.08.24.09.41.40.md:    const MONGO_CONNECTION_STRING = process.env.MONGODB_URI || `mongodb://localhost`;
./docs/unique/2025.08.24.09.41.40.md:    const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
./docs/unique/2025.08.24.09.41.40.md:    const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
./docs/unique/202508071111.md:  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
./docs/unique/2025.08.08.15.08.23.md:const wss = new WebSocketServer({ port: process.env.BUS_PORT ? Number(process.env.BUS_PORT) : 7070 });
./docs/unique/2025.08.08.15.08.23.md:const mongo = new MongoClient(process.env.MONGO_URL!);
./docs/unique/2025.08.08.15.08.23.md:  constructor(url = process.env.BUS_URL || 'ws://127.0.0.1:7070') { this.url = url; this.connect(); }
./docs/unique/2025.08.08.15.08.23.md:  bus.publish('heartbeat.received', { pid: process.pid, name: process.env.name, ts: Date.now() }, `proc:${process.pid}`);
./docs/unique/2025.08.08.20.08.56.md:  const client = await MongoClient.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/prom");
./ecosystem.config.js:process.env.PROMETHEAN_ROOT_ECOSYSTEM = '1';
./shared/js/server/index.js:      env: { ...process.env, PIPENV_NOSPIN: "1" }
./packages/mcp-stdio-wrapper/src/stdio.ts:const url = process.env.MCP_SERVER_URL || 'ws://localhost:4410/mcp';
./packages/mcp-stdio-wrapper/src/stdio.ts:const token = process.env.MCP_TOKEN;
./packages/mcp-server/scripts/mcp-call.ts:const url = process.env.MCP_SERVER_URL || 'ws://localhost:4410/mcp';
./packages/mcp-server/scripts/mcp-call.ts:const token = process.env.MCP_TOKEN;
./shared/js/env.js:export const AGENT_NAME = process.env.AGENT_NAME || "duck";
./shared/js/env.js:  process.env.DESKTOP_CAPTURE_CHANNEL_ID;
./packages/mcp-stdio-wrapper/test/stdio.spec.ts:        env: { ...process.env, MCP_SERVER_URL: `ws://localhost:${port}` },
./packages/mcp-server/src/bridge.ts:    const target = url || process.env.SMARTGPT_BRIDGE_URL || 'ws://localhost:8091';
./packages/mcp-server/src/router.ts:    const send = createSender(ws, Number(process.env.MCP_MAX_BUFFER || 1 << 20));
./packages/mcp-server/src/index.ts:    const port = opts.port ?? Number(process.env.MCP_SERVER_PORT || 4410);
./packages/mcp-server/src/index.ts:    if (process.env.MCP_TLS_CERT && process.env.MCP_TLS_KEY) {
./packages/mcp-server/src/index.ts:            cert: readFileSync(process.env.MCP_TLS_CERT),
./packages/mcp-server/src/index.ts:            key: readFileSync(process.env.MCP_TLS_KEY),
./shared/js/heartbeat/index.js:const BROKER_PORT = process.env.BROKER_PORT || 7000;
./shared/js/heartbeat/index.js:        name = process.env.name,
./shared/js/heartbeat/index.js:        maxMisses = Number(process.env.HEARTBEAT_MAX_MISSES || 5),
./shared/js/heartbeat/index.js:        fatalOnMiss = String(process.env.HEARTBEAT_FATAL_ON_MISS || 'true').toLowerCase() ===
./packages/mcp-server/test/contract.spec.ts:    process.env.SMARTGPT_BRIDGE_URL = `ws://localhost:${bridge.port}`;
./packages/mcp-server/test/integration.spec.ts:    process.env.SMARTGPT_BRIDGE_URL = `ws://localhost:${bridge.port}`;
./packages/mcp-server/test/integration.spec.ts:    process.env.SMARTGPT_BRIDGE_URL = `ws://localhost:${bridge.port}`;
./packages/mcp-server/src/auth.ts:    const expectedToken = process.env.MCP_TOKEN;
./packages/mcp-server/src/auth.ts:    const allowlist = process.env.MCP_ORIGIN_ALLOWLIST?.split(',').filter(Boolean) ?? [];
./shared/sibilant/src/lang/repl.sibilant:     HISTORY-FILE (pipe process.env.SIBILANT-REPL-HISTORY-FILE
./shared/sibilant/src/lang/repl.sibilant:                      (or (""process.env.HOME"/.sibilant.history")))
./shared/sibilant/src/lang/sibilant.sibilant:(unless process.env.DISABLE_SOURCE_MAPS
./services/py/llm/main.py:    driver_name = os.environ.get("LLM_DRIVER") or cfg.get("driver", "ollama")
./services/py/llm/main.py:    model_name = os.environ.get("LLM_MODEL") or cfg.get("model", "gemma3:latest")
