// SPDX-License-Identifier: GPL-3.0-only
export async function httpFetch(url: string, opts?: RequestInit) {
    return fetch(url, opts);
}
