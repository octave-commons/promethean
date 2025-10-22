export type GetFilesOptions = {
  readonly maxDepth?: number;
  readonly maxEntries?: number;
  readonly exts?: string;
  readonly includeMeta?: boolean;
};

export async function getFiles(
  dir: string,
  opts: GetFilesOptions = {},
): Promise<unknown> {
  const params = new URLSearchParams({ dir });
  if (opts.maxDepth !== undefined)
    params.set("maxDepth", String(opts.maxDepth));
  if (opts.maxEntries !== undefined)
    params.set("maxEntries", String(opts.maxEntries));
  if (opts.exts) params.set("exts", opts.exts);
  if (opts.includeMeta) params.set("includeMeta", "1");

  const res = await fetch(`/api/files?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function readFileText(dir: string, file: string): Promise<string> {
  const params = new URLSearchParams({ dir, file });
  const res = await fetch(`/api/read?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const msg =
      typeof data.error === "string" ? String(data.error) : res.statusText;
    throw new Error(msg);
  }
  return res.text();
}

export async function searchSemantic(
  q: string,
  collection: string,
  k = 10,
): Promise<unknown> {
  const params = new URLSearchParams({ q, collection, k: String(k) });
  const res = await fetch(`/api/search?${params.toString()}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export type GetStatusOptions = {
  readonly limit?: number;
  readonly page?: number;
  readonly onlyIncomplete?: boolean;
};

export async function getStatus(
  dir: string,
  opts: GetStatusOptions = {},
): Promise<unknown> {
  const params = new URLSearchParams({ dir });
  if (opts.limit !== undefined) params.set("limit", String(opts.limit));
  if (opts.page !== undefined) params.set("page", String(opts.page));
  if (opts.onlyIncomplete) params.set("onlyIncomplete", "1");
  const res = await fetch(`/api/status?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}
