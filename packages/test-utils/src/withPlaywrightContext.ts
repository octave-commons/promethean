import type { Macro } from 'ava';

import { BrowserTestFn, newIsolatedPage } from './browser.js';

export const withPlaywrightContext: Macro<[BrowserTestFn]> = {
    exec: async (t, fn) => {
        const { page, close } = await newIsolatedPage();
        const base = process.env.APP_BASE_URL ?? 'http://localhost:3000/';
        const url = (path = '/') => new URL(path, base).toString();
        const pageGoto = (path = '/') => page.goto(url(path), { waitUntil: 'domcontentloaded' });

        await Promise.resolve(fn(t, { page, url, pageGoto })).finally(() => close());
    },
    title: (providedTitle = '', _fn) => providedTitle || 'withContext',
};
