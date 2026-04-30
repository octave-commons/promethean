// PM2 ecosystem config for Cephalon Hive
//
// Each cephalon runs the TypeScript CLI with CEPHALON_NAME env var
// to select which Discord token and persona to use.

const cephalonName = process.env.CEPHALON_NAME || 'DUCK';
const memoryUiPort = process.env.MEMORY_UI_PORT || '3000';

module.exports = {
  apps: [
    {
      name: `${cephalonName.toLowerCase()}-cephalon`,
      script: 'dist/cli.cjs',
      cwd: '/app',
      env: {
        NODE_ENV: 'production',
        CEPHALON_NAME: cephalonName,
        MEMORY_UI_PORT: memoryUiPort,

        // Runtime limits
        CEPHALON_MAX_TOKENS: process.env.CEPHALON_MAX_TOKENS || '16384',
        CEPHALON_MAX_CONTEXT_TOKENS: process.env.CEPHALON_MAX_CONTEXT_TOKENS || '262144',
        CEPHALON_CONTEXT_RECENT_LIMIT: process.env.CEPHALON_CONTEXT_RECENT_LIMIT || '500',
        CEPHALON_SESSION_CONCURRENCY: process.env.CEPHALON_SESSION_CONCURRENCY || '2',
        CEPHALON_SESSION_QUEUE_MAX_PER_SESSION: process.env.CEPHALON_SESSION_QUEUE_MAX_PER_SESSION || '2000',
        CEPHALON_OLLAMA_QUEUE_MAX_PARALLEL: process.env.CEPHALON_OLLAMA_QUEUE_MAX_PARALLEL || '2',
        CEPHALON_OLLAMA_QUEUE_MAX_BACKLOG: process.env.CEPHALON_OLLAMA_QUEUE_MAX_BACKLOG || '8192',
        CEPHALON_STARTUP_TICK_JITTER_MS: process.env.CEPHALON_STARTUP_TICK_JITTER_MS || '30000',
        CEPHALON_EMBEDDING_CONTEXT_SIZE: process.env.CEPHALON_EMBEDDING_CONTEXT_SIZE || '8192',

        // Persona growth (self.growth)
        CEPHALON_GROWTH_MAX_PERSONAS_PER_DAY: process.env.CEPHALON_GROWTH_MAX_PERSONAS_PER_DAY || '6',
        CEPHALON_GROWTH_MIN_INTERVAL_MINUTES: process.env.CEPHALON_GROWTH_MIN_INTERVAL_MINUTES || '20',
        CEPHALON_GROWTH_MAX_PERSONAS_TOTAL: process.env.CEPHALON_GROWTH_MAX_PERSONAS_TOTAL || '512',
        CEPHALON_GROWTH_MAX_PROMPT_CHARS: process.env.CEPHALON_GROWTH_MAX_PROMPT_CHARS || '7000',

        // Tenor GIF cadence (fun, not spam)
        CEPHALON_TENOR_COOLDOWN_SECONDS: process.env.CEPHALON_TENOR_COOLDOWN_SECONDS || '300',
        CEPHALON_TENOR_REQUIRE_RECENT_HUMAN_SECONDS: process.env.CEPHALON_TENOR_REQUIRE_RECENT_HUMAN_SECONDS || '900',
        CEPHALON_TENOR_TIMEOUT_MS: process.env.CEPHALON_TENOR_TIMEOUT_MS || '12000',
        CEPHALON_TENOR_CHANNEL_NAME_ALLOW_REGEX: process.env.CEPHALON_TENOR_CHANNEL_NAME_ALLOW_REGEX || '',

        // Discord token (resolved by CEPHALON_NAME)
        DUCK_DISCORD_TOKEN: process.env.DUCK_DISCORD_TOKEN || '',
        OPENHAX_DISCORD_TOKEN: process.env.OPENHAX_DISCORD_TOKEN || '',
        OPENSKULL_DISCORD_TOKEN: process.env.OPENSKULL_DISCORD_TOKEN || '',

        // MongoDB
        CEPHALON_MONGODB_URI: process.env.CEPHALON_MONGODB_URI || 'mongodb://mongodb:27017',
        CEPHALON_MONGODB_DB: process.env.CEPHALON_MONGODB_DB || 'cephalon_hive',
        CEPHALON_MONGODB_COLLECTION: process.env.CEPHALON_MONGODB_COLLECTION || 'cephalon_memories',
      },
      autorestart: true,
      watch: false,
      time: true,
      kill_timeout: 5000,
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
