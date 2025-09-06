import { chromium } from 'playwright';
import type { Response, Browser, BrowserContext, Page } from 'playwright';
import type { ExecutionContext } from 'ava';
let browser: Browser | null = null;
let activeContextCount = 0;

const launchBrowser = async (): Promise<Browser> =>
    (browser ??= await chromium.launch({
        headless: !process.env.HEADED,
        args: process.env.CI ? ['--disable-dev-shm-usage'] : [],
    }));

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
        activeContextCount = Math.max(0, activeContextCount - 1);
        if (activeContextCount === 0) {
            await shutdown();
        }
    };
    activeContextCount += 1;
    return { context, page, close };
};

export const shutdown = async (): Promise<void> => {
    if (browser) {
        await browser.close();
        browser = null;
    }
};

export type BrowserTestDeps = {
    url: (path?: string) => string;
    pageGoto: (path?: string) => Promise<Response | null>;
};

export type BrowserTestFn = (t: ExecutionContext, deps: BrowserTestDeps) => Promise<void>;
