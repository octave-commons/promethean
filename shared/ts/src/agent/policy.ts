export type Capability =
    | { kind: 'provider.gateway.connect'; provider: string; tenant: string }
    | { kind: 'provider.rest.call'; provider: string; tenant: string; route: string }
    | { kind: 'storage.mongo'; db: string; coll: string }
    | { kind: 'embed.text'; model: string }
    | { kind: 'embed.image'; model: string }
    | { kind: 'http.fetch'; url: string; method?: string };

export type PolicyCheck = (agentId: string, cap: Capability) => Promise<void>;

export type ProviderAccessRule = {
    // literal agent ids or glob-like patterns e.g. services/ts/discord-*/
    allowAgentIds?: string[];
    allowPatterns?: string[];
};

export function makePolicy(rules: { providerAccess: ProviderAccessRule }): PolicyCheck {
    const { providerAccess } = rules;
    return async (agentId: string, cap: Capability) => {
        if (cap.kind.startsWith('provider.')) {
            if (isAllowed(agentId, providerAccess)) return;
            throw new Error(`Policy denied ${cap.kind} for agent ${agentId}`);
        }
        // other caps allowed by default; integrate with shared/permissions.yaml if needed
    };
}

function isAllowed(agentId: string, rule: ProviderAccessRule): boolean {
    if (rule.allowAgentIds?.includes(agentId)) return true;
    if (rule.allowPatterns) {
        for (const pat of rule.allowPatterns) {
            const re = globToRegExp(pat);
            if (re.test(agentId)) return true;
        }
    }
    return false;
}

function globToRegExp(pat: string): RegExp {
    const escaped = pat.replace(/[.+^${}()|\[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`);
}
