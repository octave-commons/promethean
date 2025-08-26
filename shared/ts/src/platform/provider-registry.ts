import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import YAML from 'yaml';

export type ProviderTenant = {
    provider: string;
    tenant: string;
    credentials: Record<string, string>;
    allow?: { spaces?: string[]; users?: string[]; kinds?: string[] };
    storage: { mongo_db: string; chroma_ns: string };
    rate?: { max_concurrent?: number; bucket_overrides?: Record<string, string> };
    extra?: Record<string, any>;
};

export interface ProviderRegistry {
    get(provider: string, tenant: string): Promise<ProviderTenant>;
    list(provider?: string): Promise<ProviderTenant[]>;
}

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

const ProvidersFileSchema = z.object({ providers: z.array(ProviderTenantSchema) });

export function fileBackedRegistry(configPath = path.resolve(process.cwd(), 'config/providers.yml')): ProviderRegistry {
    let cache: ProviderTenant[] | null = null;

    async function load(): Promise<ProviderTenant[]> {
        if (cache) return cache;
        const file = fs.readFileSync(configPath, 'utf8');
        const raw = YAML.parse(file);
        const parsed = ProvidersFileSchema.parse(raw);
        cache = parsed.providers.map((p) => ({
            ...p,
            credentials: Object.fromEntries(Object.entries(p.credentials).map(([k, v]) => [k, expandEnv(String(v))])),
        }));
        return cache;
    }

    async function get(provider: string, tenant: string): Promise<ProviderTenant> {
        const all = await load();
        const found = all.find((p) => p.provider === provider && p.tenant === tenant);
        if (!found) throw new Error(`Provider tenant not found: ${provider}/${tenant}`);
        return found;
    }

    async function list(provider?: string): Promise<ProviderTenant[]> {
        const all = await load();
        return provider ? all.filter((p) => p.provider === provider) : all;
    }

    return { get, list };
}

function expandEnv(value: string): string {
    // supports ${VAR} expansion; leaves unknowns as-is
    return value.replace(/\$\{([A-Z0-9_]+)\}/g, (_, name) => process.env[name] ?? '');
}
