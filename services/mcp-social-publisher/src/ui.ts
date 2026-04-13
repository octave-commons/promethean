import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import express, { type Express, type Request, type Response } from "express";

import { SimpleOAuthProvider } from "./auth/simpleOAuthProvider.js";
import {
  ConfigStore,
  type BlueskyTarget,
  type DiscordTarget,
  describeDiscordTarget,
  maskSecret,
  normalizeLogin,
  normalizeServiceUrl,
} from "./state/configStore.js";

type UiOptions = {
  publicBaseUrl: URL;
  adminAuthKey: string;
  configStore: ConfigStore;
};

type AdminSession = {
  kind: "admin";
  exp: number;
};

const formParser = express.urlencoded({ extended: false });

export function installUi(app: Express, oauth: SimpleOAuthProvider, options: UiOptions): void {
  const cookieSecret = createHash("sha256").update(options.adminAuthKey).digest("hex");

  app.get("/auth/oauth/login", (req, res) => {
    const query = new URLSearchParams(req.query as Record<string, string>).toString();
    res.redirect(307, `/authorize${query ? `?${query}` : ""}`);
  });

  app.get("/auth/oauth/callback", (req, res) => {
    const query = new URLSearchParams(req.query as Record<string, string>).toString();
    res.redirect(307, `/oauth/callback/github${query ? `?${query}` : ""}`);
  });

  app.get("/login", (req: Request, res: Response) => {
    const rid = String(req.query.rid || "");
    const pending = oauth.getPending(rid);
    if (!pending) {
      res.status(400).send("Unknown rid");
      return;
    }
    if (pending.subject) {
      res.redirect(`/consent?rid=${encodeURIComponent(rid)}`);
      return;
    }
    res.status(200).type("html").send(renderPublicLoginPage({
      rid,
      publicBaseUrl: options.publicBaseUrl,
      githubConfigured: options.configStore.hasGitHubOAuthConfig(),
      allowlistCount: options.configStore.getSnapshot().allowedGitHubUsers.length,
      error: String(req.query.error || ""),
    }));
  });

  app.get("/login/github", (req: Request, res: Response) => {
    const rid = String(req.query.rid || "");
    if (!rid || !oauth.getPending(rid)) {
      res.status(400).send("Missing rid");
      return;
    }

    const config = options.configStore.getSnapshot().githubOAuth;
    if (!config.clientId || !config.clientSecret) {
      res.redirect(`/login?rid=${encodeURIComponent(rid)}&error=github-not-configured`);
      return;
    }

    const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
    authorizeUrl.searchParams.set("client_id", config.clientId);
    authorizeUrl.searchParams.set("redirect_uri", new URL("/auth/oauth/callback", options.publicBaseUrl).toString());
    authorizeUrl.searchParams.set("state", rid);
    authorizeUrl.searchParams.set("scope", "read:user user:email");
    authorizeUrl.searchParams.set("allow_signup", "false");
    res.redirect(authorizeUrl.toString());
  });

  app.get("/oauth/callback/github", async (req: Request, res: Response) => {
    const code = String(req.query.code || "");
    const rid = String(req.query.state || "");
    if (!code || !rid || !oauth.getPending(rid)) {
      res.status(400).send("Missing code/state");
      return;
    }

    const config = options.configStore.getSnapshot().githubOAuth;
    if (!config.clientId || !config.clientSecret) {
      res.redirect(`/login?rid=${encodeURIComponent(rid)}&error=github-not-configured`);
      return;
    }

    const redirectUri = new URL("/auth/oauth/callback", options.publicBaseUrl).toString();
    const accessToken = await exchangeGithubCode(config.clientId, config.clientSecret, code, redirectUri).catch(() => "");
    if (!accessToken) {
      res.redirect(`/login?rid=${encodeURIComponent(rid)}&error=github-token-failed`);
      return;
    }

    const githubUser = await fetchGithubUser(accessToken).catch(() => null);
    if (!githubUser?.login) {
      res.redirect(`/login?rid=${encodeURIComponent(rid)}&error=github-user-failed`);
      return;
    }

    const normalizedLogin = normalizeLogin(githubUser.login);
    if (!options.configStore.isAllowedGitHubUser(normalizedLogin)) {
      res.status(403).type("html").send(renderDeniedPage(githubUser.login));
      return;
    }

    oauth.setSubject(rid, `github:${githubUser.id}`, {
      provider: "github",
      login: normalizedLogin,
    });

    if (oauth.shouldAutoApprove()) {
      res.redirect(await oauth.approve(rid));
      return;
    }

    res.redirect(`/consent?rid=${encodeURIComponent(rid)}`);
  });

  app.get("/consent", (req: Request, res: Response) => {
    const rid = String(req.query.rid || "");
    const pending = oauth.getPending(rid);
    if (!pending) {
      res.status(400).send("Unknown rid");
      return;
    }
    if (!pending.subject) {
      res.redirect(`/login?rid=${encodeURIComponent(rid)}`);
      return;
    }

    res.status(200).type("html").send(renderConsentPage({
      rid,
      clientId: pending.clientId,
      scopes: pending.scopes,
    }));
  });

  app.post("/consent", formParser, async (req: Request, res: Response) => {
    const rid = String(req.body?.rid || "");
    const action = String(req.body?.action || "");
    if (!rid) {
      res.status(400).send("Missing rid");
      return;
    }
    if (action === "approve") {
      res.redirect(await oauth.approve(rid));
      return;
    }
    res.redirect(oauth.deny(rid, "access_denied", "User denied request"));
  });

  app.get("/admin", (req: Request, res: Response) => {
    const session = readAdminSession(req, cookieSecret);
    if (!session) {
      res.status(200).type("html").send(renderAdminUnlockPage(String(req.query.error || "")));
      return;
    }

    const snapshot = options.configStore.getSnapshot();
    res.status(200).type("html").send(renderAdminDashboard({
      publicBaseUrl: options.publicBaseUrl,
      githubOAuth: snapshot.githubOAuth,
      allowlist: snapshot.allowedGitHubUsers,
      discordTargets: snapshot.targets.discord,
      blueskyTargets: snapshot.targets.bluesky,
      message: String(req.query.message || ""),
    }));
  });

  app.post("/admin/unlock", formParser, (req: Request, res: Response) => {
    const submittedKey = String(req.body?.authKey || "");
    if (!safeEquals(submittedKey, options.adminAuthKey)) {
      res.redirect("/admin?error=bad-key");
      return;
    }
    res.setHeader("Set-Cookie", createSignedAdminCookie(cookieSecret));
    res.redirect(303, "/admin");
  });

  app.post("/admin/logout", (req: Request, res: Response) => {
    res.setHeader("Set-Cookie", expireCookie("mcp_social_admin"));
    res.redirect(303, "/admin");
  });

  app.post("/admin/github-oauth", formParser, async (req: Request, res: Response) => {
    if (!readAdminSession(req, cookieSecret)) {
      res.redirect(303, "/admin");
      return;
    }
    await options.configStore.setGitHubOAuth(
      String(req.body?.clientId || ""),
      String(req.body?.clientSecret || ""),
    );
    res.redirect(303, "/admin?message=github-oauth-updated");
  });

  app.post("/admin/github-users/add", formParser, async (req: Request, res: Response) => {
    if (!readAdminSession(req, cookieSecret)) {
      res.redirect(303, "/admin");
      return;
    }
    await options.configStore.addGitHubUser(String(req.body?.login || ""));
    res.redirect(303, "/admin?message=allowlist-updated");
  });

  app.post("/admin/github-users/remove", formParser, async (req: Request, res: Response) => {
    if (!readAdminSession(req, cookieSecret)) {
      res.redirect(303, "/admin");
      return;
    }
    await options.configStore.removeGitHubUser(String(req.body?.login || ""));
    res.redirect(303, "/admin?message=allowlist-updated");
  });

  app.post("/admin/discord-targets/upsert", formParser, async (req: Request, res: Response) => {
    if (!readAdminSession(req, cookieSecret)) {
      res.redirect(303, "/admin");
      return;
    }
    await options.configStore.upsertDiscordTarget({
      name: String(req.body?.name || ""),
      webhookUrl: String(req.body?.webhookUrl || ""),
      username: String(req.body?.username || ""),
      avatarUrl: String(req.body?.avatarUrl || ""),
    });
    res.redirect(303, "/admin?message=discord-target-updated");
  });

  app.post("/admin/discord-targets/remove", formParser, async (req: Request, res: Response) => {
    if (!readAdminSession(req, cookieSecret)) {
      res.redirect(303, "/admin");
      return;
    }
    await options.configStore.removeDiscordTarget(String(req.body?.target || ""));
    res.redirect(303, "/admin?message=discord-target-updated");
  });

  app.post("/admin/bluesky-targets/upsert", formParser, async (req: Request, res: Response) => {
    if (!readAdminSession(req, cookieSecret)) {
      res.redirect(303, "/admin");
      return;
    }
    await options.configStore.upsertBlueskyTarget({
      name: String(req.body?.name || ""),
      identifier: String(req.body?.identifier || ""),
      appPassword: String(req.body?.appPassword || ""),
      serviceUrl: normalizeServiceUrl(String(req.body?.serviceUrl || "https://bsky.social")),
    });
    res.redirect(303, "/admin?message=bluesky-target-updated");
  });

  app.post("/admin/bluesky-targets/remove", formParser, async (req: Request, res: Response) => {
    if (!readAdminSession(req, cookieSecret)) {
      res.redirect(303, "/admin");
      return;
    }
    await options.configStore.removeBlueskyTarget(String(req.body?.target || ""));
    res.redirect(303, "/admin?message=bluesky-target-updated");
  });
}

async function exchangeGithubCode(clientId: string, clientSecret: string, code: string, redirectUri: string): Promise<string> {
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!tokenResponse.ok) {
    throw new Error("GitHub token exchange failed");
  }
  const payload = await tokenResponse.json() as { access_token?: string };
  if (!payload.access_token) {
    throw new Error("GitHub token response missing access_token");
  }
  return payload.access_token;
}

async function fetchGithubUser(token: string): Promise<{ login: string; id: number }> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) {
    throw new Error("GitHub user lookup failed");
  }
  const payload = await response.json() as { login?: string; id?: number };
  return {
    login: payload.login ?? "",
    id: payload.id ?? 0,
  };
}

function readAdminSession(req: Request, secret: string): AdminSession | null {
  const cookies = parseCookies(req.headers.cookie ?? "");
  const raw = cookies.get("mcp_social_admin");
  if (!raw) {
    return null;
  }
  const [payload, signature] = raw.split(".");
  if (!payload || !signature || signValue(payload, secret) !== signature) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    if (parsed.kind !== "admin" || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function createSignedAdminCookie(secret: string): string {
  const payload = Buffer.from(JSON.stringify({
    kind: "admin",
    exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60),
  } satisfies AdminSession), "utf8").toString("base64url");
  const signature = signValue(payload, secret);
  return `mcp_social_admin=${payload}.${signature}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${12 * 60 * 60}`;
}

function expireCookie(name: string): string {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function signValue(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function parseCookies(raw: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const item of raw.split(";")) {
    const index = item.indexOf("=");
    if (index < 1) {
      continue;
    }
    map.set(item.slice(0, index).trim(), item.slice(index + 1).trim());
  }
  return map;
}

function renderPublicLoginPage(args: {
  rid: string;
  publicBaseUrl: URL;
  githubConfigured: boolean;
  allowlistCount: number;
  error: string;
}): string {
  return pageTemplate({
    title: "MCP Social Publisher Login",
    eyebrow: "GitHub OAuth",
    headline: "Authorize MCP access with an allowlisted GitHub account.",
    body: `
      ${args.error ? `<div class="note note-warn">${escapeHtml(parseStatusMessage(args.error))}</div>` : ""}
      <div class="card-row">
        <div class="card"><div class="label">Callback</div><div class="value path">${escapeHtml(new URL("/auth/oauth/callback", args.publicBaseUrl).toString())}</div></div>
        <div class="card"><div class="label">Allowlisted users</div><div class="value">${args.allowlistCount}</div></div>
        <div class="card"><div class="label">GitHub OAuth</div><div class="value">${args.githubConfigured ? "configured" : "missing"}</div></div>
      </div>
      <a class="button ${args.githubConfigured ? "" : "disabled"}" href="/login/github?rid=${encodeURIComponent(args.rid)}">Continue with GitHub</a>
    `,
  });
}

function renderDeniedPage(login: string): string {
  return pageTemplate({
    title: "Access Denied",
    eyebrow: "Allowlist Required",
    headline: `${escapeHtml(login)} is not allowed to authorize this service.`,
    body: `<p class="lede">Use the admin UI to add this GitHub login to the allowlist, then try again.</p>`,
  });
}

function renderConsentPage(args: { rid: string; clientId: string; scopes: string[] }): string {
  return pageTemplate({
    title: "Authorize Client",
    eyebrow: "OAuth Consent",
    headline: "Approve this MCP client.",
    body: `
      <div class="panel">
        <div class="label">Client</div>
        <div class="value path">${escapeHtml(args.clientId)}</div>
        <div class="label">Scopes</div>
        <div class="value">${escapeHtml(args.scopes.join(" ") || "mcp")}</div>
      </div>
      <form class="inline-actions" method="post" action="/consent">
        <input type="hidden" name="rid" value="${escapeHtml(args.rid)}" />
        <button class="button" type="submit" name="action" value="approve">Approve</button>
        <button class="button secondary" type="submit" name="action" value="deny">Deny</button>
      </form>
    `,
  });
}

function renderAdminUnlockPage(error: string): string {
  return pageTemplate({
    title: "Admin Unlock",
    eyebrow: "Pre-Shared Key",
    headline: "Enter the admin key to manage OAuth and publishing bindings.",
    body: `
      ${error ? `<div class="note note-warn">${escapeHtml(parseStatusMessage(error))}</div>` : ""}
      <form class="panel" method="post" action="/admin/unlock">
        <label class="label" for="authKey">Admin key</label>
        <input id="authKey" name="authKey" type="password" autocomplete="current-password" />
        <button class="button" type="submit">Unlock</button>
      </form>
    `,
  });
}

function renderAdminDashboard(args: {
  publicBaseUrl: URL;
  githubOAuth: { clientId: string; clientSecret: string; updatedAt: string };
  allowlist: string[];
  discordTargets: DiscordTarget[];
  blueskyTargets: BlueskyTarget[];
  message: string;
}): string {
  const discordList = args.discordTargets.length > 0
    ? args.discordTargets.map((target) => `
        <li class="item-row">
          <div>
            <div class="item-name">${escapeHtml(target.name)}</div>
            <div class="path">${escapeHtml(describeDiscordTarget(target))}</div>
          </div>
          <form method="post" action="/admin/discord-targets/remove">
            <input type="hidden" name="target" value="${escapeHtml(target.id)}" />
            <button class="button danger" type="submit">Remove</button>
          </form>
        </li>
      `).join("")
    : `<li class="empty-state">No Discord targets configured.</li>`;

  const blueskyList = args.blueskyTargets.length > 0
    ? args.blueskyTargets.map((target) => `
        <li class="item-row">
          <div>
            <div class="item-name">${escapeHtml(target.name)}</div>
            <div class="path">${escapeHtml(`${target.identifier} via ${target.serviceUrl}`)}</div>
          </div>
          <form method="post" action="/admin/bluesky-targets/remove">
            <input type="hidden" name="target" value="${escapeHtml(target.id)}" />
            <button class="button danger" type="submit">Remove</button>
          </form>
        </li>
      `).join("")
    : `<li class="empty-state">No Bluesky targets configured.</li>`;

  const allowlistRows = args.allowlist.length > 0
    ? args.allowlist.map((login) => `
        <li class="item-row">
          <div class="item-name">${escapeHtml(login)}</div>
          <form method="post" action="/admin/github-users/remove">
            <input type="hidden" name="login" value="${escapeHtml(login)}" />
            <button class="button danger" type="submit">Remove</button>
          </form>
        </li>
      `).join("")
    : `<li class="empty-state">No GitHub accounts are allowlisted yet.</li>`;

  return pageTemplate({
    title: "MCP Social Publisher Admin",
    eyebrow: "Control Plane",
    headline: "Bind GitHub OAuth and destination accounts without redeploying.",
    body: `
      ${args.message ? `<div class="note">${escapeHtml(parseStatusMessage(args.message))}</div>` : ""}
      <div class="card-row">
        <div class="card"><div class="label">Public URL</div><div class="value path">${escapeHtml(args.publicBaseUrl.toString())}</div></div>
        <div class="card"><div class="label">GitHub client</div><div class="value">${escapeHtml(maskSecret(args.githubOAuth.clientId))}</div></div>
        <div class="card"><div class="label">Callback</div><div class="value path">${escapeHtml(new URL("/auth/oauth/callback", args.publicBaseUrl).toString())}</div></div>
      </div>
      <form class="panel" method="post" action="/admin/github-oauth">
        <div class="label">GitHub OAuth app</div>
        <input name="clientId" type="text" placeholder="Client ID" value="${escapeHtml(args.githubOAuth.clientId)}" />
        <input name="clientSecret" type="password" placeholder="Client Secret" value="${escapeHtml(args.githubOAuth.clientSecret)}" />
        <button class="button" type="submit">Save GitHub OAuth</button>
      </form>
      <div class="split-grid">
        <section class="panel">
          <div class="label">GitHub allowlist</div>
          <form method="post" action="/admin/github-users/add">
            <input name="login" type="text" placeholder="riatzukiza" />
            <button class="button" type="submit">Add login</button>
          </form>
          <ul class="item-list">${allowlistRows}</ul>
        </section>
        <section class="panel">
          <div class="label">Discord target</div>
          <form method="post" action="/admin/discord-targets/upsert">
            <input name="name" type="text" placeholder="announce" />
            <input name="webhookUrl" type="password" placeholder="https://discord.com/api/webhooks/..." />
            <input name="username" type="text" placeholder="Optional username override" />
            <input name="avatarUrl" type="text" placeholder="Optional avatar URL" />
            <button class="button" type="submit">Save Discord target</button>
          </form>
          <ul class="item-list">${discordList}</ul>
        </section>
      </div>
      <section class="panel">
        <div class="label">Bluesky target</div>
        <form method="post" action="/admin/bluesky-targets/upsert">
          <input name="name" type="text" placeholder="primary-bsky" />
          <input name="identifier" type="text" placeholder="handle.example.com" />
          <input name="appPassword" type="password" placeholder="Bluesky app password" />
          <input name="serviceUrl" type="text" placeholder="https://bsky.social" value="https://bsky.social" />
          <button class="button" type="submit">Save Bluesky target</button>
        </form>
        <ul class="item-list">${blueskyList}</ul>
      </section>
      <form method="post" action="/admin/logout">
        <button class="button secondary" type="submit">Lock admin UI</button>
      </form>
    `,
  });
}

function parseStatusMessage(error: string): string {
  switch (error) {
    case "github-not-configured":
      return "GitHub OAuth credentials are not configured yet.";
    case "github-token-failed":
      return "GitHub token exchange failed.";
    case "github-user-failed":
      return "GitHub user lookup failed.";
    case "bad-key":
      return "The admin key was not accepted.";
    case "github-oauth-updated":
      return "GitHub OAuth settings saved.";
    case "allowlist-updated":
      return "GitHub allowlist updated.";
    case "discord-target-updated":
      return "Discord targets updated.";
    case "bluesky-target-updated":
      return "Bluesky targets updated.";
    default:
      return error;
  }
}

function pageTemplate(args: { title: string; eyebrow: string; headline: string; body: string }): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(args.title)}</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f5f1e8;
      --ink: #1d1a16;
      --muted: #65584a;
      --panel: rgba(255, 251, 245, 0.92);
      --line: rgba(74, 59, 39, 0.14);
      --accent: #185f65;
      --accent-ink: #f5fffe;
      --warn: #aa4e21;
      --shadow: 0 24px 60px rgba(37, 25, 11, 0.12);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: Georgia, "Times New Roman", serif;
      color: var(--ink);
      background:
        radial-gradient(circle at top left, rgba(24, 95, 101, 0.18), transparent 24%),
        radial-gradient(circle at bottom right, rgba(170, 78, 33, 0.16), transparent 22%),
        linear-gradient(135deg, #faf5eb, var(--bg));
      padding: 20px;
    }
    main {
      max-width: 980px;
      margin: 0 auto;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 28px;
      box-shadow: var(--shadow);
      padding: 28px;
      backdrop-filter: blur(10px);
    }
    .eyebrow, .label {
      font: 600 12px/1.2 ui-monospace, "SFMono-Regular", Menlo, monospace;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: var(--muted);
    }
    .eyebrow { margin-bottom: 12px; }
    h1 {
      margin: 0 0 16px;
      font-size: clamp(30px, 5vw, 52px);
      line-height: 0.98;
      max-width: 14ch;
    }
    .lede {
      margin: 0 0 18px;
      color: var(--muted);
      font-size: 18px;
      line-height: 1.55;
    }
    .panel, .card {
      border: 1px solid var(--line);
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.64);
    }
    .panel { padding: 18px; margin-bottom: 18px; }
    .card-row, .split-grid {
      display: grid;
      gap: 14px;
      margin-bottom: 18px;
    }
    .card-row { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .split-grid { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
    .card { padding: 16px; }
    .value { font-size: 17px; line-height: 1.4; margin-top: 8px; }
    .path { word-break: break-all; font-size: 14px; color: var(--muted); }
    input {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 13px 14px;
      background: #fffdf8;
      color: var(--ink);
      margin: 10px 0 14px;
      font: inherit;
    }
    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
      border: 0;
      border-radius: 999px;
      padding: 12px 18px;
      background: var(--accent);
      color: var(--accent-ink);
      font: 600 14px/1 ui-monospace, "SFMono-Regular", Menlo, monospace;
      letter-spacing: 0.06em;
      cursor: pointer;
    }
    .button.secondary {
      background: rgba(59, 43, 27, 0.08);
      color: var(--ink);
      border: 1px solid var(--line);
    }
    .button.danger { background: var(--warn); }
    .button.disabled { pointer-events: none; opacity: 0.5; }
    .note {
      border: 1px solid rgba(89, 83, 50, 0.14);
      background: rgba(253, 248, 223, 0.76);
      border-radius: 16px;
      padding: 12px 14px;
      margin-bottom: 18px;
      color: #5a4a1e;
    }
    .note-warn {
      background: rgba(255, 235, 231, 0.82);
      color: #7d2f20;
      border-color: rgba(166, 59, 34, 0.18);
    }
    .item-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 10px;
    }
    .item-row, .empty-state {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 12px 14px;
      background: rgba(255, 255, 255, 0.56);
      font: 500 15px/1.4 ui-monospace, "SFMono-Regular", Menlo, monospace;
    }
    .item-name { font-weight: 700; }
    .empty-state { justify-content: center; color: var(--muted); }
    .inline-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    @media (max-width: 720px) {
      body { padding: 14px; }
      main { padding: 20px; border-radius: 22px; }
      h1 { max-width: none; }
      .item-row { align-items: stretch; flex-direction: column; }
    }
  </style>
</head>
<body>
  <main>
    <div class="eyebrow">${escapeHtml(args.eyebrow)}</div>
    <h1>${escapeHtml(args.headline)}</h1>
    ${args.body}
  </main>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] as string);
}
