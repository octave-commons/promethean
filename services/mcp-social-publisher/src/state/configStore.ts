import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type GitHubOAuthConfig = {
  clientId: string;
  clientSecret: string;
  updatedAt: string;
};

export type DiscordTarget = {
  id: string;
  name: string;
  webhookUrl: string;
  username: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type BlueskyTarget = {
  id: string;
  name: string;
  identifier: string;
  appPassword: string;
  serviceUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type ConfigState = {
  githubOAuth: GitHubOAuthConfig;
  allowedGitHubUsers: string[];
  targets: {
    discord: DiscordTarget[];
    bluesky: BlueskyTarget[];
  };
  updatedAt: string;
};

export type PublicTargetSummary = {
  id: string;
  name: string;
  platform: "discord" | "bluesky";
  destination: string;
};

type ConfigStoreOptions = {
  initialGitHubUsers: string[];
};

function nowIso(): string {
  return new Date().toISOString();
}

function emptyState(initialGitHubUsers: readonly string[]): ConfigState {
  return {
    githubOAuth: {
      clientId: "",
      clientSecret: "",
      updatedAt: "",
    },
    allowedGitHubUsers: Array.from(new Set(initialGitHubUsers.map(normalizeLogin).filter(Boolean))).sort(),
    targets: {
      discord: [],
      bluesky: [],
    },
    updatedAt: nowIso(),
  };
}

export class ConfigStore {
  private state: ConfigState;
  private queue: Promise<unknown> = Promise.resolve();

  public constructor(
    private readonly filePath: string,
    private readonly options: ConfigStoreOptions,
  ) {
    this.state = emptyState(options.initialGitHubUsers);
  }

  public async init(): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      const raw = await readFile(this.filePath, "utf8");
      this.state = normalizeState(JSON.parse(raw), this.options.initialGitHubUsers);
    } catch {
      this.state = emptyState(this.options.initialGitHubUsers);
      await this.persist();
    }
  }

  public getSnapshot(): ConfigState {
    return JSON.parse(JSON.stringify(this.state)) as ConfigState;
  }

  public getPublicTargets(): PublicTargetSummary[] {
    return [
      ...this.state.targets.discord.map((target) => ({
        id: target.id,
        name: target.name,
        platform: "discord" as const,
        destination: describeDiscordTarget(target),
      })),
      ...this.state.targets.bluesky.map((target) => ({
        id: target.id,
        name: target.name,
        platform: "bluesky" as const,
        destination: `${target.identifier} via ${target.serviceUrl}`,
      })),
    ];
  }

  public hasGitHubOAuthConfig(): boolean {
    return this.state.githubOAuth.clientId.length > 0 && this.state.githubOAuth.clientSecret.length > 0;
  }

  public isAllowedGitHubUser(login: string): boolean {
    return this.state.allowedGitHubUsers.includes(normalizeLogin(login));
  }

  public getDiscordTarget(nameOrId: string): DiscordTarget | undefined {
    const needle = normalizeTargetKey(nameOrId);
    return this.state.targets.discord.find((target) => target.id === needle || normalizeTargetKey(target.name) === needle);
  }

  public getBlueskyTarget(nameOrId: string): BlueskyTarget | undefined {
    const needle = normalizeTargetKey(nameOrId);
    return this.state.targets.bluesky.find((target) => target.id === needle || normalizeTargetKey(target.name) === needle);
  }

  public async setGitHubOAuth(clientId: string, clientSecret: string): Promise<void> {
    await this.writeState(() => {
      this.state.githubOAuth = {
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim(),
        updatedAt: nowIso(),
      };
    });
  }

  public async addGitHubUser(login: string): Promise<void> {
    const normalized = normalizeLogin(login);
    if (!normalized) {
      return;
    }
    await this.writeState(() => {
      this.state.allowedGitHubUsers = Array.from(new Set([...this.state.allowedGitHubUsers, normalized])).sort();
    });
  }

  public async removeGitHubUser(login: string): Promise<void> {
    const normalized = normalizeLogin(login);
    await this.writeState(() => {
      this.state.allowedGitHubUsers = this.state.allowedGitHubUsers.filter((entry) => entry !== normalized);
    });
  }

  public async upsertDiscordTarget(input: {
    name: string;
    webhookUrl: string;
    username?: string;
    avatarUrl?: string;
  }): Promise<void> {
    const id = normalizeTargetKey(input.name);
    if (!id) {
      return;
    }
    await this.writeState(() => {
      const existing = this.getDiscordTarget(id);
      const createdAt = existing?.createdAt ?? nowIso();
      const next: DiscordTarget = {
        id,
        name: input.name.trim(),
        webhookUrl: input.webhookUrl.trim(),
        username: input.username?.trim() ?? "",
        avatarUrl: input.avatarUrl?.trim() ?? "",
        createdAt,
        updatedAt: nowIso(),
      };
      this.state.targets.discord = [
        ...this.state.targets.discord.filter((target) => target.id !== id),
        next,
      ].sort((left, right) => left.name.localeCompare(right.name));
    });
  }

  public async removeDiscordTarget(nameOrId: string): Promise<void> {
    const needle = normalizeTargetKey(nameOrId);
    await this.writeState(() => {
      this.state.targets.discord = this.state.targets.discord.filter((target) => target.id !== needle && normalizeTargetKey(target.name) !== needle);
    });
  }

  public async upsertBlueskyTarget(input: {
    name: string;
    identifier: string;
    appPassword: string;
    serviceUrl: string;
  }): Promise<void> {
    const id = normalizeTargetKey(input.name);
    if (!id) {
      return;
    }
    await this.writeState(() => {
      const existing = this.getBlueskyTarget(id);
      const createdAt = existing?.createdAt ?? nowIso();
      const next: BlueskyTarget = {
        id,
        name: input.name.trim(),
        identifier: input.identifier.trim(),
        appPassword: input.appPassword.trim(),
        serviceUrl: normalizeServiceUrl(input.serviceUrl),
        createdAt,
        updatedAt: nowIso(),
      };
      this.state.targets.bluesky = [
        ...this.state.targets.bluesky.filter((target) => target.id !== id),
        next,
      ].sort((left, right) => left.name.localeCompare(right.name));
    });
  }

  public async removeBlueskyTarget(nameOrId: string): Promise<void> {
    const needle = normalizeTargetKey(nameOrId);
    await this.writeState(() => {
      this.state.targets.bluesky = this.state.targets.bluesky.filter((target) => target.id !== needle && normalizeTargetKey(target.name) !== needle);
    });
  }

  private async writeState<T>(mutate: () => T | Promise<T>): Promise<T> {
    const task = this.queue.then(async () => {
      const result = await mutate();
      this.state.updatedAt = nowIso();
      await this.persist();
      return result;
    });
    this.queue = task.then(() => undefined, () => undefined);
    return task;
  }

  private async persist(): Promise<void> {
    const tempPath = `${this.filePath}.tmp`;
    await writeFile(tempPath, `${JSON.stringify(this.state, null, 2)}\n`, { mode: 0o600 });
    await rename(tempPath, this.filePath);
  }
}

export function normalizeLogin(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeTargetKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeServiceUrl(value: string): string {
  const trimmed = value.trim();
  const raw = trimmed.length > 0 ? trimmed : "https://bsky.social";
  const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  url.pathname = "";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

export function maskSecret(value: string): string {
  if (value.length <= 8) {
    return value.length === 0 ? "not set" : "configured";
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export function describeDiscordTarget(target: DiscordTarget): string {
  try {
    const url = new URL(target.webhookUrl);
    return `${url.hostname}${url.pathname.split("/").slice(-2).join("/")}`;
  } catch {
    return maskSecret(target.webhookUrl);
  }
}

function normalizeState(raw: unknown, initialGitHubUsers: readonly string[]): ConfigState {
  const base = emptyState(initialGitHubUsers);
  if (!raw || typeof raw !== "object") {
    return base;
  }

  const candidate = raw as Record<string, unknown>;
  const githubOAuthRaw = candidate.githubOAuth as Record<string, unknown> | undefined;
  const targetsRaw = candidate.targets as Record<string, unknown> | undefined;

  return {
    githubOAuth: {
      clientId: typeof githubOAuthRaw?.clientId === "string" ? githubOAuthRaw.clientId.trim() : "",
      clientSecret: typeof githubOAuthRaw?.clientSecret === "string" ? githubOAuthRaw.clientSecret.trim() : "", // pragma: allowlist secret
      updatedAt: typeof githubOAuthRaw?.updatedAt === "string" ? githubOAuthRaw.updatedAt : "",
    },
    allowedGitHubUsers: Array.from(new Set([
      ...initialGitHubUsers.map(normalizeLogin),
      ...(Array.isArray(candidate.allowedGitHubUsers) ? candidate.allowedGitHubUsers.map((value) => normalizeLogin(String(value))) : []),
    ].filter(Boolean))).sort(),
    targets: {
      discord: Array.isArray(targetsRaw?.discord)
        ? targetsRaw.discord.map((value) => normalizeDiscordTarget(value)).filter((value): value is DiscordTarget => value !== null)
        : [],
      bluesky: Array.isArray(targetsRaw?.bluesky)
        ? targetsRaw.bluesky.map((value) => normalizeBlueskyTarget(value)).filter((value): value is BlueskyTarget => value !== null)
        : [],
    },
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : nowIso(),
  };
}

function normalizeDiscordTarget(raw: unknown): DiscordTarget | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const candidate = raw as Record<string, unknown>;
  const name = String(candidate.name ?? "").trim();
  const webhookUrl = String(candidate.webhookUrl ?? "").trim();
  if (!name || !webhookUrl) {
    return null;
  }
  return {
    id: normalizeTargetKey(String(candidate.id ?? name)),
    name,
    webhookUrl,
    username: String(candidate.username ?? "").trim(),
    avatarUrl: String(candidate.avatarUrl ?? "").trim(),
    createdAt: String(candidate.createdAt ?? nowIso()),
    updatedAt: String(candidate.updatedAt ?? nowIso()),
  };
}

function normalizeBlueskyTarget(raw: unknown): BlueskyTarget | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const candidate = raw as Record<string, unknown>;
  const name = String(candidate.name ?? "").trim();
  const identifier = String(candidate.identifier ?? "").trim();
  const appPassword = String(candidate.appPassword ?? "").trim();
  if (!name || !identifier || !appPassword) {
    return null;
  }
  return {
    id: normalizeTargetKey(String(candidate.id ?? name)),
    name,
    identifier,
    appPassword,
    serviceUrl: normalizeServiceUrl(String(candidate.serviceUrl ?? "https://bsky.social")),
    createdAt: String(candidate.createdAt ?? nowIso()),
    updatedAt: String(candidate.updatedAt ?? nowIso()),
  };
}
