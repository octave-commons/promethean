export function fileBackedRegistry() {
  return {
    async get(_provider: string, tenant: string) {
      if (typeof tenant !== "string" || tenant.trim() === "") {
        throw new TypeError("tenant must be a non-empty string");
      }
      const envKey = `DISCORD_TOKEN_${tenant.toUpperCase()}`;
      const token = process.env[envKey];
      if (!token) {
        throw new Error(`Missing environment variable ${envKey} for tenant ${tenant}`);
      }
      return { credentials: { bot_token: token } };
    },
    async list() {
      return [];
    },
  };
}
