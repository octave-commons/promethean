import path from 'node:path';

import { z } from 'zod';
import { fileBackedRegistry as makeFileBackedRegistry } from '@promethean/utils';

// Define the schema first, then infer the TS type from it to
// keep runtime validation and static types perfectly aligned.

export type ProviderRegistry = {
    get(provider: string, tenant: string): Promise<ProviderTenant>;
    list(provider?: string): Promise<readonly ProviderTenant[]>;
};

const CredentialsSchema = z.record(z.string());
const ProviderTenantSchema = z.object({
    provider: z.string().min(1),
    tenant: z.string().min(1),
    credentials: CredentialsSchema,
    allow: z
        .object({
            spaces: z.array(z.string()).optional(),
            users: z.array(z.string()).optional(),
            kinds: z.array(z.string()).optional(),
        })
        .optional(),
    storage: z.object({ mongo_db: z.string().min(1), chroma_ns: z.string().min(1) }),
    rate: z
        .object({
            max_concurrent: z.number().int().positive().optional(),
            bucket_overrides: z.record(z.string()).optional(),
        })
        .optional(),
    extra: z.record(z.any()).optional(),
});

export type ProviderTenant = z.infer<typeof ProviderTenantSchema>;

export const ProvidersFileSchema = z.object({ providers: z.array(ProviderTenantSchema) });

export function fileBackedRegistry(configPath = path.resolve(process.cwd(), 'config/providers.yml')): ProviderRegistry {
    return makeFileBackedRegistry<ProviderTenant>({
        configPath,
        schema: ProvidersFileSchema,
        map: (p) => ({
            ...(p as ProviderTenant),
            credentials: Object.fromEntries(
                Object.entries((p as ProviderTenant).credentials).map(([k, v]) => [k, expandEnv(String(v))]),
            ),
        }),
    });
}

export function expandEnv(value: string): string {
    // supports ${VAR} expansion; leaves unknowns as-is
    return value.replace(/\$\{([A-Z0-9_]+)\}/g, (_: string, name: string) => process.env[name] ?? '');
}
