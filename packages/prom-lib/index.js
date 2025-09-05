export function makePolicy() {
  return async () => {};
}

export function fileBackedRegistry() {
  return {
    async get(_provider, tenant) {
      const envKey = `DISCORD_TOKEN_${tenant.toUpperCase()}`;
      return { credentials: { bot_token: process.env[envKey] ?? "" } };
    },
    async list() {
      return [];
    }
  };
}
