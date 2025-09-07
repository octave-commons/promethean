import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { ProviderRegistry, ProviderTenant, ProvidersFileSchema, expandEnv } from './provider-registry.js';

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
