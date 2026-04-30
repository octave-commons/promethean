import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  addApiKeyCredential,
  getApiOrigin,
  getOpenAiCredentialQuota,
  listCredentials,
  listRequestLogs,
  pollFactoryDeviceOAuth,
  pollOpenAiDeviceOAuth,
  type CredentialAccount,
  type CredentialProvider,
  type CredentialQuotaAccountSummary,
  type CredentialQuotaOverview,
  type CredentialQuotaWindow,
  type KeyPoolStatus,
  type ProviderRequestLogSummary,
  type RequestLogEntry,
  removeCredential,
  startFactoryBrowserOAuth,
  startFactoryDeviceOAuth,
  startOpenAiBrowserOAuth,
  startOpenAiDeviceOAuth,
} from "../lib/api";
import { formatAuthType } from "../lib/format";
import { useStoredState } from "../lib/use-stored-state";

interface DeviceAuthState {
  readonly provider: "openai" | "factory";
  readonly verificationUrl: string;
  readonly userCode: string;
  readonly deviceAuthId: string;
  readonly intervalMs: number;
}

const LS_CREDENTIALS_REVEAL_SECRETS = "open-hax-proxy.ui.credentials.revealSecrets";
const LS_CREDENTIALS_GROUPING = "open-hax-proxy.ui.credentials.grouping";
const LS_CREDENTIALS_ACCOUNT_SEARCH = "open-hax-proxy.ui.credentials.accountSearch";
const LS_CREDENTIALS_LOG_PROVIDER = "open-hax-proxy.ui.credentials.logProvider";
const LS_CREDENTIALS_LOG_ACCOUNT = "open-hax-proxy.ui.credentials.logAccount";

function validateBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  // Backwards compat: older versions might store as strings.
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
      return false;
    }
  }

  return undefined;
}

function validateString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function validateAccountGrouping(value: unknown): AccountGrouping | undefined {
  return value === "provider" || value === "plan" || value === "domain" ? value : undefined;
}

type AccountGrouping = "provider" | "plan" | "domain";

interface AccountEntry {
  readonly providerId: string;
  readonly providerAuthType: CredentialProvider["authType"];
  readonly account: CredentialAccount;
}

function compactMiddle(value: string, head: number = 8, tail: number = 6): string {
  if (value.length <= head + tail + 1) {
    return value;
  }

  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

function titleCasePlan(planType?: string): string | null {
  if (!planType) {
    return null;
  }

  return planType
    .split(/[-_\s]+/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatExpiryBadge(expiresAt?: number): string | null {
  if (typeof expiresAt !== "number") {
    return null;
  }

  return new Date(expiresAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatQuotaTimestamp(value?: string | null): string {
  return value ? new Date(value).toLocaleString() : "never";
}

function formatResetSummary(window: CredentialQuotaWindow | null): string | null {
  if (!window) {
    return null;
  }

  const seconds = typeof window.resetAfterSeconds === "number"
    ? Math.max(0, Math.round(window.resetAfterSeconds))
    : window.resetsAt
      ? Math.max(0, Math.round((new Date(window.resetsAt).getTime() - Date.now()) / 1000))
      : null;

  if (seconds === null) {
    return null;
  }

  if (seconds >= 24 * 60 * 60) {
    const date = window.resetsAt ? new Date(window.resetsAt) : null;
    return date ? `resets ${date.toLocaleString()}` : `resets in ${Math.floor(seconds / 86400)}d`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `resets in ${hours}h ${minutes}m`;
  }

  return `resets in ${minutes}m`;
}

function quotaToneClass(remainingPercent: number | null): string {
  if (remainingPercent === null) {
    return "credentials-quota-fill-neutral";
  }

  if (remainingPercent <= 15) {
    return "credentials-quota-fill-danger";
  }

  if (remainingPercent <= 40) {
    return "credentials-quota-fill-warn";
  }

  return "credentials-quota-fill-good";
}

function formatServiceTier(entry: RequestLogEntry): string {
  if (!entry.serviceTier) {
    return "standard";
  }

  if (entry.serviceTierSource === "fast_mode") {
    return "fast mode";
  }

  if (entry.serviceTier === "priority") {
    return "priority";
  }

  return entry.serviceTier.replace(/[_-]+/g, " ");
}

function sortAccounts(accounts: readonly CredentialAccount[]): CredentialAccount[] {
  return [...accounts].sort((left, right) => {
    const leftLabel = (left.email ?? left.displayName ?? left.id).toLowerCase();
    const rightLabel = (right.email ?? right.displayName ?? right.id).toLowerCase();
    return leftLabel.localeCompare(rightLabel);
  });
}



function getEmailDomain(email?: string): string | null {
  if (!email) {
    return null;
  }

  const atIndex = email.lastIndexOf("@");
  if (atIndex < 0 || atIndex === email.length - 1) {
    return null;
  }

  return email.slice(atIndex + 1).toLowerCase();
}

function accountSearchBlob(entry: AccountEntry): string {
  const planLabel = titleCasePlan(entry.account.planType) ?? "";
  const emailDomain = getEmailDomain(entry.account.email) ?? "";

  return [
    entry.providerId,
    entry.account.id,
    entry.account.displayName,
    entry.account.email,
    entry.account.subject,
    entry.account.chatgptAccountId,
    entry.account.planType,
    planLabel,
    emailDomain,
    entry.account.secretPreview,
    formatAuthType(entry.account.authType),
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join("\n")
    .toLowerCase();
}

export function CredentialsPage(): JSX.Element {
  // NOTE: Persisting revealSecrets can be risky on shared machines; you asked
  // for persistence so we do it, but it will auto-load on refresh.
  const [revealSecrets, setRevealSecrets] = useStoredState(LS_CREDENTIALS_REVEAL_SECRETS, false, validateBoolean);
  const [providers, setProviders] = useState<CredentialProvider[]>([]);
  const [keyPoolStatuses, setKeyPoolStatuses] = useState<Record<string, KeyPoolStatus>>({});
  const [requestLogSummary, setRequestLogSummary] = useState<Record<string, ProviderRequestLogSummary>>({});
  const [logs, setLogs] = useState<RequestLogEntry[]>([]);
  const [selectedProvider, setSelectedProvider] = useStoredState(LS_CREDENTIALS_LOG_PROVIDER, "", validateString);
  const [selectedAccount, setSelectedAccount] = useStoredState(LS_CREDENTIALS_LOG_ACCOUNT, "", validateString);
  const [apiKeyProvider, setApiKeyProvider] = useState("vivgrid");
  const [apiKeyAccount, setApiKeyAccount] = useState("");
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [deviceAuth, setDeviceAuth] = useState<DeviceAuthState | null>(null);
  const [devicePolling, setDevicePolling] = useState(false);
  const [accountSearch, setAccountSearch] = useStoredState(LS_CREDENTIALS_ACCOUNT_SEARCH, "", validateString);
  const [accountGrouping, setAccountGrouping] = useStoredState<AccountGrouping>(LS_CREDENTIALS_GROUPING, "provider", validateAccountGrouping);
  const [quotaOverview, setQuotaOverview] = useState<CredentialQuotaOverview | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [copiedFieldKey, setCopiedFieldKey] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const browserOAuthWatchRef = useRef<number | null>(null);
  const copyResetTimerRef = useRef<number | null>(null);
  const hasLoadedQuotaRef = useRef(false);
  const devicePollingRef = useRef(false);

  const refreshCredentials = useCallback(async () => {
    const payload = await listCredentials(revealSecrets);
    setProviders(payload.providers);
    setKeyPoolStatuses(payload.keyPoolStatuses);
    setRequestLogSummary(payload.requestLogSummary);
  }, [revealSecrets]);

  const refreshLogs = useCallback(async () => {
    const entries = await listRequestLogs({
      providerId: selectedProvider || undefined,
      accountId: selectedAccount || undefined,
      limit: 250,
    });
    setLogs(entries);
  }, [selectedAccount, selectedProvider]);

  const refreshQuota = useCallback(async () => {
    setQuotaLoading(true);
    setQuotaError(null);

    try {
      const nextQuota = await getOpenAiCredentialQuota();
      setQuotaOverview(nextQuota);
    } catch (nextError) {
      setQuotaError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setQuotaLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCredentials().catch((nextError) => {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    });
  }, [refreshCredentials]);

  useEffect(() => {
    void refreshLogs().catch((nextError) => {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    });
  }, [refreshLogs]);

  useEffect(() => {
    if (hasLoadedQuotaRef.current || providers.length === 0) {
      return;
    }

    hasLoadedQuotaRef.current = true;
    void refreshQuota();
  }, [providers.length, refreshQuota]);

  useEffect(() => {
    return () => {
      if (browserOAuthWatchRef.current !== null) {
        window.clearInterval(browserOAuthWatchRef.current);
        browserOAuthWatchRef.current = null;
      }

      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current);
        copyResetTimerRef.current = null;
      }
    };
  }, []);

  const allAccountIds = useMemo(() => {
    const ids = new Set<string>();
    for (const provider of providers) {
      for (const account of provider.accounts) {
        ids.add(account.id);
      }
    }
    return [...ids].sort();
  }, [providers]);

  const sortedProviders = useMemo(() => {
    return [...providers]
      .map((provider) => ({
        ...provider,
        accounts: sortAccounts(provider.accounts),
      }))
      .sort((left, right) => left.id.localeCompare(right.id));
  }, [providers]);

  const flatAccounts = useMemo<AccountEntry[]>(() => {
    return sortedProviders.flatMap((provider) =>
      provider.accounts.map((account) => ({
        providerId: provider.id,
        providerAuthType: provider.authType,
        account,
      })),
    );
  }, [sortedProviders]);

  const quotaByAccount = useMemo(() => {
    const entries = new Map<string, CredentialQuotaAccountSummary>();
    for (const account of quotaOverview?.accounts ?? []) {
      entries.set(`${account.providerId}:${account.accountId}`, account);
    }
    return entries;
  }, [quotaOverview]);

  const normalizedAccountSearch = accountSearch.trim().toLowerCase();

  const filteredAccounts = useMemo(() => {
    if (normalizedAccountSearch.length === 0) {
      return flatAccounts;
    }

    return flatAccounts.filter((entry) => accountSearchBlob(entry).includes(normalizedAccountSearch));
  }, [flatAccounts, normalizedAccountSearch]);

  const filteredProviders = useMemo(() => {
    const accountsByProvider = new Map<string, CredentialAccount[]>();
    for (const entry of filteredAccounts) {
      const current = accountsByProvider.get(entry.providerId) ?? [];
      current.push(entry.account);
      accountsByProvider.set(entry.providerId, current);
    }

    return sortedProviders
      .map((provider) => ({
        ...provider,
        accounts: sortAccounts(accountsByProvider.get(provider.id) ?? []),
      }))
      .filter((provider) => provider.accounts.length > 0);
  }, [filteredAccounts, sortedProviders]);

  const groupedAccountSections = useMemo(() => {
    if (accountGrouping === "provider") {
      return filteredProviders.map((provider) => ({
        key: provider.id,
        title: provider.id,
        description:
          provider.accounts.length === provider.accountCount
            ? `${provider.accountCount} account(s) connected`
            : `${provider.accounts.length} of ${provider.accountCount} account(s) shown`,
        badge: formatAuthType(provider.authType),
        badgeMuted: `${provider.accounts.length} shown`,
        accounts: provider.accounts.map((account) => ({
          providerId: provider.id,
          providerAuthType: provider.authType,
          account,
        })),
      }));
    }

    const groups = new Map<string, { title: string; description: string; accounts: AccountEntry[] }>();

    for (const entry of filteredAccounts) {
      const domain = getEmailDomain(entry.account.email);
      const planLabel = titleCasePlan(entry.account.planType);
      const key = accountGrouping === "plan"
        ? `plan:${entry.account.planType ?? "__none__"}`
        : `domain:${domain ?? "__none__"}`;
      const title = accountGrouping === "plan"
        ? (planLabel ?? "No plan")
        : (domain ?? "No email domain");
      const description = accountGrouping === "plan" ? "Plan grouping" : "Email domain grouping";
      const current = groups.get(key) ?? { title, description, accounts: [] };
      current.accounts.push(entry);
      groups.set(key, current);
    }

    return [...groups.entries()]
      .map(([key, value]) => ({
        key,
        title: value.title,
        description: `${value.accounts.length} account(s) · ${value.description}`,
        badge: accountGrouping === "plan" ? "Plan" : "Domain",
        badgeMuted: `${value.accounts.length} shown`,
        accounts: value.accounts.sort((left, right) => {
          const leftLabel = (left.account.email ?? left.account.displayName ?? left.account.id).toLowerCase();
          const rightLabel = (right.account.email ?? right.account.displayName ?? right.account.id).toLowerCase();
          return leftLabel.localeCompare(rightLabel);
        }),
      }))
      .sort((left, right) => {
        if (left.title.startsWith("No ") && !right.title.startsWith("No ")) {
          return 1;
        }
        if (!left.title.startsWith("No ") && right.title.startsWith("No ")) {
          return -1;
        }
        return left.title.localeCompare(right.title);
      });
  }, [accountGrouping, filteredAccounts, filteredProviders]);

  const providerHealth = useMemo(() => {
    const providerIds = new Set<string>([
      ...providers.map((provider) => provider.id),
      ...Object.keys(keyPoolStatuses),
      ...Object.keys(requestLogSummary),
    ]);

    return [...providerIds].sort().map((providerId) => ({
      providerId,
      keyPool: keyPoolStatuses[providerId],
      logs: requestLogSummary[providerId],
    }));
  }, [keyPoolStatuses, providers, requestLogSummary]);

  const handleApiKeySubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      if (apiKeyValue.trim().length === 0) {
        throw new Error("API key value is required");
      }

      const accountId = apiKeyAccount.trim().length > 0 ? apiKeyAccount.trim() : `${apiKeyProvider}-manual`;
      await addApiKeyCredential(apiKeyProvider.trim(), accountId, apiKeyValue.trim());
      setApiKeyValue("");
      setStatus("API key saved.");
      await refreshCredentials();
      await refreshQuota();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : String(submitError));
    }
  };

  const startBrowserOAuth = async () => {
    setError(null);

    try {
      const payload = await startOpenAiBrowserOAuth(getApiOrigin());
      const popup = window.open(payload.authorizeUrl, "openai-oauth");

      if (!popup) {
        throw new Error("Browser blocked popup. Allow popups and try again.");
      }

      if (browserOAuthWatchRef.current !== null) {
        window.clearInterval(browserOAuthWatchRef.current);
        browserOAuthWatchRef.current = null;
      }

      browserOAuthWatchRef.current = window.setInterval(() => {
        if (!popup.closed) {
          return;
        }

        if (browserOAuthWatchRef.current !== null) {
          window.clearInterval(browserOAuthWatchRef.current);
          browserOAuthWatchRef.current = null;
        }

        void refreshCredentials();
        void refreshQuota();
        setStatus("Browser OAuth flow finished. Credentials refreshed.");
      }, 750);

      setStatus("Browser OAuth window opened. Finish sign-in to save credentials.");
    } catch (oauthError) {
      setError(oauthError instanceof Error ? oauthError.message : String(oauthError));
    }
  };

  const startDeviceOAuth = async () => {
    setError(null);

    try {
      const payload = await startOpenAiDeviceOAuth();
      setDeviceAuth({ ...payload, provider: "openai" });
      setStatus(`Device auth started. Enter code ${payload.userCode}; polling continues automatically.`);
    } catch (oauthError) {
      setError(oauthError instanceof Error ? oauthError.message : String(oauthError));
    }
  };

  const pollDeviceOAuth = useCallback(async () => {
    if (!deviceAuth || devicePollingRef.current) {
      return;
    }

    devicePollingRef.current = true;
    setDevicePolling(true);
    setError(null);

    try {
      const result = deviceAuth.provider === "factory"
        ? await pollFactoryDeviceOAuth(deviceAuth.deviceAuthId)
        : await pollOpenAiDeviceOAuth(deviceAuth.deviceAuthId, deviceAuth.userCode);
      if (result.state === "pending") {
        setStatus("Authorization is still pending.");
        return;
      }

      if (result.state === "failed") {
        setError(result.reason ?? "OAuth device poll failed");
        return;
      }

      const providerLabel = deviceAuth.provider === "factory" ? "Factory.ai" : "OpenAI";
      setStatus(`${providerLabel} OAuth account saved from device flow.`);
      setDeviceAuth(null);
      await refreshCredentials();
      await refreshQuota();
    } catch (pollError) {
      setError(pollError instanceof Error ? pollError.message : String(pollError));
    } finally {
      devicePollingRef.current = false;
      setDevicePolling(false);
    }
  }, [deviceAuth, refreshCredentials, refreshQuota]);

  useEffect(() => {
    if (!deviceAuth) {
      return;
    }

    const intervalMs = Math.max(deviceAuth.intervalMs + 3000, 3000);
    const timer = window.setInterval(() => {
      void pollDeviceOAuth();
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [deviceAuth, pollDeviceOAuth]);

  const startFactoryBrowser = async () => {
    setError(null);

    try {
      const payload = await startFactoryBrowserOAuth(getApiOrigin());
      const popup = window.open(payload.authorizeUrl, "factory-oauth", "popup=yes,width=560,height=720");

      if (!popup) {
        throw new Error("Browser blocked popup. Allow popups and try again.");
      }

      if (browserOAuthWatchRef.current !== null) {
        window.clearInterval(browserOAuthWatchRef.current);
        browserOAuthWatchRef.current = null;
      }

      browserOAuthWatchRef.current = window.setInterval(() => {
        if (!popup.closed) {
          return;
        }

        if (browserOAuthWatchRef.current !== null) {
          window.clearInterval(browserOAuthWatchRef.current);
          browserOAuthWatchRef.current = null;
        }

        void refreshCredentials();
        setStatus("Factory.ai browser OAuth flow finished. Credentials refreshed.");
      }, 750);

      setStatus("Factory.ai browser OAuth window opened. Finish sign-in to save credentials.");
    } catch (oauthError) {
      setError(oauthError instanceof Error ? oauthError.message : String(oauthError));
    }
  };

  const startFactoryDevice = async () => {
    setError(null);

    try {
      const payload = await startFactoryDeviceOAuth();
      setDeviceAuth({ ...payload, provider: "factory" });
      setStatus(`Factory.ai device auth started. Enter code ${payload.userCode}; polling continues automatically.`);
    } catch (oauthError) {
      setError(oauthError instanceof Error ? oauthError.message : String(oauthError));
    }
  };

  const handleAddFactoryKey = () => {
    setApiKeyProvider("factory");
    setApiKeyAccount("");
    setApiKeyValue("");
  };

  const handleCopyField = useCallback(async (value: string, fieldKey: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedFieldKey(fieldKey);

      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current);
      }

      copyResetTimerRef.current = window.setTimeout(() => {
        setCopiedFieldKey((current) => (current === fieldKey ? null : current));
        copyResetTimerRef.current = null;
      }, 1200);
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : String(copyError));
    }
  }, []);

  const handleRemoveAccount = useCallback(async (providerId: string, accountId: string, displayName: string) => {
    if (!window.confirm(`Remove credential "${displayName}" (${providerId}/${accountId})?`)) {
      return;
    }

    setError(null);

    try {
      await removeCredential(providerId, accountId);
      setStatus(`Removed credential ${displayName}.`);
      await refreshCredentials();
      await refreshQuota();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : String(removeError));
    }
  }, [refreshCredentials, refreshQuota]);

  const renderQuotaRow = (label: string, window: CredentialQuotaWindow | null) => {
    const remainingPercent = window?.remainingPercent ?? null;
    const width = remainingPercent === null ? 0 : Math.min(100, Math.max(0, remainingPercent));
    const percentLabel = remainingPercent === null ? "No data" : `${Math.round(remainingPercent)}% left`;
    const resetLabel = formatResetSummary(window);

    return (
      <div key={label} className="credentials-quota-row">
        <div className="credentials-quota-row-header">
          <span>{label}</span>
          <strong>{percentLabel}</strong>
        </div>
        <div className="credentials-quota-bar">
          <span
            className={`credentials-quota-fill ${quotaToneClass(remainingPercent)}`}
            style={{ width: `${width}%` }}
          />
        </div>
        {resetLabel && <small>{resetLabel}</small>}
      </div>
    );
  };

  const renderAccountTile = (entry: AccountEntry, showProviderBadge: boolean) => {
    const { account, providerId } = entry;
    const quota = quotaByAccount.get(`${providerId}:${account.id}`);
    const planLabel = titleCasePlan(quota?.planType ?? account.planType);
    const expiryLabel = formatExpiryBadge(account.expiresAt);
    const visibleToken = revealSecrets ? account.secret : account.secretPreview;
    const visibleRefresh = revealSecrets ? account.refreshToken : account.refreshTokenPreview;
    const workspaceCopyKey = `${providerId}:${account.id}:workspace`;
    const internalCopyKey = `${providerId}:${account.id}:internal`;
    const shouldShowQuota = (providerId === "openai" && account.authType === "oauth_bearer") || Boolean(quota);

    return (
      <article key={`${providerId}:${account.id}`} className="credentials-account-tile">
        <header className="credentials-account-header">
          <div className="credentials-account-title-wrap">
            <strong>{account.displayName}</strong>
            {account.email && account.email !== account.displayName && (
              <span className="credentials-account-subtitle">{account.email}</span>
            )}
          </div>
          <div className="credentials-provider-badges">
            {showProviderBadge && <span className="credentials-badge credentials-badge-muted">{providerId}</span>}
            {planLabel && <span className="credentials-badge credentials-badge-accent">{planLabel}</span>}
            <span className="credentials-badge credentials-badge-muted">{formatAuthType(account.authType)}</span>
          </div>
        </header>

        <div className="credentials-account-chip-row">
          {account.chatgptAccountId && (
            <span className="credentials-chip">workspace {compactMiddle(account.chatgptAccountId)}</span>
          )}
          {expiryLabel && <span className="credentials-chip">expires {expiryLabel}</span>}
          <span className="credentials-chip">token {account.secretPreview}</span>
        </div>

        {shouldShowQuota && (
          <section className="credentials-quota-card">
            <header className="credentials-quota-card-header">
              <strong>Codex quota</strong>
              <span>{quota ? `Updated ${formatQuotaTimestamp(quota.fetchedAt)}` : quotaLoading ? "Refreshing…" : "Not loaded"}</span>
            </header>
            {quota?.status === "ok" ? (
              <div className="credentials-quota-list">
                {renderQuotaRow("Rolling 5h", quota.fiveHour)}
                {renderQuotaRow("Weekly", quota.weekly)}
              </div>
            ) : quota?.status === "error" ? (
              <p className="credentials-quota-note credentials-quota-note-error">{quota.error ?? "Quota unavailable"}</p>
            ) : (
              <p className="credentials-quota-note">
                {quotaLoading ? "Loading current Codex quota…" : "Refresh Codex quotas to load live 5h and weekly usage."}
              </p>
            )}
          </section>
        )}

        <details className="credentials-account-details">
          <summary>Details</summary>
          <dl className="credentials-account-detail-list">
            <div className="credentials-account-detail-item credentials-account-detail-item-copyable">
              <div>
                <dt>Internal ID</dt>
                <dd>{account.id}</dd>
              </div>
              <button type="button" onClick={() => void handleCopyField(account.id, internalCopyKey)}>
                {copiedFieldKey === internalCopyKey ? "Copied" : "Copy"}
              </button>
            </div>
            {account.chatgptAccountId && (
              <div className="credentials-account-detail-item credentials-account-detail-item-copyable">
                <div>
                  <dt>Workspace</dt>
                  <dd>{account.chatgptAccountId}</dd>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopyField(account.chatgptAccountId ?? "", workspaceCopyKey)}
                >
                  {copiedFieldKey === workspaceCopyKey ? "Copied" : "Copy"}
                </button>
              </div>
            )}
            <div className="credentials-account-detail-item">
              <dt>Provider</dt>
              <dd>{providerId}</dd>
            </div>
            {quota && (
              <div className="credentials-account-detail-item">
                <dt>Quota refreshed</dt>
                <dd>{formatQuotaTimestamp(quota.fetchedAt)}</dd>
              </div>
            )}
            {account.subject && (
              <div className="credentials-account-detail-item">
                <dt>Subject</dt>
                <dd>{account.subject}</dd>
              </div>
            )}
            <div className="credentials-account-detail-item">
              <dt>Access token</dt>
              <dd>{visibleToken}</dd>
            </div>
            {visibleRefresh && (
              <div className="credentials-account-detail-item">
                <dt>Refresh token</dt>
                <dd>{visibleRefresh}</dd>
              </div>
            )}
            {typeof account.expiresAt === "number" && (
              <div className="credentials-account-detail-item">
                <dt>Expires</dt>
                <dd>{new Date(account.expiresAt).toLocaleString()}</dd>
              </div>
            )}
          </dl>
          <button
            type="button"
            className="credentials-remove-button"
            onClick={() => void handleRemoveAccount(providerId, account.id, account.displayName)}
          >
            Remove credential
          </button>
        </details>
      </article>
    );
  };

  return (
    <div className="credentials-layout">
      <section className="credentials-panel">
        <header>
          <h2>Credentials Manager</h2>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={revealSecrets}
              onChange={(event) => setRevealSecrets(event.currentTarget.checked)}
            />
            Reveal secrets
          </label>
        </header>

        <div className="credentials-toolbar">
          <input
            value={accountSearch}
            onChange={(event) => setAccountSearch(event.currentTarget.value)}
            placeholder="Search accounts, emails, plans, workspace IDs"
          />
          <label className="credentials-inline-control">
            <span>Group by</span>
            <select
              value={accountGrouping}
              onChange={(event) => setAccountGrouping(event.currentTarget.value as AccountGrouping)}
            >
              <option value="provider">Provider</option>
              <option value="plan">Plan</option>
              <option value="domain">Email domain</option>
            </select>
          </label>
          <button type="button" onClick={() => void refreshQuota()} disabled={quotaLoading}>
            {quotaLoading ? "Refreshing Codex quotas..." : "Refresh Codex quotas"}
          </button>
        </div>

        <div className="credentials-toolbar-meta-stack">
          <p className="credentials-toolbar-meta">
            Showing {filteredAccounts.length} of {flatAccounts.length} account(s)
          </p>
          <p className="credentials-toolbar-meta">
            {quotaOverview ? `Codex quotas updated ${formatQuotaTimestamp(quotaOverview.generatedAt)}` : "Codex quotas not loaded yet"}
          </p>
        </div>

        {quotaError && <p className="error-text">{quotaError}</p>}

        {groupedAccountSections.length > 0 ? (
          <div className="credentials-provider-stack">
            {groupedAccountSections.map((section) => (
              <article key={section.key} className="credentials-card credentials-provider-card">
                <header className="credentials-provider-header">
                  <div>
                    <h3>{section.title}</h3>
                    <p>{section.description}</p>
                  </div>
                  <div className="credentials-provider-badges">
                    <span className="credentials-badge credentials-badge-muted">{section.badge}</span>
                    <span className="credentials-badge">{section.badgeMuted}</span>
                  </div>
                </header>

                <div className="credentials-account-grid">
                  {section.accounts.map((entry) => renderAccountTile(entry, accountGrouping !== "provider"))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <article className="credentials-card">
            <p>No credential accounts match the current filter.</p>
          </article>
        )}

        <div className="credentials-provider-grid">
          {providerHealth.map((provider) => (
            <article key={`health-${provider.providerId}`} className="credentials-card">
              <h3>{provider.providerId}</h3>
              <p>Recent logs: {provider.logs?.count ?? 0}</p>
              {provider.logs && <p>Last request: {new Date(provider.logs.lastTimestamp).toLocaleString()}</p>}
              {provider.keyPool ? (
                <>
                  <p>Accounts ready: {provider.keyPool.availableAccounts}/{provider.keyPool.totalAccounts}</p>
                  <p>Cooldown accounts: {provider.keyPool.cooldownAccounts}</p>
                </>
              ) : (
                <p>No key pool status yet.</p>
              )}
            </article>
          ))}
        </div>

        <form className="credentials-form" onSubmit={(event) => void handleApiKeySubmit(event)}>
          <h3>Add API key account</h3>
          <div className="credentials-form-shortcuts">
            <button type="button" onClick={handleAddFactoryKey} className="credentials-shortcut-button">
              Add Factory Key
            </button>
          </div>
          <input
            value={apiKeyProvider}
            onChange={(event) => setApiKeyProvider(event.currentTarget.value)}
            placeholder="provider id"
          />
          <input
            value={apiKeyAccount}
            onChange={(event) => setApiKeyAccount(event.currentTarget.value)}
            placeholder="account id"
          />
          <input
            type="password"
            value={apiKeyValue}
            onChange={(event) => setApiKeyValue(event.currentTarget.value)}
            placeholder="api key"
          />
          <button type="submit">Save API key</button>
        </form>

        <div className="credentials-oauth">
          <h3>OpenAI OAuth</h3>
          <div className="credentials-oauth-row">
            <button type="button" onClick={() => void startBrowserOAuth()}>
              Start browser flow
            </button>
            <button type="button" onClick={() => void startDeviceOAuth()}>
              Start device flow
            </button>
            <button type="button" onClick={() => void pollDeviceOAuth()} disabled={!deviceAuth || deviceAuth.provider !== "openai"}>
              {devicePolling && deviceAuth?.provider === "openai" ? "Polling..." : "Poll device flow"}
            </button>
          </div>

          {deviceAuth && deviceAuth.provider === "openai" && (
            <p>
              Visit{" "}
              <a href={deviceAuth.verificationUrl} target="_blank" rel="noreferrer">
                {deviceAuth.verificationUrl}
              </a>{" "}
              and enter code <strong>{deviceAuth.userCode}</strong>.
            </p>
          )}
        </div>

        <div className="credentials-oauth">
          <h3>Factory.ai OAuth</h3>
          <div className="credentials-oauth-row">
            <button type="button" onClick={() => void startFactoryBrowser()}>
              Start browser flow
            </button>
            <button type="button" onClick={() => void startFactoryDevice()}>
              Start device flow
            </button>
            <button type="button" onClick={() => void pollDeviceOAuth()} disabled={!deviceAuth || deviceAuth.provider !== "factory"}>
              {devicePolling && deviceAuth?.provider === "factory" ? "Polling..." : "Poll device flow"}
            </button>
          </div>

          {deviceAuth && deviceAuth.provider === "factory" && (
            <p>
              Visit{" "}
              <a href={deviceAuth.verificationUrl} target="_blank" rel="noreferrer">
                {deviceAuth.verificationUrl}
              </a>{" "}
              and enter code <strong>{deviceAuth.userCode}</strong>.
            </p>
          )}
        </div>

        {status && <p className="status-text">{status}</p>}
        {error && <p className="error-text">{error}</p>}
      </section>

      <section className="credentials-panel">
        <header>
          <h2>Request Logs</h2>
        </header>

        <div className="credentials-log-filters">
          <input
            value={selectedProvider}
            onChange={(event) => setSelectedProvider(event.currentTarget.value)}
            placeholder="filter provider"
          />
          <input
            list="account-ids"
            value={selectedAccount}
            onChange={(event) => setSelectedAccount(event.currentTarget.value)}
            placeholder="filter account"
          />
          <datalist id="account-ids">
            {allAccountIds.map((id) => (
              <option key={id} value={id} />
            ))}
          </datalist>
          <button type="button" onClick={() => void refreshLogs()}>
            Refresh logs
          </button>
        </div>

        <div className="credentials-log-table">
          {logs.map((entry) => (
            <article key={entry.id}>
              <header>
                <strong>{entry.providerId}/{entry.accountId}</strong>
                <span>{entry.status} · {entry.latencyMs}ms</span>
              </header>
              <p>
                {entry.model} · {entry.upstreamMode} · {formatServiceTier(entry)} · {new Date(entry.timestamp).toLocaleString()}
                {typeof entry.totalTokens === "number" ? ` · ${entry.totalTokens} tok` : ""}
              </p>
              {entry.error && <small>{entry.error}</small>}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
