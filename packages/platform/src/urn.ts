// SPDX-License-Identifier: GPL-3.0-only
export const toUrn = (provider: string, kind: string, tenant: string, id: string) =>
    `urn:${provider}:${kind}:${tenant}:${id}`;

export const fromUrn = (urn: string) => {
    const [_, provider, kind, tenant, id] = urn.split(':');
    return { provider, kind, tenant, id };
};
