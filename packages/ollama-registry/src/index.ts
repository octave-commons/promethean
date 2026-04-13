interface OllamaHost {
  ip: string;
  port: number;
  hostname?: string;
  gpu_info?: string;
}

interface PaginatedResponse {
  items: OllamaHost[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

interface Config {
  ourGpusUrl: string;
  ourGpusApiKey: string;
  proxxUrl: string;
  proxxApiKey: string;
  proxxTargets: { url: string; apiKey: string }[];
  pollIntervalMs: number;
}

const DEFAULT_CONFIG: Partial<Config> = {
  pollIntervalMs: 30000,
};

async function fetchWithRetry(
  url: string,
  options: RequestInit & { retries?: number; retryDelay?: number } = {}
): Promise<Response> {
  const { retries = 3, retryDelay = 1000, ...fetchOptions } = options;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, fetchOptions);
      if (res.ok || attempt === retries - 1) {
        return res;
      }
    } catch (error) {
      if (attempt === retries - 1) {
        throw error;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, retryDelay));
  }
  throw new Error("Fetch failed after retries");
}

async function validateOllamaHost(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return false;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) return false;
    const data = await res.json() as Record<string, unknown>;
    if (!Array.isArray(data.models) || data.models.length === 0) return false;
    const first = data.models[0];
    if (typeof first !== "object" || first === null) return false;
    return typeof (first as Record<string, unknown>)["name"] === "string";
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`  validation failed for ${baseUrl}: ${msg}`);
    return false;
  }
}

export async function registerOllamaHost(config: Config, host: OllamaHost): Promise<void> {
  const baseUrl = `http://${host.ip}:${host.port}`;
  const providerId = `ollama-${host.ip.replace(/\./g, "-")}`;

  console.log(`Registering Ollama at ${baseUrl} as ${providerId}`);

  const reqBody = JSON.stringify({
    providerId,
    authType: "api_key",
    baseUrl,
    apiKey: "ollama-no-auth",
    accountId: providerId,
  });

  for (const target of config.proxxTargets) {
    try {
      const url = `${target.url}/api/v1/credentials/provider`;
      console.log(`POST ${url}`);

      const providerRes = await fetchWithRetry(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${target.apiKey}`,
        },
        body: reqBody,
        retries: 3,
        retryDelay: 1000,
      });

      const providerText = await providerRes.text();
      console.log(`  Provider response: ${providerText}`);
      if (!providerRes.ok) {
        console.error(`Failed to register provider: ${providerRes.status} ${providerText}`);
      } else {
        console.log(`Successfully registered ${providerId} -> ${baseUrl}`);
      }
    } catch (error) {
      console.error(`Error registering ${providerId} with ${target.url}:`, error);
    }
  }
}

export async function syncHosts(config: Config): Promise<void> {
  console.log("Polling our-gpus for Ollama hosts...");

  const res = await fetchWithRetry(`${config.ourGpusUrl}/api/hosts`, {
    headers: {
      "X-Api-Key": config.ourGpusApiKey,
    },
    retries: 3,
    retryDelay: 1000,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Failed to fetch hosts: ${res.status} ${err}`);
    return;
  }

  const response = (await res.json()) as PaginatedResponse;
  const hosts = response.items;
  const ollamaHosts = hosts.filter((h) => h.port === 11434);

  console.log(`Found ${ollamaHosts.length} Ollama hosts`);

  for (const host of ollamaHosts) {
    const baseUrl = `http://${host.ip}:${host.port}`;
    const isValid = await validateOllamaHost(baseUrl);
    if (!isValid) {
      console.log(`SKIP ${baseUrl} — not a real Ollama server`);
      continue;
    }
    await registerOllamaHost(config, host);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export async function startRegistry(fullConfig: Config): Promise<void> {
  const config = { ...DEFAULT_CONFIG, ...fullConfig };

  console.log("Starting Ollama Registry");
  console.log(`  our-gpus: ${config.ourGpusUrl}`);
  console.log(`  proxx: ${config.proxxUrl}`);
  console.log(`  poll interval: ${config.pollIntervalMs}ms`);

  await syncHosts(config);

  setInterval(() => syncHosts(config), config.pollIntervalMs);
}

const isMain = process.argv[1]?.endsWith("index.ts") || process.argv[1]?.endsWith("index.js");

if (isMain) {
  const primaryUrl = process.env.PROXX_URL || "http://localhost:3000";
  const primaryApiKey = process.env.PROXX_API_KEY || "";
  const extraTargets = (process.env.PROXX_EXTRA_TARGETS || "")
    .split(",")
    .filter(Boolean)
    .map((s) => {
      const sep = s.indexOf("@");
      if (sep === -1) {
        return { url: s.trim(), apiKey: primaryApiKey };
      }
      return { url: s.slice(0, sep).trim(), apiKey: s.slice(sep + 1).trim() || primaryApiKey };
    });

  const config: Config = {
    ourGpusUrl: process.env.OUR_GPUS_URL || "http://localhost:8000",
    ourGpusApiKey: process.env.OUR_GPUS_API_KEY || "",
    proxxUrl: primaryUrl,
    proxxApiKey: primaryApiKey,
    proxxTargets: [{ url: primaryUrl, apiKey: primaryApiKey }, ...extraTargets],
    pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || "30000", 10),
  };

  startRegistry(config).catch(console.error);
}
