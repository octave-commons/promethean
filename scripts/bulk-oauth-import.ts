import { chromium, type Page } from "playwright";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createServer, type Server } from "node:http";
import { ImapFlow } from "imapflow";

const PROXY_BASE = process.env.PROXY_BASE_URL ?? "http://localhost:8789";
const PROXY_TOKEN = process.env.PROXY_AUTH_TOKEN ?? "";
const OPENAI_OAUTH_CALLBACK_PORT = Number(process.env.OPENAI_OAUTH_CALLBACK_PORT ?? "1455");
const CALLBACK_PORT = Number.isFinite(OPENAI_OAUTH_CALLBACK_PORT) && OPENAI_OAUTH_CALLBACK_PORT > 0
  ? OPENAI_OAUTH_CALLBACK_PORT
  : 1455;
const CSV_PATH = process.env.CSV_PATH ?? resolve(process.cwd(), "../../passwords.csv");
const DELAY_MS = Number(process.env.DELAY_MS ?? "4000");
const HEADLESS = process.env.HEADLESS === "true";
const START_INDEX = Number(process.env.START_INDEX ?? "0");
const MAX_ACCOUNTS = Number(process.env.MAX_ACCOUNTS ?? "9999");
const DEBUG_DIR = process.env.DEBUG_DIR ?? "/tmp/oauth-debug";
const CALLBACK_MODE = process.env.OAUTH_CALLBACK_MODE === "capture" ? "capture" : "proxy";
const MAX_LOGIN_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS ?? "3");

// Gmail IMAP config -- checks IMAP_USER/IMAP_PASS, then GMAIL_APP_EMAIL/GMAIL_APP_PASSWORD
const IMAP_HOST = process.env.IMAP_HOST ?? "imap.gmail.com";
const IMAP_PORT = Number(process.env.IMAP_PORT ?? "993");
const IMAP_GMAIL_ACCOUNT = (process.env.IMAP_GMAIL_ACCOUNT ?? process.env.IMAP_USER ?? process.env.GMAIL_APP_EMAIL ?? "").trim();
let IMAP_USER = (process.env.IMAP_USER ?? process.env.GMAIL_APP_EMAIL ?? "").trim();
let IMAP_PASS = (process.env.IMAP_PASS ?? process.env.GMAIL_APP_PASSWORD ?? "").trim();

interface CsvRow {
  readonly url: string;
  readonly username: string;
  readonly password: string;
}

function parseCsv(path: string): CsvRow[] {
  const raw = readFileSync(path, "utf8");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.length < 3) continue;
    rows.push({
      url: stripQuotes(fields[0]),
      username: stripQuotes(fields[1]),
      password: stripQuotes(fields[2]),
    });
  }
  return rows;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ",") { fields.push(current); current = ""; }
      else { current += ch; }
    }
  }
  fields.push(current);
  return fields;
}

function stripQuotes(s: string): string {
  return s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1) : s;
}

function sanitize(s: string): string {
  return s.replace(/[^a-zA-Z0-9._@-]/g, "_");
}

class RetryableLoginError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "RetryableLoginError";
  }
}

async function readBodyText(page: Page): Promise<string> {
  return (await page.locator("body").textContent().catch(() => null)) ?? "";
}

function toCompactText(text: string, maxLength: number = 200): string {
  return text.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function retryablePageError(bodyText: string): RetryableLoginError | undefined {
  if (bodyText.includes("Oops, an error occurred") || bodyText.includes("Operation timed out")) {
    return new RetryableLoginError(`OpenAI login page timed out: ${toCompactText(bodyText)}`);
  }
  if (bodyText.includes("Authentication Error") && bodyText.includes("unknown_error")) {
    return new RetryableLoginError(`OpenAI authentication error page: ${toCompactText(bodyText)}`);
  }
  return undefined;
}

async function screenshot(page: Page, label: string): Promise<void> {
  await page.screenshot({ path: `${DEBUG_DIR}/${sanitize(label)}.png` }).catch(() => {});
}

// ── Extract Gmail credentials from CSV ──

function extractGmailCredsFromCsv(rows: CsvRow[], gmailAccount: string): { user: string; pass: string } | undefined {
  const normalized = gmailAccount.trim().toLowerCase();
  if (normalized.length === 0) {
    throw new Error("Missing IMAP account. Set IMAP_USER/GMAIL_APP_EMAIL or IMAP_GMAIL_ACCOUNT to auto-extract IMAP credentials from CSV.");
  }

  const usernameOnly = normalized.replace(/@gmail\.com$/, "");

  for (const row of rows) {
    if (!row.url.includes("google.com")) continue;
    const rowUser = row.username.toLowerCase();
    if (rowUser === normalized || rowUser === usernameOnly) {
      return { user: normalized.includes("@") ? normalized : `${normalized}@gmail.com`, pass: row.password };
    }
  }
  return undefined;
}

// ── IMAP: fetch OpenAI verification code ──

async function fetchVerificationCode(
  recipientEmail: string,
  sinceDate: Date,
  timeoutMs: number = 90000,
): Promise<string> {
  const client = new ImapFlow({
    host: IMAP_HOST,
    port: IMAP_PORT,
    secure: true,
    auth: { user: IMAP_USER, pass: IMAP_PASS },
    logger: false,
  });

  await client.connect();
  const deadline = Date.now() + timeoutMs;
  const checkedUids = new Set<number>();
  // record the highest UID before we start so we only look at new messages
  let baselineMaxUid = 0;

  const lock = await client.getMailboxLock("INBOX");
  try {
    const existingUids = (await client.search({ subject: "ChatGPT code" })) || [];

    // Set our UID baseline to the newest message that is strictly before sinceDate.
    // This avoids skipping a verification email that arrives during the initial snapshot.
    for (let i = existingUids.length - 1; i >= 0; i--) {
      const uid = existingUids[i] ?? 0;
      if (uid <= 0) continue;

      const meta = await client.fetchOne(uid, { internalDate: true });
      const internalDateRaw = (meta as { internalDate?: unknown } | undefined)?.internalDate;
      const internalDate = internalDateRaw instanceof Date
        ? internalDateRaw
        : typeof internalDateRaw === "string" || typeof internalDateRaw === "number"
          ? new Date(internalDateRaw)
          : undefined;
      const internalDateMs = internalDate?.getTime();

      if (typeof internalDateMs === "number" && Number.isFinite(internalDateMs) && internalDateMs < sinceDate.getTime()) {
        baselineMaxUid = uid;
        break;
      }
    }
  } finally {
    lock.release();
  }

  try {
    while (Date.now() < deadline) {
      // NOOP forces the server to report new messages
      await client.noop();

      const lock = await client.getMailboxLock("INBOX");
      try {
        const uids = (await client.search({ subject: "ChatGPT code" })) || [];

        const candidateUids = uids.filter((uid) => !checkedUids.has(uid));

        for (const uid of candidateUids.reverse()) {
          if (uid <= baselineMaxUid) {
            const meta = await client.fetchOne(uid, { internalDate: true });
            const internalDateRaw = (meta as { internalDate?: unknown } | undefined)?.internalDate;
            const internalDate = internalDateRaw instanceof Date
              ? internalDateRaw
              : typeof internalDateRaw === "string" || typeof internalDateRaw === "number"
                ? new Date(internalDateRaw)
                : undefined;
            const internalDateMs = internalDate?.getTime();

            if (typeof internalDateMs === "number" && Number.isFinite(internalDateMs) && internalDateMs < sinceDate.getTime()) {
              break;
            }
          }

          checkedUids.add(uid);

          const msg = await client.fetchOne(uid, { source: true });
          const source = msg && typeof msg === "object" && "source" in msg ? msg.source : undefined;
          if (!source) continue;
          const body = source.toString("utf8");

          // verify this email relates to our target account
          if (!body.toLowerCase().includes(recipientEmail.toLowerCase())) {
            continue;
          }

          // code is in the subject: "Your ChatGPT code is XXXXXX"
          const subjectMatch = body.match(/Your ChatGPT code is (\d{6})/i);
          if (subjectMatch?.[1]) {
            return subjectMatch[1];
          }

          // fallback: find any 6-digit code in the body
          const codeMatch = body.match(/(?:verification code|code is|your code)[:\s]*(\d{6})/i);
          if (codeMatch?.[1]) {
            return codeMatch[1];
          }
        }
      } finally {
        lock.release();
      }

      await new Promise((r) => setTimeout(r, 4000));
    }
  } finally {
    await client.logout().catch(() => {});
  }

  throw new Error("Timed out waiting for verification email");
}

// ── Proxy API calls ──

async function proxyStartBrowserOAuth(): Promise<{ authorizeUrl: string; state: string }> {
  const res = await fetch(`${PROXY_BASE}/api/ui/credentials/openai/oauth/browser/start`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(PROXY_TOKEN ? { authorization: `Bearer ${PROXY_TOKEN}` } : {}),
    },
    body: JSON.stringify({ redirectBaseUrl: PROXY_BASE }),
  });
  if (!res.ok) throw new Error(`Proxy browser/start: ${res.status} ${await res.text()}`);
  return (await res.json()) as { authorizeUrl: string; state: string };
}

async function proxyCompleteCallback(code: string, state: string): Promise<void> {
  const url = `${PROXY_BASE}/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
  const res = await fetch(url);
  const body = await res.text();
  if (!body.includes("Successful")) {
    throw new Error(`Proxy callback: ${res.status} ${body.slice(0, 200)}`);
  }
}

// ── Cloudflare handling ──

async function waitForCloudflare(page: Page, timeout: number = 30000): Promise<void> {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const title = await page.title().catch(() => "");
    if (!title.includes("Just a moment") && !title.includes("Checking")) return;

    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible().catch(() => false)) await checkbox.click().catch(() => {});

    const frame = page.frameLocator('iframe[src*="turnstile"], iframe[title*="Cloudflare"]').first();
    const cb = frame.locator('input[type="checkbox"], .cb-lb').first();
    if (await cb.isVisible().catch(() => false)) await cb.click().catch(() => {});

    await page.waitForTimeout(1500);
  }
  throw new Error("Cloudflare challenge did not resolve");
}

// ── Local callback server on CALLBACK_PORT ──

interface CallbackCapture {
  code: string;
  state: string;
}

type CallbackResult =
  | { kind: "capture"; code: string; state: string }
  | { kind: "proxy" };

async function startCallbackServer(
  port: number,
): Promise<{ server: Server; getCapture: () => CallbackCapture; reset: () => void }> {
  let capture: CallbackCapture = { code: "", state: "" };

  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", `http://localhost:${port}`);
    const code = url.searchParams.get("code") ?? "";
    const state = url.searchParams.get("state") ?? "";
    if (code) {
      capture = { code, state };
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<html><body><h1>OAuth callback captured. You can close this tab.</h1></body></html>");
  });

  await new Promise<void>((resolve, reject) => {
    function cleanup(): void {
      server.off("error", onError);
      server.off("listening", onListening);
    }

    function onError(err: unknown): void {
      cleanup();
      reject(err);
    }

    function onListening(): void {
      cleanup();
      resolve();
    }

    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port, "127.0.0.1");
  });

  return {
    server,
    getCapture: () => capture,
    reset: () => { capture = { code: "", state: "" }; },
  };
}

// ── OpenAI login automation ──

async function automateOpenAiLogin(
  page: Page,
  authorizeUrl: string,
  email: string,
  password: string,
  label: string,
  getCapture: (() => CallbackCapture) | null,
): Promise<CallbackResult> {

  // timestamp for IMAP search (only look for emails sent after this point)
  const loginStartTime = new Date();

  await page.goto(authorizeUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

  const title = await page.title().catch(() => "");
  if (title.includes("Just a moment") || title.includes("Checking")) {
    console.log(`  waiting for Cloudflare...`);
    await waitForCloudflare(page, 45000);
  }

  await page.waitForTimeout(2000);

  // ── Step 1: Email ──
  const emailInput = page.locator(
    'input[name="email"], input[type="email"], input[name="username"], input[autocomplete="email"]'
  ).first();
  await emailInput.waitFor({ state: "visible", timeout: 15000 });
  await emailInput.fill(email);
  await page.locator('button[type="submit"], button:has-text("Continue")').first().click();
  console.log(`  email submitted`);

  await page.waitForTimeout(3000);
  {
    const bodyText = await readBodyText(page);
    const retryableError = retryablePageError(bodyText);
    if (retryableError) {
      throw retryableError;
    }
  }
  if (getCapture?.().code) {
    const capture = getCapture();
    return { kind: "capture", code: capture.code, state: capture.state };
  }

  // handle Cloudflare after email
  const t2 = await page.title().catch(() => "");
  if (t2.includes("Just a moment")) {
    await waitForCloudflare(page, 30000);
    await page.waitForTimeout(2000);
  }

  // ── Step 2: Password ──
  const pwInput = page.locator('input[type="password"]').first();
  let pwFilled = false;
  for (let attempt = 0; attempt < 6 && !pwFilled; attempt++) {
    if (await pwInput.isVisible().catch(() => false)) {
      await pwInput.fill(password);
      pwFilled = true;
    } else {
      const bodyText = await readBodyText(page);
      const retryableError = retryablePageError(bodyText);
      if (retryableError) {
        throw retryableError;
      }
      if (getCapture?.().code) {
        const capture = getCapture();
        return { kind: "capture", code: capture.code, state: capture.state };
      }
      await page.waitForTimeout(2000);
    }
  }
  if (!pwFilled) {
    await screenshot(page, `${label}-no-pw`);
    const bodyText = await readBodyText(page);
    const retryableError = retryablePageError(bodyText);
    if (retryableError) {
      throw retryableError;
    }
    throw new Error(`No password field. URL: ${page.url()} Body: ${toCompactText(bodyText)}`);
  }

  await page.locator('button[type="submit"], button:has-text("Continue")').first().click();
  console.log(`  password submitted`);
  await page.waitForTimeout(3000);
  await screenshot(page, `${label}-after-pw`);

  if (getCapture?.().code) {
    const capture = getCapture();
    return { kind: "capture", code: capture.code, state: capture.state };
  }

  // ── Step 3: Check for errors or email verification ──
  const curUrl = page.url();
  const bodyText = await readBodyText(page);

  if (bodyText.includes("Incorrect email address or password")) {
    throw new Error("Wrong password");
  }
  if (bodyText.includes("Too many login attempts")) {
    throw new Error("Rate limited");
  }
  if (bodyText.includes("account has been locked") || bodyText.includes("Account locked")) {
    throw new Error("Account locked");
  }

  // ── Step 4: Email verification (if required) ──
  if (curUrl.includes("email-verification") || bodyText.includes("Check your inbox")) {
    console.log(`  email verification required, checking IMAP...`);

    if (!IMAP_USER || !IMAP_PASS) {
      throw new Error("Email verification required but IMAP_USER/IMAP_PASS not set");
    }

    // try to get the code, click "Resend email" if first attempt times out
    let verificationCode: string | undefined;
    try {
      verificationCode = await fetchVerificationCode(email, loginStartTime, 45000);
    } catch {
      console.log(`  code not found yet, clicking Resend email...`);
      const resendBtn = page.locator('button:has-text("Resend"), a:has-text("Resend")').first();
      if (await resendBtn.isVisible().catch(() => false)) {
        await resendBtn.click();
        await page.waitForTimeout(2000);
      }
      verificationCode = await fetchVerificationCode(email, loginStartTime, 60000);
    }
    console.log(`  got verification code`);

    const codeInput = page.locator('input[name="code"], input[placeholder*="Code" i], input[type="text"]').first();
    await codeInput.waitFor({ state: "visible", timeout: 10000 });
    await codeInput.fill(verificationCode);
    await page.locator('button[type="submit"], button:has-text("Continue")').first().click();
    console.log(`  verification code submitted`);
    await page.waitForTimeout(5000);
    await screenshot(page, `${label}-after-verify`);

    // check for account errors after verification
    const postVerifyText = (await page.locator("body").textContent().catch(() => null)) ?? "";
    if (postVerifyText.includes("deleted or deactivated") || postVerifyText.includes("do not have an account")) {
      throw new Error("Account deleted or deactivated");
    }

    if (getCapture?.().code) {
      const capture = getCapture();
      return { kind: "capture", code: capture.code, state: capture.state };
    }

    // handle consent page that appears right after verification
    const verifyUrl = page.url();
    if (verifyUrl.includes("consent")) {
      console.log(`  consent page detected, clicking Continue...`);
      const consentBtn = page.locator('button:has-text("Continue")').first();
      await consentBtn.waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
      if (await consentBtn.isVisible().catch(() => false)) {
        await consentBtn.click();
        await page.waitForTimeout(5000);
      }
    }
  }

  // ── Step 5: Wait for OAuth callback ──
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    const bText = await readBodyText(page);
    if (bText.includes("Incorrect") || bText.includes("invalid code") || bText.includes("expired")) {
      throw new Error(`Verification failed: ${bText.slice(0, 100)}`);
    }
    if (bText.includes("deleted or deactivated") || bText.includes("do not have an account")) {
      throw new Error("Account deleted or deactivated");
    }
    if (bText.includes("Oops, an error occurred")) {
      const detail = bText.slice(0, 200).replace(/\s+/g, " ").trim();
      throw new Error(`OpenAI error page: ${detail}`);
    }
    if (bText.includes("Authentication Error")) {
      const detail = bText.slice(0, 240).replace(/\s+/g, " ").trim();
      throw new Error(`OpenAI authentication error: ${detail}`);
    }

    if (getCapture?.().code) {
      const capture = getCapture();
      return { kind: "capture", code: capture.code, state: capture.state };
    }

    // handle authorize/consent page (Codex consent says "Continue")
    const consentUrl = page.url();
    if (consentUrl.includes("consent") || consentUrl.includes("authorize")) {
      const consentBtn = page.locator('button:has-text("Continue"), button:has-text("Allow"), button:has-text("Authorize"), button:has-text("Accept")').first();
      if (await consentBtn.isVisible().catch(() => false)) {
        console.log(`  clicking consent/authorize`);
        await consentBtn.click();
        await page.waitForTimeout(3000);
      }
    }

    // check if we landed on localhost:<callback-port> (callback completed)
    const curPageUrl = page.url();
    if (
      curPageUrl.includes(`localhost:${CALLBACK_PORT}`)
      || curPageUrl.includes(`127.0.0.1:${CALLBACK_PORT}`)
      || curPageUrl.includes("chrome-error")
    ) {
      if (CALLBACK_MODE === "proxy" && bText.includes("Successful")) {
        return { kind: "proxy" };
      }
      // callback server should have captured it, give it a moment
      await page.waitForTimeout(1000);
      if (getCapture?.().code) {
        const capture = getCapture();
        return { kind: "capture", code: capture.code, state: capture.state };
      }
    }

    const t = await page.title().catch(() => "");
    if (t.includes("Just a moment")) {
      await waitForCloudflare(page, 20000).catch(() => {});
    }

    await page.waitForTimeout(1000);
  }

  await screenshot(page, `${label}-timeout`);
  const timeoutBody = await readBodyText(page);
  if (page.url().includes("email-verification") || timeoutBody.includes("Check your inbox")) {
    throw new RetryableLoginError(`Timed out on email verification page for ${email}`);
  }
  throw new Error(`Timed out. URL: ${page.url()}, title: ${await page.title()}`);
}

// ── Main ──

async function main(): Promise<void> {
  if (!PROXY_TOKEN) {
    console.error("Required env vars: PROXY_AUTH_TOKEN");
    console.error("Optional env vars: IMAP_USER, IMAP_PASS, IMAP_GMAIL_ACCOUNT, CSV_PATH, START_INDEX, MAX_ACCOUNTS, DELAY_MS, HEADLESS, DEBUG_DIR");
    process.exit(1);
  }

  mkdirSync(DEBUG_DIR, { recursive: true });

  console.log(`CSV: ${CSV_PATH}`);
  console.log(`Proxy: ${PROXY_BASE}`);
  console.log(`IMAP: ${IMAP_USER ? `${IMAP_USER} @ ${IMAP_HOST}` : "NOT SET (email verification will fail)"}`);
  console.log(`Headless: ${HEADLESS}`);
  console.log(`Callback mode: ${CALLBACK_MODE}`);
  console.log(`Max login attempts: ${MAX_LOGIN_ATTEMPTS}`);
  console.log(`Debug: ${DEBUG_DIR}\n`);

  const allRows = parseCsv(CSV_PATH);

  // Auto-extract Gmail IMAP credentials from the same CSV if an account was specified.
  if ((!IMAP_USER || !IMAP_PASS) && IMAP_GMAIL_ACCOUNT.length > 0) {
    const gmailCreds = extractGmailCredsFromCsv(allRows, IMAP_GMAIL_ACCOUNT);
    if (!gmailCreds) {
      throw new Error(
        `IMAP_USER/IMAP_PASS not set and could not extract credentials from CSV for ${IMAP_GMAIL_ACCOUNT}. `
        + "Set IMAP_USER/IMAP_PASS (or GMAIL_APP_EMAIL/GMAIL_APP_PASSWORD), or add a matching google.com entry to the CSV.",
      );
    }

    IMAP_USER = gmailCreds.user;
    IMAP_PASS = gmailCreds.pass;
    console.log(`IMAP credentials extracted from CSV for ${IMAP_USER}`);
  } else if (!IMAP_USER || !IMAP_PASS) {
    console.log("IMAP credentials not configured; email verification challenges will fail.");
  }

  const openAiRows = allRows.filter((r) => r.url.includes("openai.com") || r.url.includes("chatgpt.com"));
  console.log(`Found ${openAiRows.length} OpenAI accounts (${allRows.length} total in CSV)`);

  const slice = openAiRows.slice(START_INDEX, START_INDEX + MAX_ACCOUNTS);
  if (slice.length === 0) { console.log("Nothing to process."); return; }

  const seen = new Set<string>();
  const unique: CsvRow[] = [];
  for (const row of slice) {
    const key = row.username.toLowerCase();
    if (!seen.has(key)) { seen.add(key); unique.push(row); }
  }
  console.log(`Processing ${unique.length} unique accounts (index ${START_INDEX}+)\n`);

  // test IMAP connection if configured
  if (IMAP_USER && IMAP_PASS) {
    console.log("Testing IMAP connection...");
    const testClient = new ImapFlow({
      host: IMAP_HOST, port: IMAP_PORT, secure: true,
      auth: { user: IMAP_USER, pass: IMAP_PASS },
      logger: false,
    });
    await testClient.connect();
    await testClient.logout();
    console.log("IMAP connection OK\n");
  }

  const callbackServer = CALLBACK_MODE === "capture"
    ? await startCallbackServer(CALLBACK_PORT)
    : null;
  if (callbackServer) {
    console.log(`Starting callback server on :${CALLBACK_PORT}...`);
  } else {
    console.log(`Using direct proxy callback mode on :${CALLBACK_PORT}...`);
  }

  const browser = await chromium.launch({
    headless: HEADLESS,
    args: ["--disable-blink-features=AutomationControlled", "--no-sandbox"],
  });

  const results: { email: string; status: string }[] = [];

  for (let i = 0; i < unique.length; i++) {
    const row = unique[i];
    const label = `${i + 1}of${unique.length}-${sanitize(row.username)}`;
    console.log(`[${i + 1}/${unique.length}] ${row.username}`);

    let lastError = "unknown";
    let success = false;
    for (let attempt = 1; attempt <= MAX_LOGIN_ATTEMPTS && !success; attempt++) {
      if (attempt > 1) {
        console.log(`  retrying login attempt ${attempt}/${MAX_LOGIN_ATTEMPTS}...`);
      }

      callbackServer?.reset();
      const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        viewport: { width: 1280, height: 800 },
        locale: "en-US",
      });
      const page = await context.newPage();

      try {
        const { authorizeUrl } = await proxyStartBrowserOAuth();
        const callbackResult = await automateOpenAiLogin(
          page,
          authorizeUrl,
          row.username,
          row.password,
          label,
          callbackServer?.getCapture ?? null,
        );
        if (callbackResult.kind === "capture") {
          console.log(`  completing via proxy...`);
          await proxyCompleteCallback(callbackResult.code, callbackResult.state);
        }
        console.log(`  SUCCESS\n`);
        results.push({ email: row.username, status: "ok" });
        success = true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        lastError = msg;
        if (err instanceof RetryableLoginError && attempt < MAX_LOGIN_ATTEMPTS) {
          console.error(`  RETRYABLE: ${msg}`);
        } else {
          console.error(`  FAILED: ${msg}\n`);
          results.push({ email: row.username, status: `error: ${msg.slice(0, 120)}` });
        }
      } finally {
        await context.close();
      }

      if (!success && attempt < MAX_LOGIN_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    if (!success && results.at(-1)?.email !== row.username) {
      console.error(`  FAILED: ${lastError}\n`);
      results.push({ email: row.username, status: `error: ${lastError.slice(0, 120)}` });
    }

    if (i < unique.length - 1) await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  await browser.close();
  callbackServer?.server.close();

  console.log("=== RESULTS ===");
  const ok = results.filter((r) => r.status === "ok").length;
  const failed = results.filter((r) => r.status !== "ok").length;
  console.log(`Success: ${ok} | Failed: ${failed} | Total: ${results.length}`);

  if (failed > 0) {
    console.log("\nFailed:");
    for (const r of results.filter((r) => r.status !== "ok")) {
      console.log(`  ${r.email}: ${r.status}`);
    }
  }
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
