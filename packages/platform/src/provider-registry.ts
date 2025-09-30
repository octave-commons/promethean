import path from 'node:path';

import { z } from 'zod';
import type { ReadonlyDeep } from 'type-fest';
import { fileBackedRegistry as makeFileBackedRegistry } from '@promethean/utils';

// Define the schema first, then infer the TS type from it to
// keep runtime validation and static types perfectly aligned.

type MutableProviderTenant = z.infer<typeof ProviderTenantSchema>;

export type ProviderTenant = ReadonlyDeep<MutableProviderTenant>;

export type ProviderEnv = ReadonlyDeep<Record<string, string | undefined>>;

export type ProviderRegistry = {
    get(provider: string, tenant: string): Promise<ProviderTenant>;
    list(provider?: string): Promise<ReadonlyArray<ProviderTenant>>;
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
    extra: z.record(z.unknown()).optional(),
});

export const ProvidersFileSchema = z.object({ providers: z.array(ProviderTenantSchema) });
const defaultConfigPath = path.resolve(process.cwd(), 'config/providers.yml');

export function fileBackedRegistry(
    configPath: string = defaultConfigPath,
    env: ProviderEnv = process.env,
): ProviderRegistry {
    return makeFileBackedRegistry<ProviderTenant>({
        configPath,
        schema: ProvidersFileSchema,
        map: (provider) => toProviderTenant(provider, env),
    });
}

const toProviderTenant = (provider: unknown, env: ProviderEnv): ProviderTenant => {
    const parsed = ProviderTenantSchema.parse(provider);

    const credentials = Object.fromEntries(
        Object.entries(parsed.credentials).map(([key, rawValue]) => [key, expandEnv(String(rawValue), env)]),
    );

    return freezeDeep({
        ...parsed,
        credentials,
    });
};

const freezeDeep = <T>(value: T): ReadonlyDeep<T> => {
    if (typeof value !== 'object' || value === null) {
        return value as ReadonlyDeep<T>;
    }

    if (Array.isArray(value)) {
        return Object.freeze((value as unknown[]).map((item) => freezeDeep(item)) as unknown as T) as ReadonlyDeep<T>;
    }

    const frozenEntries = Object.entries(value as Record<PropertyKey, unknown>).map(([key, inner]) => [
        key,
        freezeDeep(inner),
    ]);

    return Object.freeze(Object.fromEntries(frozenEntries) as unknown as T) as ReadonlyDeep<T>;
};

export function expandEnv(value: string, env: ProviderEnv = process.env): string {
    // supports ${VAR} expansion; leaves unknowns as-is
    return value.replace(/\$\{([A-Z0-9_]+)\}/g, (_: string, name: string) => env[name] ?? '');
}
