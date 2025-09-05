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
  allowAgentIds?: string[];
  allowPatterns?: string[];
};

export type PolicyContext = {
  subject: string;
  action?: string;
  resource?: string;
  capability?: Capability;
};

export type PolicyRule = (ctx: PolicyContext) => Promise<void> | void;

// packages/security/src/policy.ts

export type PolicyConfig = {
  readonly permissionGate?: (subject: string, action: string) => boolean | Promise<boolean>;
  readonly providerAccess?: Readonly<ProviderAccessRule>;
  readonly rules?: readonly PolicyRule[];
};

export function makePolicy(config: PolicyConfig = {}): PolicyChecker {
  const rules: PolicyRule[] = [];
  if (config.permissionGate)
    rules.push(permissionGateRule(config.permissionGate));
  if (config.providerAccess)
    rules.push(providerAccessRule(config.providerAccess));
  if (config.rules)
    rules.push(...config.rules);

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
  return ({ subject, capability }) => {
    if (!capability || !capability.kind.startsWith('provider.')) return;
    if (rule.allowAgentIds?.includes(subject)) return;
    if (rule.allowPatterns) {
      for (const pat of rule.allowPatterns) {
        const re = globToRegExp(pat);
        if (re.test(subject)) return;
      }
    }
    throw new NotAllowedError(
      `Policy denied ${capability.kind} for agent ${subject}`,
    );
  };
}

function globToRegExp(pat: string): RegExp {
  const escaped = pat
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`);
}

async function runRules(ctx: PolicyContext, rules: PolicyRule[]) {
  for (const rule of rules) {
    await rule(ctx);
  }
}
