// packages/test-harness/src/with-page.ts
import type { ExecutionContext, Macro } from 'ava';
import type { Page } from 'playwright';

import { newIsolatedPage } from './browser.js';

export type PageGoto = (path?: string) => ReturnType<Page['goto']>;
export type BaseUrlSupplier = () => string | undefined;
export type Deps = {
    baseUrl: string | undefined;
    url: (path?: string) => string;
    pageGoto: PageGoto;
    page: Page;
};

export type PageTestFn = (t: ExecutionContext, deps: Deps) => Promise<void>;

export const withPage: Macro<[{ baseUrl?: string | BaseUrlSupplier }, PageTestFn]> = {
    title: (ttl = '', _opt, _fn) => ttl || 'withPage',
    exec: async (t, { baseUrl }, fn) => {
        const supplied = typeof baseUrl === 'function' ? baseUrl() : baseUrl;
        const { page, close } = await newIsolatedPage();

        const url = (path = '/') => (supplied ? new URL(path, supplied).toString() : path);
        const pageGoto: PageGoto = (path = '/') => page.goto(url(path), { waitUntil: 'domcontentloaded' });

        try {
            await fn(t, { baseUrl: supplied, url, pageGoto, page });
        } finally {
            await close();
        }
    },
};
