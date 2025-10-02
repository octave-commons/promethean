// GPL-3.0-only
import type { Macro, ExecutionContext } from 'ava';

import { startProcess } from './startProcess.js';
import { ProcSpec } from './process.js';
import { newIsolatedPage } from './browser.js';
import { PageGoto } from './page.js';

export type E2EDeps = {
    baseUrl: string | undefined; // provide one if your service is HTTP
    url: (path?: string) => string; // builds from baseUrl; if missing, returns the input
    pageGoto: PageGoto; // safe even if baseUrl is undefined if you pass absolute URLs
    procPid: number;
};
export type E2ETestFn = (t: ExecutionContext, deps: E2EDeps) => Promise<void>;

export const mkUrlBuilder =
    (baseUrl?: string): ((path?: string) => string) =>
    (path = '/') =>
        baseUrl ? new URL(path, baseUrl).toString() : path;

export const withE2EContext: Macro<[ProcSpec & { baseUrl: string | undefined }, E2ETestFn]> = {
    title: (ttl = '', _spec, _fn) => ttl || 'withProcAndPage',
    exec: async (t, spec, fn) => {
        const { baseUrl, ...procSpec } = spec;
        const { proc, stop } = await startProcess(procSpec);
        const { page, close } = await newIsolatedPage();

        const url = mkUrlBuilder(baseUrl);
        const pageGoto: PageGoto = (path = '/') => page.goto(url(path), { waitUntil: 'domcontentloaded' });

        try {
            await fn(t, { baseUrl, url, pageGoto, procPid: proc.pid ?? -1 });
        } finally {
            await close();
            await stop();
        }
    },
};
