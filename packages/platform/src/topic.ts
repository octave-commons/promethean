// SPDX-License-Identifier: GPL-3.0-only
export const topic = (p: { provider: string; tenant: string; area: string; name: string }) =>
    `promethean.p.${p.provider}.t.${p.tenant}.${p.area}.${p.name}`;
