import type { ReadonlyDeep } from 'type-fest';

export async function httpFetch(url: string, opts?: ReadonlyDeep<RequestInit>): Promise<Response> {
    return fetch(url, opts as unknown as RequestInit | undefined);
}
