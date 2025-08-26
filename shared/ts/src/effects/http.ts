export async function httpFetch(url: string, opts?: RequestInit) {
    return fetch(url, opts);
}
