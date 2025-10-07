export class NotAllowedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotAllowedError';
  }
}

export type Capability =
  | { kind: 'provider.gateway.connect'; provider: string; tenant: string }
  | { kind: 'provider.rest.call'; provider: string; tenant: string; route: string }
  | { kind: 'storage.mongo'; db: string; coll: string }
  | { kind: 'embed.text'; model: string }
  | { kind: 'embed.image'; model: string }
  | { kind: 'http.fetch'; url: string; method?: string };

export type PolicyChecker = {
  assertAllowed: (
    subject: string,
    action: string,
    resource?: string,
  ) => Promise<void>;
  checkCapability: (agentId: string, cap: Capability) => Promise<void>;
};

export type ProviderAccessRule = {
  readonly allowAgentIds?: readonly string[];
  readonly allowPatterns?: readonly string[];
};

export type PolicyContext = {
  readonly subject: string;
  readonly action?: string;
  readonly resource?: string;
  readonly capability?: Readonly<Capability>;
};

export type PolicyRule = (ctx: Readonly<PolicyContext>) => Promise<void> | void;

// packages/security/src/policy.ts

export type PolicyConfig = {
  readonly permissionGate?: (subject: string, action: string) => boolean | Promise<boolean>;
  readonly providerAccess?: Readonly<ProviderAccessRule>;
  readonly rules?: readonly PolicyRule[];
};

export function makePolicy(config: PolicyConfig = {}): PolicyChecker {
  const rules: readonly PolicyRule[] = [
    ...(config.permissionGate ? [permissionGateRule(config.permissionGate)] : []),
    ...(config.providerAccess ? [providerAccessRule(config.providerAccess)] : []),
    ...(config.rules ?? []),
  ];

  return {
    async assertAllowed(subject: string, action: string, resource?: string) {
      const ctx: PolicyContext =
        resource === undefined
          ? { subject, action }
          : { subject, action, resource };
      await runRules(ctx, rules);
    },
    async checkCapability(agentId: string, cap: Capability) {
      await runRules({ subject: agentId, capability: cap }, rules);
    },
  };
}

function permissionGateRule(
  checkPermission: (subject: string, action: string) => boolean | Promise<boolean>,
): PolicyRule {
  return async ({ subject, action }) => {
    if (!action) return;
    const ok = await checkPermission(subject, action);
    if (!ok) throw new NotAllowedError('Permission denied');
  };
}

function providerAccessRule(rule: ProviderAccessRule): PolicyRule {
  const allowIdSet = new Set(rule.allowAgentIds ?? []);
  const allowRegexes = (rule.allowPatterns ?? []).map(globToRegExp);
  return ({ subject, capability }) => {
    if (!capability || !capability.kind.startsWith('provider.')) return;
    if (allowIdSet.has(subject)) return;
    if (allowRegexes.some((re) => re.test(subject))) return;
    throw new NotAllowedError(`Policy denied ${capability.kind} for agent ${subject}`);
  };
}

const GLOB_SPECIALS = /[\\^$+?.()|[\]{}]/g;

function globToRegExp(pat: string): RegExp {
  const normalized = pat.trim();
  if (normalized.length > 256) throw new NotAllowedError('Pattern too long');
  const escaped = normalized
    .replace(GLOB_SPECIALS, (char) => `\\${char}`)
    .replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`);
}

async function runRules(
  ctx: Readonly<PolicyContext>,
  rules: ReadonlyArray<PolicyRule>,
) {
  await rules.reduce<Promise<void>>(async (p, rule) => {
    await p;
    await rule(ctx);
  }, Promise.resolve());
}
