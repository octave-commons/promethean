import { randomUUID } from "node:crypto";
import { parseJwtExpiry } from "./factory-auth.js";

/**
 * Factory.ai OAuth manager — handles WorkOS-based device flow and browser flow
 * for Factory.ai authentication, following the same pattern as OpenAiOAuthManager.
 */

const WORKOS_CLIENT_ID = "client_01HNM792M5G5G1A2THWPXKFMXB";
const WORKOS_BASE_URL = "https://api.workos.com";
const WORKOS_DEVICE_AUTHORIZE_URL = `${WORKOS_BASE_URL}/user_management/authorize/device`;
const WORKOS_AUTHENTICATE_URL = `${WORKOS_BASE_URL}/user_management/authenticate`;
const WORKOS_AUTHORIZE_URL = `${WORKOS_BASE_URL}/user_management/authorize`;

const DEFAULT_DEVICE_POLL_INTERVAL_MS = 5000;
const DEFAULT_DEVICE_STATE_TTL_MS = 15 * 60 * 1000;
const DEFAULT_BROWSER_STATE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_BROWSER_COMPLETION_TTL_MS = 5 * 60 * 1000;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FactoryOAuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly accountId: string;
  readonly email?: string;
  readonly expiresAt?: number;
}

export interface FactoryDeviceAuthStartResponse {
  readonly verificationUrl: string;
  readonly userCode: string;
  readonly deviceAuthId: string;
  readonly intervalMs: number;
}

export type FactoryDevicePollResult =
  | { readonly state: "pending" }
  | { readonly state: "authorized"; readonly tokens: FactoryOAuthTokens }
  | { readonly state: "failed"; readonly reason: string };

export interface FactoryBrowserAuthStartResponse {
  readonly authorizeUrl: string;
  readonly state: string;
}

// ─── Internal State Types ───────────────────────────────────────────────────

interface WorkOsDeviceAuthResponse {
  readonly device_code: string;
  readonly user_code: string;
  readonly verification_uri: string;
  readonly verification_uri_complete: string;
  readonly expires_in: number;
  readonly interval: number;
}

interface WorkOsAuthenticateResponse {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly user?: {
    readonly id: string;
    readonly email: string;
    readonly first_name?: string;
    readonly last_name?: string;
  };
  readonly organization_id?: string;
}

interface DeviceFlowState {
  readonly createdAt: number;
  readonly intervalMs: number;
  readonly deviceCode: string;
  readonly userCode: string;
  nextPollAt: number;
  cachedResult?: FactoryDevicePollResult;
  cachedResultExpiresAt?: number;
  inFlight?: Promise<FactoryDevicePollResult>;
}

interface BrowserPendingState {
  readonly createdAt: number;
  readonly state: string;
}

interface CachedBrowserCompletion {
  readonly tokens: FactoryOAuthTokens;
  readonly expiresAt: number;
}

interface FactoryOAuthManagerOptions {
  readonly fetchFn?: typeof fetch;
  readonly now?: () => number;
  readonly deviceStateTtlMs?: number;
  readonly browserStateTtlMs?: number;
  readonly browserCompletionTtlMs?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateState(): string {
  return randomUUID();
}

function extractAccountId(tokens: WorkOsAuthenticateResponse): string {
  if (tokens.user?.id) {
    return `factory-${tokens.user.id}`;
  }
  return `factory-${randomUUID()}`;
}

function toFactoryOAuthTokens(tokens: WorkOsAuthenticateResponse): FactoryOAuthTokens {
  const expiresAt = parseJwtExpiry(tokens.access_token) ?? undefined;
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    accountId: extractAccountId(tokens),
    email: tokens.user?.email,
    expiresAt,
  };
}

// ─── Manager ────────────────────────────────────────────────────────────────

export class FactoryOAuthManager {
  private readonly deviceFlows = new Map<string, DeviceFlowState>();
  private readonly browserPending = new Map<string, BrowserPendingState>();
  private readonly browserCompletions = new Map<string, CachedBrowserCompletion>();
  private readonly browserInFlight = new Map<string, Promise<FactoryOAuthTokens>>();
  private readonly fetchFn: typeof fetch;
  private readonly now: () => number;
  private readonly deviceStateTtlMs: number;
  private readonly browserStateTtlMs: number;
  private readonly browserCompletionTtlMs: number;

  public constructor(options: FactoryOAuthManagerOptions = {}) {
    this.fetchFn = options.fetchFn ?? fetch;
    this.now = options.now ?? (() => Date.now());
    this.deviceStateTtlMs = options.deviceStateTtlMs ?? DEFAULT_DEVICE_STATE_TTL_MS;
    this.browserStateTtlMs = options.browserStateTtlMs ?? DEFAULT_BROWSER_STATE_TTL_MS;
    this.browserCompletionTtlMs = options.browserCompletionTtlMs ?? DEFAULT_BROWSER_COMPLETION_TTL_MS;
  }

  // ─── Device Flow ────────────────────────────────────────────────────────

  /**
   * Start the WorkOS device authorization flow.
   *
   * POST https://api.workos.com/user_management/authorize/device
   * Body: client_id=...
   * Returns: { device_code, user_code, verification_uri, verification_uri_complete, expires_in, interval }
   */
  public async startDeviceFlow(): Promise<FactoryDeviceAuthStartResponse> {
    this.pruneState();

    const response = await this.fetchFn(WORKOS_DEVICE_AUTHORIZE_URL, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: WORKOS_CLIENT_ID,
      }).toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WorkOS device authorization failed: ${response.status} ${errorText}`);
    }

    const payload = (await response.json()) as WorkOsDeviceAuthResponse;
    const intervalSeconds = payload.interval;
    const intervalMs = Number.isFinite(intervalSeconds) && intervalSeconds > 0
      ? intervalSeconds * 1000
      : DEFAULT_DEVICE_POLL_INTERVAL_MS;

    const deviceAuthId = randomUUID();
    this.deviceFlows.set(deviceAuthId, {
      createdAt: this.now(),
      intervalMs,
      deviceCode: payload.device_code,
      userCode: payload.user_code,
      nextPollAt: 0,
    });

    return {
      verificationUrl: payload.verification_uri_complete || payload.verification_uri,
      userCode: payload.user_code,
      deviceAuthId,
      intervalMs,
    };
  }

  /**
   * Poll the WorkOS authenticate endpoint for the device flow completion.
   *
   * POST https://api.workos.com/user_management/authenticate
   * Body: grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=...&client_id=...
   */
  public async pollDeviceFlow(deviceAuthId: string): Promise<FactoryDevicePollResult> {
    this.pruneState();

    const deviceFlow = this.deviceFlows.get(deviceAuthId);
    if (!deviceFlow) {
      return { state: "failed", reason: "Unknown or expired device authorization" };
    }

    const now = this.now();
    if (deviceFlow.cachedResult && typeof deviceFlow.cachedResultExpiresAt === "number" && deviceFlow.cachedResultExpiresAt > now) {
      return deviceFlow.cachedResult;
    }

    if (deviceFlow.inFlight) {
      return deviceFlow.inFlight;
    }

    if (now < deviceFlow.nextPollAt) {
      return { state: "pending" };
    }

    const pollPromise = this.pollDeviceFlowUncached(deviceAuthId, deviceFlow)
      .finally(() => {
        const latest = this.deviceFlows.get(deviceAuthId);
        if (latest) {
          latest.inFlight = undefined;
        }
      });

    deviceFlow.inFlight = pollPromise;
    return pollPromise;
  }

  private async pollDeviceFlowUncached(
    deviceAuthId: string,
    deviceFlow: DeviceFlowState,
  ): Promise<FactoryDevicePollResult> {
    const response = await this.fetchFn(WORKOS_AUTHENTICATE_URL, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        device_code: deviceFlow.deviceCode,
        client_id: WORKOS_CLIENT_ID,
      }).toString(),
    });

    if (response.ok) {
      const tokens = (await response.json()) as WorkOsAuthenticateResponse;
      const result: FactoryDevicePollResult = {
        state: "authorized",
        tokens: toFactoryOAuthTokens(tokens),
      };
      deviceFlow.cachedResult = result;
      deviceFlow.cachedResultExpiresAt = this.now() + this.deviceStateTtlMs;
      return result;
    }

    let errorPayload: { error?: string } = {};
    try {
      errorPayload = (await response.json()) as { error?: string };
    } catch {
      // Ignore parse errors
    }

    if (errorPayload.error === "authorization_pending") {
      deviceFlow.nextPollAt = this.now() + deviceFlow.intervalMs;
      return { state: "pending" };
    }

    if (errorPayload.error === "slow_down") {
      // Increase interval by 1 second per spec
      const updatedFlow = this.deviceFlows.get(deviceAuthId);
      if (updatedFlow) {
        this.deviceFlows.set(deviceAuthId, {
          ...updatedFlow,
          intervalMs: updatedFlow.intervalMs + 1000,
          nextPollAt: this.now() + updatedFlow.intervalMs + 1000,
          inFlight: undefined,
        });
      }
      return { state: "pending" };
    }

    if (errorPayload.error === "expired_token" || errorPayload.error === "access_denied") {
      this.deviceFlows.delete(deviceAuthId);
      return { state: "failed", reason: `Device authorization ${errorPayload.error}` };
    }

    return {
      state: "failed",
      reason: `WorkOS device poll failed: ${response.status} ${errorPayload.error ?? "unknown error"}`,
    };
  }

  // ─── Browser Flow ───────────────────────────────────────────────────────

  /**
   * Start the WorkOS browser (authorization code) flow.
   *
   * Generates a state parameter and builds the authorization URL for the
   * WorkOS hosted AuthKit login page.
   */
  public startBrowserFlow(redirectUri: string): FactoryBrowserAuthStartResponse {
    this.pruneState();

    const state = generateState();
    this.browserPending.set(state, {
      createdAt: this.now(),
      state,
    });

    const params = new URLSearchParams({
      client_id: WORKOS_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      state,
    });

    return {
      authorizeUrl: `${WORKOS_AUTHORIZE_URL}?${params.toString()}`,
      state,
    };
  }

  /**
   * Complete the browser flow by exchanging the authorization code for tokens.
   *
   * POST https://api.workos.com/user_management/authenticate
   * Body: grant_type=authorization_code&code=...&client_id=...
   */
  public async completeBrowserFlow(state: string, code: string): Promise<FactoryOAuthTokens> {
    this.pruneState();

    const cachedCompletion = this.browserCompletions.get(state);
    if (cachedCompletion && cachedCompletion.expiresAt > this.now()) {
      return cachedCompletion.tokens;
    }

    const inFlightCompletion = this.browserInFlight.get(state);
    if (inFlightCompletion) {
      return inFlightCompletion;
    }

    const pending = this.browserPending.get(state);
    if (!pending) {
      throw new Error("Unknown or expired OAuth state");
    }

    this.browserPending.delete(state);

    const completion = this.exchangeAuthorizationCode(code)
      .then((tokens) => {
        this.browserCompletions.set(state, {
          tokens,
          expiresAt: this.now() + this.browserCompletionTtlMs,
        });
        return tokens;
      })
      .finally(() => {
        this.browserInFlight.delete(state);
      });

    this.browserInFlight.set(state, completion);
    return completion;
  }

  private async exchangeAuthorizationCode(code: string): Promise<FactoryOAuthTokens> {
    const response = await this.fetchFn(WORKOS_AUTHENTICATE_URL, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: WORKOS_CLIENT_ID,
      }).toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WorkOS token exchange failed: ${response.status} ${errorText}`);
    }

    const tokens = (await response.json()) as WorkOsAuthenticateResponse;
    return toFactoryOAuthTokens(tokens);
  }

  // ─── State Pruning ──────────────────────────────────────────────────────

  private pruneState(): void {
    const deviceCutoff = this.now() - this.deviceStateTtlMs;
    for (const [deviceAuthId, deviceFlow] of this.deviceFlows.entries()) {
      if (deviceFlow.createdAt < deviceCutoff && !deviceFlow.inFlight) {
        this.deviceFlows.delete(deviceAuthId);
      }
    }

    const browserCutoff = this.now() - this.browserStateTtlMs;
    for (const [state, pending] of this.browserPending.entries()) {
      if (pending.createdAt < browserCutoff) {
        this.browserPending.delete(state);
      }
    }

    const browserCompletionNow = this.now();
    for (const [state, completion] of this.browserCompletions.entries()) {
      if (completion.expiresAt <= browserCompletionNow) {
        this.browserCompletions.delete(state);
      }
    }
  }
}
