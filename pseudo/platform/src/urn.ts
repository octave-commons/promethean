export const toUrn = (provider: string, kind: string, tenant: string, id: string): string =>
    `urn:${provider}:${kind}:${tenant}:${id}`;

export type UrnParts = {
    readonly provider: string;
    readonly kind: string;
    readonly tenant: string;
    readonly id: string;
};

export const fromUrn = (urn: string): UrnParts => {
    const [prefix, provider, kind, tenant, id] = urn.split(':');

    if (prefix !== 'urn' || provider === undefined || kind === undefined || tenant === undefined || id === undefined) {
        throw new Error(`Invalid provider URN: ${urn}`);
    }

    return { provider, kind, tenant, id };
};
