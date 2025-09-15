import fs from "node:fs";
import path from "node:path";

import YAML from "yaml";
import { z } from "zod";
import pMemoize from "p-memoize";

export type Registry<T> = {
  readonly get: (provider: string, tenant: string) => Promise<T>;
  readonly list: (provider?: string) => Promise<readonly T[]>;
};

type ProviderLike = {
  readonly provider: string;
  readonly tenant: string;
};

export function fileBackedRegistry<T extends ProviderLike>({
  configPath = path.resolve(process.cwd(), "config/providers.yml"),
  schema,
  map = (p: unknown) => p as T,
}: {
  readonly configPath?: string;
  readonly schema: z.ZodType<{ providers: ReadonlyArray<unknown> }>;
  readonly map?: (p: unknown) => T;
}): Registry<T> {
  const load = pMemoize(async (): Promise<readonly T[]> => {
    const file = fs.readFileSync(configPath, "utf8");
    const raw: unknown = YAML.parse(file);
    const parsed = schema.parse(raw);
    return parsed.providers.map(map);
  });

  const get = async (provider: string, tenant: string): Promise<T> => {
    const all = await load();
    const found = all.find(
      (p) => p.provider === provider && p.tenant === tenant,
    );
    if (!found)
      throw new Error(`Provider tenant not found: ${provider}/${tenant}`);
    return found;
  };

  const list = async (provider?: string): Promise<readonly T[]> => {
    const all = await load();
    return provider ? all.filter((p) => p.provider === provider) : all;
  };

  return { get, list };
}
