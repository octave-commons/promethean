export const CREATE_ACCOUNT_HEALTH_TABLE = `
CREATE TABLE IF NOT EXISTS account_health (
  provider_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  success_count BIGINT NOT NULL DEFAULT 0,
  failure_count BIGINT NOT NULL DEFAULT 0,
  last_success_at BIGINT,
  last_failure_at BIGINT,
  last_error TEXT,
  last_status INTEGER,
  updated_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  PRIMARY KEY (provider_id, account_id)
);
`;

export const CREATE_ACCOUNT_HEALTH_INDEX = `
CREATE INDEX IF NOT EXISTS idx_account_health_score ON account_health(
  (success_count::FLOAT / NULLIF(success_count + failure_count, 0)) DESC NULLS LAST
);
`;

export const SCHEMA_VERSION = 4;

export const CREATE_TENANTS_TABLE = `
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  settings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

export const CREATE_USERS_TABLE = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  subject TEXT NOT NULL UNIQUE,
  login TEXT,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);
`;

export const CREATE_TENANT_MEMBERSHIPS_TABLE = `
CREATE TABLE IF NOT EXISTS tenant_memberships (
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, user_id)
);
`;

export const CREATE_TENANT_API_KEYS_TABLE = `
CREATE TABLE IF NOT EXISTS tenant_api_keys (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  prefix TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  scopes JSONB NOT NULL DEFAULT '["proxy:use"]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);
`;

export const CREATE_TENANT_API_KEYS_TENANT_INDEX = `
CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_tenant ON tenant_api_keys(tenant_id);
`;

export const CREATE_TENANT_API_KEYS_HASH_INDEX = `
CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_hash ON tenant_api_keys(token_hash);
`;

export const CREATE_PROVIDERS_TABLE = `
CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY,
  auth_type TEXT NOT NULL DEFAULT 'api_key',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

export const CREATE_ACCOUNTS_TABLE = `
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT NOT NULL,
  provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at BIGINT,
  chatgpt_account_id TEXT,
  plan_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, provider_id)
);
`;

export const CREATE_ACCOUNTS_INDEX = `
CREATE INDEX IF NOT EXISTS idx_accounts_provider_id ON accounts(provider_id);
`;

export const CREATE_COOLDOWN_TABLE = `
CREATE TABLE IF NOT EXISTS account_cooldown (
  provider_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  cooldown_until BIGINT NOT NULL,
  PRIMARY KEY (provider_id, account_id)
);
`;

export const CREATE_SESSIONS_TABLE = `
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  client_id TEXT NOT NULL,
  scopes JSONB NOT NULL DEFAULT '[]',
  resource TEXT,
  extra JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at BIGINT NOT NULL
);
`;

export const CREATE_ACCESS_TOKENS_TABLE = `
CREATE TABLE IF NOT EXISTS access_tokens (
  token TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  scopes JSONB NOT NULL DEFAULT '[]',
  resource TEXT,
  extra JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at BIGINT NOT NULL
);
`;

export const CREATE_REFRESH_TOKENS_TABLE = `
CREATE TABLE IF NOT EXISTS refresh_tokens (
  token TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  scopes JSONB NOT NULL DEFAULT '[]',
  resource TEXT,
  extra JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at BIGINT NOT NULL
);
`;

export const CREATE_GITHUB_ALLOWLIST_TABLE = `
CREATE TABLE IF NOT EXISTS github_allowlist (
  login TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

export const CREATE_CLIENTS_TABLE = `
CREATE TABLE IF NOT EXISTS clients (
  client_id TEXT PRIMARY KEY,
  client_secret TEXT NOT NULL,
  client_name TEXT NOT NULL,
  redirect_uris JSONB NOT NULL,
  token_endpoint_auth_method TEXT NOT NULL DEFAULT 'client_secret_basic',
  grant_types JSONB NOT NULL DEFAULT '["authorization_code","refresh_token"]',
  response_types JSONB NOT NULL DEFAULT '["code"]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

export const CREATE_VERSION_TABLE = `
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

export const INSERT_VERSION = `
INSERT INTO schema_version (version) VALUES ($1)
ON CONFLICT (version) DO NOTHING;
`;

export const CHECK_VERSION_EXISTS = `
SELECT 1 FROM schema_version WHERE version = $1;
`;

export const CREATE_MODELS_TABLE = `
CREATE TABLE IF NOT EXISTS models (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

export const CREATE_CONFIG_TABLE = `
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

export const ALL_MIGRATIONS = [
  { version: 1, sql: CREATE_PROVIDERS_TABLE },
  { version: 1, sql: CREATE_ACCOUNTS_TABLE },
  { version: 1, sql: CREATE_ACCOUNTS_INDEX },
  { version: 1, sql: CREATE_COOLDOWN_TABLE },
  { version: 1, sql: CREATE_SESSIONS_TABLE },
  { version: 1, sql: CREATE_ACCESS_TOKENS_TABLE },
  { version: 1, sql: CREATE_REFRESH_TOKENS_TABLE },
  { version: 1, sql: CREATE_GITHUB_ALLOWLIST_TABLE },
  { version: 1, sql: CREATE_CLIENTS_TABLE },
  { version: 1, sql: CREATE_VERSION_TABLE },
  { version: 2, sql: CREATE_ACCOUNT_HEALTH_TABLE },
  { version: 2, sql: CREATE_ACCOUNT_HEALTH_INDEX },
  { version: 3, sql: CREATE_MODELS_TABLE },
  { version: 3, sql: CREATE_CONFIG_TABLE },
  { version: 4, sql: CREATE_TENANTS_TABLE },
  { version: 4, sql: CREATE_USERS_TABLE },
  { version: 4, sql: CREATE_TENANT_MEMBERSHIPS_TABLE },
  { version: 4, sql: CREATE_TENANT_API_KEYS_TABLE },
  { version: 4, sql: CREATE_TENANT_API_KEYS_TENANT_INDEX },
  { version: 4, sql: CREATE_TENANT_API_KEYS_HASH_INDEX },
];

export const UPSERT_TENANT = `
INSERT INTO tenants (id, name, status, updated_at)
VALUES ($1, $2, $3, NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  updated_at = NOW();
`;

export const SELECT_ALL_TENANTS = `
SELECT id, name, status
FROM tenants
ORDER BY id;
`;

export const UPSERT_USER = `
INSERT INTO users (id, provider, subject, login, email, name, avatar_url, last_login_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
ON CONFLICT (subject) DO UPDATE SET
  provider = EXCLUDED.provider,
  login = EXCLUDED.login,
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  avatar_url = EXCLUDED.avatar_url,
  last_login_at = NOW(),
  updated_at = NOW()
RETURNING id, provider, subject, login, email, name, avatar_url;
`;

export const SELECT_USER_BY_SUBJECT = `
SELECT id, provider, subject, login, email, name, avatar_url
FROM users
WHERE subject = $1
LIMIT 1;
`;

export const UPSERT_TENANT_MEMBERSHIP = `
INSERT INTO tenant_memberships (tenant_id, user_id, role)
VALUES ($1, $2, $3)
ON CONFLICT (tenant_id, user_id) DO UPDATE SET
  role = EXCLUDED.role;
`;

export const SELECT_TENANT_MEMBERSHIPS_BY_USER = `
SELECT tm.tenant_id, tm.role, t.name AS tenant_name, t.status AS tenant_status
FROM tenant_memberships tm
JOIN tenants t ON t.id = tm.tenant_id
WHERE tm.user_id = $1
ORDER BY tm.tenant_id ASC;
`;

export const COUNT_TENANT_MEMBERSHIPS_FOR_TENANT = `
SELECT COUNT(*)::BIGINT AS count
FROM tenant_memberships
WHERE tenant_id = $1;
`;

export const SELECT_ACTIVE_TENANT_API_KEY_BY_HASH = `
SELECT id, tenant_id, label, prefix, scopes, revoked_at
FROM tenant_api_keys
WHERE token_hash = $1 AND revoked_at IS NULL
LIMIT 1;
`;

export const INSERT_TENANT_API_KEY = `
INSERT INTO tenant_api_keys (id, tenant_id, label, prefix, token_hash, scopes)
VALUES ($1, $2, $3, $4, $5, $6::jsonb);
`;

export const SELECT_TENANT_API_KEYS_BY_TENANT = `
SELECT id, tenant_id, label, prefix, scopes, created_at, last_used_at, revoked_at
FROM tenant_api_keys
WHERE tenant_id = $1
ORDER BY created_at DESC, id ASC;
`;

export const REVOKE_TENANT_API_KEY = `
UPDATE tenant_api_keys
SET revoked_at = NOW()
WHERE tenant_id = $1 AND id = $2 AND revoked_at IS NULL
`;

export const TOUCH_TENANT_API_KEY_LAST_USED = `
UPDATE tenant_api_keys
SET last_used_at = NOW()
WHERE tenant_id = $1 AND id = $2 AND revoked_at IS NULL;
`;

export const UPSERT_PROVIDER = `
INSERT INTO providers (id, auth_type, updated_at)
VALUES ($1, $2, NOW())
ON CONFLICT (id) DO UPDATE SET
  auth_type = EXCLUDED.auth_type,
  updated_at = NOW();
`;

export const INSERT_ACCOUNT = `
INSERT INTO accounts (id, provider_id, token, refresh_token, expires_at, chatgpt_account_id, plan_type, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
ON CONFLICT (id, provider_id) DO UPDATE SET
  token = EXCLUDED.token,
  refresh_token = EXCLUDED.refresh_token,
  expires_at = EXCLUDED.expires_at,
  chatgpt_account_id = EXCLUDED.chatgpt_account_id,
  plan_type = EXCLUDED.plan_type,
  updated_at = NOW();
`;

export const SELECT_ALL_PROVIDERS = `
SELECT id, auth_type FROM providers ORDER BY id;
`;

export const SELECT_ACCOUNTS_BY_PROVIDER = `
SELECT id, provider_id, token, refresh_token, expires_at, chatgpt_account_id, plan_type
FROM accounts
WHERE provider_id = $1
ORDER BY id;
`;

export const SELECT_ALL_ACCOUNTS = `
SELECT id, provider_id, token, refresh_token, expires_at, chatgpt_account_id, plan_type
FROM accounts
ORDER BY provider_id, id;
`;

export const DELETE_ACCOUNT = `
DELETE FROM accounts WHERE id = $1 AND provider_id = $2;
`;

export const SET_COOLDOWN = `
INSERT INTO account_cooldown (provider_id, account_id, cooldown_until)
VALUES ($1, $2, $3)
ON CONFLICT (provider_id, account_id) DO UPDATE SET
  cooldown_until = EXCLUDED.cooldown_until;
`;

export const GET_COOLDOWN = `
SELECT cooldown_until FROM account_cooldown
WHERE provider_id = $1 AND account_id = $2;
`;

export const CLEAR_EXPIRED_COOLDOWNS = `
DELETE FROM account_cooldown WHERE cooldown_until < $1;
`;

export const UPSERT_GITHUB_USER = `
INSERT INTO github_allowlist (login) VALUES ($1)
ON CONFLICT (login) DO NOTHING;
`;

export const DELETE_GITHUB_USER = `
DELETE FROM github_allowlist WHERE login = $1;
`;

export const SELECT_GITHUB_ALLOWLIST = `
SELECT login FROM github_allowlist ORDER BY login;
`;

export const IS_GITHUB_USER_ALLOWED = `
SELECT 1 FROM github_allowlist WHERE login = $1;
`;

export const SELECT_ALL_ACCOUNT_HEALTH = `
SELECT provider_id, account_id, success_count, failure_count, last_success_at, last_failure_at, last_error, last_status
FROM account_health;
`;

export const SELECT_ACCOUNT_HEALTH = `
SELECT provider_id, account_id, success_count, failure_count, last_success_at, last_failure_at, last_error, last_status
FROM account_health
WHERE provider_id = $1 AND account_id = $2;
`;

export const UPSERT_ACCOUNT_HEALTH_SUCCESS = `
INSERT INTO account_health (provider_id, account_id, success_count, last_success_at, last_status, updated_at)
VALUES ($1, $2, 1, $3, $4, $5)
ON CONFLICT (provider_id, account_id) DO UPDATE SET
  success_count = account_health.success_count + 1,
  last_success_at = EXCLUDED.last_success_at,
  last_status = EXCLUDED.last_status,
  updated_at = EXCLUDED.updated_at;
`;

export const UPSERT_ACCOUNT_HEALTH_FAILURE = `
INSERT INTO account_health (provider_id, account_id, failure_count, last_failure_at, last_error, last_status, updated_at)
VALUES ($1, $2, 1, $3, $4, $5, $6)
ON CONFLICT (provider_id, account_id) DO UPDATE SET
  failure_count = account_health.failure_count + 1,
  last_failure_at = EXCLUDED.last_failure_at,
  last_error = EXCLUDED.last_error,
  last_status = EXCLUDED.last_status,
  updated_at = EXCLUDED.updated_at;
`;

export const SELECT_ACCOUNT_HEALTH_SCORES = `
SELECT 
  provider_id, 
  account_id, 
  success_count, 
  failure_count,
  CASE 
    WHEN success_count + failure_count = 0 THEN 0.5
    ELSE success_count::FLOAT / (success_count + failure_count)
  END as health_score
FROM account_health
ORDER BY health_score DESC;
`;
