import { chromium } from 'playwright';
import type { Response, Browser, BrowserContext, Page } from 'playwright';
import type { ExecutionContext } from 'ava';

const launchBrowser = async (): Promise<Browser> =>
    chromium.launch({
        headless: !process.env.HEADED,
        args: process.env.CI ? ['--disable-dev-shm-usage'] : [],
    });

export const getBrowser = async (): Promise<Browser> => launchBrowser();

export const newIsolatedPage = async (): Promise<{
    context: BrowserContext;
    page: Page;
    close: () => Promise<void>;
}> => {
    const b = await getBrowser();
    const context = await b.newContext(); // isolation == separate profile
    const page = await context.newPage();
    const close = async () => {
        await context.close();
        await b.close();
    };
    return { context, page, close };
};

export const shutdown = async (): Promise<void> => {
    // No-op: browsers are closed per isolated page
};

export type BrowserTestDeps = {
    url: (path?: string) => string;
    pageGoto: (path?: string) => Promise<Response | null>;
    page: Page;
};

export type BrowserTestFn = (t: ExecutionContext, deps: BrowserTestDeps) => Promise<void>;
